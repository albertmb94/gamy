import { useState } from 'react';
import { Crown, Pencil, Trash2, Save, X, Target, ScrollText, Spade, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRemigioStore } from '../store/useRemigioStore';
import { statusLabel } from '../remigio/engine';
import { cn } from '../utils/cn';
import { Game, Player } from '../types';
import {
  DUEL_PAD_EXCLUDED_METADATA,
  DUEL_PAD_METADATA_ORDER,
  DUEL_PAD_ROW_LABELS,
  buildDuelPadCategories,
  getDuelPadRowStyle,
  isDuelPadCategoryKind,
  supremacyMetaFor,
} from '../utils/duelPad';

type Entry =
  | { kind: 'match'; date: string; id: string }
  | { kind: 'remigio'; date: string; id: string };

export default function History() {
  const { matches, games, players, deleteMatch, updateMatch } = useStore();
  const remigioSessions = useRemigioStore(s => s.sessions);
  const openRemigioModule = useRemigioStore(s => s.openModule);
  const openRemigioSession = useRemigioStore(s => s.openSession);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingScores, setEditingScores] = useState<Record<string, Record<string, number>> | null>(null);
  const [filterGameId, setFilterGameId] = useState('');

  const baseGames = games.filter(g => !g.isExpansion);
  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredMatches = sortedMatches.filter(m => {
    if (filterGameId && m.gameId !== filterGameId && filterGameId !== 'remigio') return false;
    if (filterGameId === 'remigio') return false;
    return true;
  });

  const showRemigio = filterGameId === '' || filterGameId === 'remigio';
  const entries: Entry[] = [
    ...filteredMatches.map(m => ({ kind: 'match' as const, date: m.date, id: m.id })),
    ...(showRemigio ? remigioSessions.map(s => ({ kind: 'remigio' as const, date: s.created_at, id: s.id })) : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openRemigio = (id: string) => { openRemigioModule(); openRemigioSession(id); };

  const detailMatch = detailId ? matches.find(m => m.id === detailId) : null;
  const detailGame = detailMatch ? games.find(g => g.id === detailMatch.gameId) : null;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const startEdit = () => {
    if (!detailMatch) return;
    const scores: Record<string, Record<string, number>> = {};
    detailMatch.playerScores.forEach(ps => {
      scores[ps.playerId] = { ...ps.scores };
    });
    setEditingScores(scores);
  };

  const saveEdit = () => {
    if (!detailMatch || !editingScores || !detailGame) return;
    const allCats = [...detailGame.scoringTemplate.categories];
    detailMatch.activeExpansionIds.forEach(eid => {
      const exp = games.find(g => g.id === eid);
      if (exp) allCats.push(...exp.scoringTemplate.categories);
    });

    const updatedScores = detailMatch.playerScores.map(ps => ({
      ...ps,
      scores: editingScores[ps.playerId] || ps.scores,
      total: allCats.reduce((sum, cat) => sum + (editingScores[ps.playerId]?.[cat.id] || 0), 0),
    }));

    let winnerId = detailMatch.winnerId;
    const hasSpecial = updatedScores.some(ps => ps.specialVictory);
    if (!hasSpecial) {
      let max = -Infinity;
      updatedScores.forEach(ps => {
        if (ps.total > max) { max = ps.total; winnerId = ps.playerId; }
      });
    }

    updateMatch(detailMatch.id, { playerScores: updatedScores, winnerId });
    setEditingScores(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Historial</h2>
          <p className="text-sm text-muted-foreground">{matches.length + remigioSessions.length} partidas registradas</p>
        </div>
      </div>

      {/* Filter chips estilo reproductor */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button onClick={() => setFilterGameId('')} className={`chip whitespace-nowrap ${!filterGameId ? 'chip-active' : ''}`}>Todas</button>
        <button onClick={() => setFilterGameId('remigio')} className={`chip whitespace-nowrap ${filterGameId === 'remigio' ? 'chip-active' : ''}`}>🃏 Remigio</button>
        {baseGames.map(g => (
          <button key={g.id} onClick={() => setFilterGameId(g.id)}
            className={`chip whitespace-nowrap ${filterGameId === g.id ? 'chip-active' : ''}`}>
            {g.name}
          </button>
        ))}
      </div>

      {/* Track-list: cada partida como una "canción" con índice y duración */}
      <div className="glass-card overflow-hidden divide-y divide-border">
        {entries.map((entry, idx) => {
          if (entry.kind === 'remigio') {
            const session = remigioSessions.find(s => s.id === entry.id);
            if (!session) return null;
            const winner = session.players.find(p => p.id === session.winner_id);
            return (
              <button key={`r-${session.id}`} onClick={() => openRemigio(session.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/60 transition-colors animate-fade-in">
                <span className="text-xs font-bold text-muted-foreground w-6 text-center tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Spade className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">Remigio · {session.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {statusLabel(session.status)} · {session.rounds.length} rondas {winner ? `· ${winner.guest_name}` : ''}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">{formatDate(session.created_at)}</span>
              </button>
            );
          }

          const match = matches.find(m => m.id === entry.id);
          if (!match) return null;
          const game = games.find(g => g.id === match.gameId);
          const winner = players.find(p => p.id === match.winnerId);

          return (
            <button key={match.id} onClick={() => setDetailId(match.id)}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/60 transition-colors animate-fade-in">
              <span className="text-xs font-bold text-muted-foreground w-6 text-center tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-zinc-100 to-zinc-200">
                {game?.imageUrl ? (
                  <img src={game.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">🎲</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{game?.name || 'Desconocido'}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {winner ? `${winner.name} · ` : ''}{match.playerIds.length} jugadores
                  {match.activeExpansionIds.length > 0 ? ` · +${match.activeExpansionIds.length}` : ''}
                </p>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">{formatDate(match.date)}</span>
            </button>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-16 glass-card">
          <ScrollText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">No hay partidas registradas</p>
        </div>
      )}

      {/* Match Detail Modal */}
      {detailMatch && detailGame && (
        <div className="modal-overlay" onClick={() => { setDetailId(null); setEditingScores(null); }}>
          <div className="modal-panel p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { setDetailId(null); setEditingScores(null); }}
                className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="text-center leading-tight">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Partida</p>
                <p className="text-sm font-bold text-foreground">{detailGame.name}</p>
              </div>
              <button onClick={() => { setDetailId(null); setEditingScores(null); }}
                className="w-9 h-9 rounded-full bg-card border border-border text-foreground flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-1 text-center">{formatDate(detailMatch.date)}</p>
            {detailMatch.activeExpansionIds.length > 0 && (
              <p className="text-xs text-muted-foreground mb-2 text-center">
                + {detailMatch.activeExpansionIds.map(id => games.find(g => g.id === id)?.name).join(', ')}
              </p>
            )}

            {detailMatch.firstPlayerId && (
              <p className="text-xs text-muted-foreground mb-3 flex items-center justify-center gap-1">
                <Target className="h-3.5 w-3.5" /> Primer turno: <span className="text-foreground font-semibold">{players.find(p => p.id === detailMatch.firstPlayerId)?.name}</span>
              </p>
            )}

            {isDuelPadMatch(detailGame) ? (
              <>
                <DuelPadReadonly
                  game={detailGame}
                  detailMatch={detailMatch}
                  allPlayers={players}
                  editingScores={editingScores}
                  setEditingScores={setEditingScores}
                />
                <DuelSupremacySummary match={detailMatch} allPlayers={players} />
              </>
            ) : (
              <div className="space-y-2 mb-4">
                {detailMatch.playerScores
                  .sort((a, b) => (b.total || 0) - (a.total || 0))
                  .map((ps, idx) => {
                    const player = players.find(p => p.id === ps.playerId);
                    if (!player) return null;

                    const allCats = [...detailGame.scoringTemplate.categories];
                    detailMatch.activeExpansionIds.forEach(eid => {
                      const exp = games.find(g => g.id === eid);
                      if (exp) allCats.push(...exp.scoringTemplate.categories);
                    });

                    return (
                      <div key={ps.playerId} className={cn('rounded-2xl p-3 border', ps.playerId === detailMatch.winnerId ? 'bg-amber-50 border-amber-200' : 'bg-secondary border-border')}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: player.color }}>
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-foreground font-bold text-sm flex-1">{player.name}</span>
                          <span className="text-lg font-black text-foreground">
                            {ps.specialVictory ? `⚡ ${ps.specialVictory}` : ps.total}
                          </span>
                        </div>

                        {detailGame.scoringTemplate.type === 'complex' && !ps.specialVictory && (
                          <div className="grid grid-cols-3 gap-1">
                            {allCats.map(cat => (
                              <div key={cat.id} className="text-center">
                                <span className="text-[10px] text-muted-foreground block truncate">{cat.name}</span>
                                {editingScores ? (
                                  <input type="number" inputMode="numeric"
                                    value={editingScores[ps.playerId]?.[cat.id] ?? 0}
                                    onChange={e => setEditingScores(prev => prev ? ({
                                      ...prev,
                                      [ps.playerId]: { ...(prev[ps.playerId] || {}), [cat.id]: parseInt(e.target.value) || 0 }
                                    }) : null)}
                                    className="w-full input-field text-center px-1 py-1 text-xs" />
                                ) : (
                                  <span className="text-xs text-foreground font-bold">{ps.scores[cat.id] || 0}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {editingScores ? (
                <>
                  <button onClick={() => setEditingScores(null)} className="btn btn-secondary flex-1 py-3">Cancelar</button>
                  <button onClick={saveEdit} className="btn btn-success flex-1 py-3"><Save className="h-4 w-4" /> Guardar</button>
                </>
              ) : (
                <>
                  <button onClick={startEdit} className="btn btn-secondary flex-1 py-3"><Pencil className="h-4 w-4" /> Editar</button>
                  <button onClick={() => {
                    if (confirm('¿Eliminar esta partida?')) {
                      deleteMatch(detailMatch.id);
                      setDetailId(null);
                    }
                  }} className="btn btn-danger py-3 px-5"><Trash2 className="h-4 w-4" /></button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DuelSupremacySummary({
  match,
  allPlayers,
}: {
  match: { playerScores: Array<{ playerId: string; specialVictory?: string }> };
  allPlayers: Player[];
}) {
  const winnerEntry = match.playerScores.find(ps => ps.specialVictory);
  if (!winnerEntry) return null;
  const supMeta = supremacyMetaFor(winnerEntry.specialVictory || '');
  const style = supMeta ? getDuelPadRowStyle(supMeta) : null;
  const winner = allPlayers.find(p => p.id === winnerEntry.playerId);
  if (!winner || !style) return null;

  return (
    <div className="mt-3 mb-4 rounded-2xl border border-border overflow-hidden">
      <div
        className="flex items-center gap-3 px-3 py-2.5 text-white"
        style={{ backgroundColor: style.bg }}
      >
        <span
          className="inline-flex items-center justify-center shrink-0 rounded"
          style={{ backgroundColor: 'rgba(255,255,255,0.18)', width: 26, height: 26 }}
        >
          {style.icon}
        </span>
        <span className="text-xs font-bold uppercase tracking-wider flex-1">
          {winnerEntry.specialVictory}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
          <Crown className="h-3 w-3" /> {winner.name}
        </span>
      </div>
    </div>
  );
}

function isDuelPadMatch(game: Game): boolean {
  if (game.scoringTemplate.layout === 'duel-pad') return true;
  if (/7\s*wonders\s*duel/i.test(game.name)) return true;
  return false;
}

function DuelPadReadonly({
  game,
  detailMatch,
  allPlayers,
  editingScores,
  setEditingScores,
}: {
  game: Game;
  detailMatch: { playerScores: Array<{ playerId: string; scores: Record<string, number>; total: number; specialVictory?: string }>; activeExpansionIds: string[] };
  allPlayers: Player[];
  editingScores: Record<string, Record<string, number>> | null;
  setEditingScores: React.Dispatch<React.SetStateAction<Record<string, Record<string, number>> | null>>;
}) {
  const defaults = buildDuelPadCategories();
  const orderedCats = (() => {
    const out: { id: string; name: string; metadata?: any }[] = [];
    const seen = new Set<string>();
    const isExcluded = (c: { metadata?: string }) =>
      !!c.metadata && DUEL_PAD_EXCLUDED_METADATA.has(c.metadata as any);
    DUEL_PAD_METADATA_ORDER.forEach(meta => {
      const found = game.scoringTemplate.categories.find(c => c.metadata === meta);
      const def = defaults.find(d => d.metadata === meta);
      const cat = found || def;
      if (cat && !seen.has(cat.id) && !isExcluded(cat)) {
        seen.add(cat.id);
        out.push(cat);
      }
    });
    game.scoringTemplate.categories.forEach(c => {
      if (!seen.has(c.id) && !isExcluded(c)) {
        seen.add(c.id);
        out.push(c);
      }
    });
    return out;
  })();

  const matchPlayers = detailMatch.playerScores
    .map(ps => ({ ...ps, player: allPlayers.find(p => p.id === ps.playerId)! }))
    .filter(ps => ps.player)
    .sort((a, b) => b.total - a.total);

  const headerStyle = getDuelPadRowStyle('wonder_header');

  return (
    <div className="overflow-hidden rounded-2xl border border-black/20 mb-4">
      <div
        className="grid items-stretch border-b-2 border-black/40"
        style={{
          backgroundColor: headerStyle.bg,
          color: '#FFFFFF',
          gridTemplateColumns: `minmax(0, 1.6fr) repeat(${matchPlayers.length}, minmax(0, 1fr))`,
        }}
      >
        <div className="flex items-center justify-center py-3 px-2">
          <span className="text-xs font-bold uppercase tracking-wider">{game.name}</span>
        </div>
        {matchPlayers.map(ps => (
          <div key={ps.player.id} className="flex flex-col items-center justify-center py-3 px-1 border-l border-white/20">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1"
              style={{ backgroundColor: ps.player.color }}>
              {ps.player.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] font-bold truncate max-w-full">
              {ps.player.id === detailMatch.playerScores.find(p => p.total === Math.max(...detailMatch.playerScores.map(x => x.total)))?.playerId ? '🏆 ' : ''}
              {ps.player.name}
            </span>
          </div>
        ))}
      </div>
      {orderedCats.map(cat => {
        const meta = cat.metadata;
        if (!meta || !isDuelPadCategoryKind(meta)) {
          return (
            <div
              key={cat.id}
              className="grid items-stretch border-b border-black/10 last:border-b-0"
              style={{ gridTemplateColumns: `minmax(0, 1.6fr) repeat(${matchPlayers.length}, minmax(0, 1fr))` }}
            >
              <div className="flex items-center gap-2 py-2 px-3 bg-secondary text-foreground">
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">{cat.name}</span>
              </div>
              {matchPlayers.map(ps => (
                <div key={ps.player.id} className="border-l border-black/10 flex items-center justify-center py-2 px-1">
                  {editingScores ? (
                    <input type="number" inputMode="numeric"
                      value={editingScores[ps.player.id]?.[cat.id] ?? 0}
                      onChange={e => setEditingScores(prev => prev ? ({
                        ...prev,
                        [ps.player.id]: { ...(prev[ps.player.id] || {}), [cat.id]: parseInt(e.target.value) || 0 }
                      }) : null)}
                      className="w-full input-field text-center px-1 py-1 text-xs" />
                  ) : (
                    <span className="text-sm font-bold text-foreground tabular-nums">{ps.scores[cat.id] || 0}</span>
                  )}
                </div>
              ))}
            </div>
          );
        }

        const style = getDuelPadRowStyle(meta);
        const isDark = meta === 'wonder_total' || meta === 'wonder_supremacia_militar' || meta === 'wonder_supremacia_cientifica' || meta === 'wonder_supremacia_civil';
        const isTotal = meta === 'wonder_total';

        return (
          <div
            key={cat.id}
            className="grid items-stretch border-b border-black/10 last:border-b-0"
            style={{ gridTemplateColumns: `minmax(0, 1.6fr) repeat(${matchPlayers.length}, minmax(0, 1fr))` }}
          >
            <div
              className="flex items-center gap-2 py-2 px-3"
              style={{ backgroundColor: style.bg, color: isDark ? '#FFFFFF' : '#0F172A' }}
            >
              <span
                className="inline-flex items-center justify-center shrink-0 rounded"
                style={{ backgroundColor: style.iconBg, width: 28, height: 28 }}
              >
                {style.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                {DUEL_PAD_ROW_LABELS[meta] || cat.name}
              </span>
            </div>
            {matchPlayers.map(ps => {
              if (isTotal) {
                return (
                  <div
                    key={ps.player.id}
                    className="border-l border-white/20 flex items-center justify-center py-2 px-1 tabular-nums font-black text-base"
                    style={{ backgroundColor: style.bg, color: '#FFFFFF' }}
                  >
                    {ps.total}
                  </div>
                );
              }
              const val = ps.scores[cat.id] || 0;
              return (
                <div
                  key={ps.player.id}
                  className="border-l border-black/10 flex items-center justify-center py-1.5 px-1"
                  style={{ backgroundColor: style.bg }}
                >
                  {editingScores ? (
                    <input type="number" inputMode="numeric"
                      value={editingScores[ps.player.id]?.[cat.id] ?? 0}
                      onChange={e => setEditingScores(prev => prev ? ({
                        ...prev,
                        [ps.player.id]: { ...(prev[ps.player.id] || {}), [cat.id]: parseInt(e.target.value) || 0 }
                      }) : null)}
                      className={cn(
                        'w-full text-center px-1 py-1 text-xs tabular-nums rounded bg-transparent border border-black/15',
                        isDark && 'text-white border-white/30'
                      )}
                      style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                    />
                  ) : (
                    <span
                      className={cn('text-sm font-bold tabular-nums', isDark ? 'text-white' : 'text-foreground')}
                      style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                    >
                      {val}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}