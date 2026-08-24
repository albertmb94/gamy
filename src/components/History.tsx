import { useState } from 'react';
import { Crown, Pencil, Trash2, Save, X, Target, ScrollText, Spade, ArrowLeft, CalendarDays } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRemigioStore } from '../store/useRemigioStore';
import { statusLabel } from '../remigio/engine';
import { cn } from '../utils/cn';
import { useModalLock } from '../utils/useModalLock';
import { ModalOverlay } from './ui/ModalOverlay';
import { Game, Player, PlayerScore, ScoreCategory } from '../types';
import {
  DUEL_PAD_EXCLUDED_METADATA,
  DUEL_PAD_METADATA_ORDER,
  DUEL_PAD_ROW_LABELS,
  SUPREMACY_TYPES,
  buildDuelPadCategories,
  getDuelPadRowStyle,
  isDuelPadCategoryKind,
  supremacyMetaFor,
} from '../utils/duelPad';

type Entry =
  | { kind: 'match'; date: string; id: string }
  | { kind: 'remigio'; date: string; id: string };

/** Borrador de edición completa de una partida. */
interface MatchEditDraft {
  gameId: string;
  date: string; // valor para input datetime-local (hora local)
  playerIds: string[];
  scores: Record<string, Record<string, number>>;
  winnerId: string;
  sup: { playerId: string; type: string } | null;
}

/** ISO → valor válido para <input type="datetime-local"> en hora local. */
function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function History() {
  const { matches, games, players, deleteMatch, updateMatch } = useStore();
  const remigioSessions = useRemigioStore(s => s.sessions);
  const openRemigioModule = useRemigioStore(s => s.openModule);
  const openRemigioSession = useRemigioStore(s => s.openSession);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<MatchEditDraft | null>(null);
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

  // Bloquea el scroll de fondo mientras el detalle/edición está abierto.
  useModalLock(!!detailMatch);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const closeDetail = () => { setDetailId(null); setEditDraft(null); };

  // ----- Edición completa de partidas -----

  const startEdit = () => {
    if (!detailMatch) return;
    const scores: Record<string, Record<string, number>> = {};
    detailMatch.playerScores.forEach(ps => {
      scores[ps.playerId] = { ...ps.scores };
    });
    const supEntry = detailMatch.playerScores.find(ps => ps.specialVictory);
    setEditDraft({
      gameId: detailMatch.gameId,
      date: toLocalInputValue(detailMatch.date),
      playerIds: [...detailMatch.playerIds],
      scores,
      winnerId: detailMatch.winnerId || '',
      sup: supEntry ? { playerId: supEntry.playerId, type: supEntry.specialVictory as string } : null,
    });
  };

  const updateDraft = (patch: Partial<MatchEditDraft>) =>
    setEditDraft(prev => (prev ? { ...prev, ...patch } : prev));

  const toggleDraftPlayer = (pid: string) => {
    setEditDraft(prev => {
      if (!prev) return prev;
      const has = prev.playerIds.includes(pid);
      const playerIds = has ? prev.playerIds.filter(x => x !== pid) : [...prev.playerIds, pid];
      const scores = { ...prev.scores };
      if (has) delete scores[pid];
      else scores[pid] = {};
      let { winnerId, sup } = prev;
      if (has) {
        if (winnerId === pid) winnerId = '';
        if (sup?.playerId === pid) sup = null;
      }
      return { ...prev, playerIds, scores, winnerId, sup };
    });
  };

  const changeDraftGame = (gameId: string) => {
    setEditDraft(prev => {
      if (!prev || prev.gameId === gameId) return prev;
      // Cambiar de juego invalida puntuaciones, ganador y supremacía:
      // las categorías ya no coinciden.
      const scores: Record<string, Record<string, number>> = {};
      prev.playerIds.forEach(pid => { scores[pid] = {}; });
      return { ...prev, gameId, scores, winnerId: '', sup: null };
    });
  };

  const setDraftScore = (pid: string, catId: string, value: number) => {
    setEditDraft(prev => prev ? ({
      ...prev,
      scores: { ...prev.scores, [pid]: { ...(prev.scores[pid] || {}), [catId]: value } },
    }) : prev);
  };

  const saveEdit = () => {
    if (!detailMatch || !editDraft) return;
    const editGame = games.find(g => g.id === editDraft.gameId);
    if (!editGame || editDraft.playerIds.length === 0) return;

    const sameGame = editDraft.gameId === detailMatch.gameId;
    const allCats: ScoreCategory[] = [...editGame.scoringTemplate.categories];
    if (sameGame) {
      detailMatch.activeExpansionIds.forEach(eid => {
        const exp = games.find(g => g.id === eid);
        if (exp) allCats.push(...exp.scoringTemplate.categories);
      });
    }

    const computeTotal = (pid: string) => {
      if (allCats.length === 0) return editDraft.scores[pid]?.['total'] || 0;
      // La fila Total (wonder_total) es calculada: no se suma para evitar
      // doble conteo con valores heredados de partidas antiguas.
      return allCats.reduce((sum, cat) =>
        cat.metadata === 'wonder_total' ? sum : sum + (editDraft.scores[pid]?.[cat.id] || 0), 0);
    };

    const playerScores: PlayerScore[] = editDraft.playerIds.map(pid => ({
      playerId: pid,
      scores: editDraft.scores[pid] || {},
      total: computeTotal(pid),
      specialVictory: editDraft.sup && editDraft.sup.playerId === pid ? editDraft.sup.type : undefined,
    }));

    let winnerId = editDraft.sup?.playerId || editDraft.winnerId || '';
    if (!winnerId) {
      let max = -Infinity;
      playerScores.forEach(ps => {
        if (ps.total > max) { max = ps.total; winnerId = ps.playerId; }
      });
    }

    const parsedDate = new Date(editDraft.date);

    updateMatch(detailMatch.id, {
      gameId: editDraft.gameId,
      date: isNaN(parsedDate.getTime()) ? detailMatch.date : parsedDate.toISOString(),
      playerIds: editDraft.playerIds,
      activeExpansionIds: sameGame ? detailMatch.activeExpansionIds : [],
      playerScores,
      winnerId: winnerId || undefined,
    });
    setEditDraft(null);
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

      {/* Match Detail Modal — portal a <body> para que position:fixed no lo
          ancle al contenido scrolleado (bug iOS/WebKit). */}
      {detailMatch && detailGame && (
        <ModalOverlay onClick={closeDetail}>
          <div className="modal-panel p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={closeDetail}
                className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="text-center leading-tight">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Partida</p>
                <p className="text-sm font-bold text-foreground">
                  {(editDraft ? games.find(g => g.id === editDraft.gameId) : detailGame)?.name}
                </p>
              </div>
              <button onClick={closeDetail}
                className="w-9 h-9 rounded-full bg-card border border-border text-foreground flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            {!editDraft && (
              <>
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
              </>
            )}

            {/* ----- Panel de edición completa ----- */}
            {editDraft && (() => {
              const draftGame = games.find(g => g.id === editDraft.gameId) ?? detailGame;
              const sameGame = editDraft.gameId === detailMatch.gameId;
              const allCats: ScoreCategory[] = [...draftGame.scoringTemplate.categories];
              if (sameGame) {
                detailMatch.activeExpansionIds.forEach(eid => {
                  const exp = games.find(g => g.id === eid);
                  if (exp) allCats.push(...exp.scoringTemplate.categories);
                });
              }
              const gameOptions = [
                { id: detailGame.id, name: detailGame.name },
                ...baseGames.filter(g => g.id !== detailGame.id).map(g => ({ id: g.id, name: g.name })),
              ];
              const supOptions: string[] = draftGame.specialVictoryTypes?.length
                ? draftGame.specialVictoryTypes
                : [...SUPREMACY_TYPES];
              const supWithoutWinner = !!editDraft.sup && !editDraft.sup.playerId;

              return (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> Fecha y hora
                    </label>
                    <input type="datetime-local" value={editDraft.date}
                      onChange={e => updateDraft({ date: e.target.value })}
                      className="input-field text-sm" />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Juego</label>
                    <select value={editDraft.gameId}
                      onChange={e => changeDraftGame(e.target.value)}
                      className="input-field text-sm">
                      {gameOptions.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    {!sameGame && (
                      <p className="text-[11px] text-amber-600 mt-1">El juego cambió: introduce de nuevo las puntuaciones.</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Jugadores</label>
                    <div className="flex flex-wrap gap-1.5">
                      {players.map(p => {
                        const sel = editDraft.playerIds.includes(p.id);
                        return (
                          <button key={p.id} type="button" onClick={() => toggleDraftPlayer(p.id)}
                            className={`chip text-xs ${sel ? 'chip-active' : ''}`}>
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Ganador</label>
                    {isDuelPadMatch(draftGame) && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <button type="button"
                          onClick={() => updateDraft({ sup: null })}
                          className={`chip text-xs ${!editDraft.sup ? 'chip-active' : ''}`}>
                          Por puntos
                        </button>
                        {supOptions.map(t => (
                          <button key={t} type="button"
                            onClick={() => updateDraft({ sup: editDraft.sup?.type === t ? null : { playerId: '', type: t } })}
                            className={`chip text-xs ${editDraft.sup?.type === t ? 'bg-amber-500 text-white border-transparent' : ''}`}>
                            ⚡ {t}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {editDraft.playerIds.map(pid => {
                        const player = players.find(p => p.id === pid);
                        if (!player) return null;
                        const isWin = editDraft.sup
                          ? editDraft.sup.playerId === pid
                          : editDraft.winnerId === pid;
                        return (
                          <button key={pid} type="button"
                            onClick={() => {
                              if (editDraft.sup) {
                                updateDraft({ sup: editDraft.sup.playerId === pid ? null : { ...editDraft.sup, playerId: pid } });
                              } else {
                                updateDraft({ winnerId: editDraft.winnerId === pid ? '' : pid });
                              }
                            }}
                            className={cn('chip text-xs', isWin && 'bg-amber-500 text-white border-transparent')}>
                            <Crown className="h-3 w-3 inline mr-1 -mt-0.5" />{player.name}
                          </button>
                        );
                      })}
                    </div>
                    {supWithoutWinner && (
                      <p className="text-[11px] text-amber-600 mt-1">Elige qué jugador ganó por supremacía.</p>
                    )}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const draftGame = editDraft ? (games.find(g => g.id === editDraft.gameId) ?? detailGame) : detailGame;
              const sameGame = !editDraft || editDraft.gameId === detailMatch.gameId;
              const cats = sameGame
                ? allCatsFor(draftGame, detailMatch, games)
                : [...draftGame.scoringTemplate.categories];
              if (isDuelPadMatch(draftGame)) {
                const rows = (editDraft ? editDraft.playerIds : detailMatch.playerIds).map(pid => {
                  const stored = detailMatch.playerScores.find(ps => ps.playerId === pid);
                  return {
                    playerId: pid,
                    scores: editDraft ? (editDraft.scores[pid] || {}) : (stored?.scores || {}),
                    total: stored?.total || 0,
                  };
                });
                return (
                  <>
                    <DuelPadReadonly
                      game={draftGame}
                      playerRows={rows}
                      allPlayers={players}
                      winnerId={editDraft ? (editDraft.sup?.playerId || editDraft.winnerId || undefined) : detailMatch.winnerId}
                      editingScores={editDraft ? editDraft.scores : null}
                      onScoreChange={setDraftScore}
                    />
                    {!editDraft && <DuelSupremacySummary match={detailMatch} allPlayers={players} />}
                  </>
                );
              }

              // Filas construidas SIEMPRE a partir de la lista de jugadores
              // mostrados (no de las puntuaciones almacenadas): así, al añadir
              // un jugador nuevo durante la edición, su fila aparece con inputs.
              const shownIds = editDraft ? editDraft.playerIds : detailMatch.playerIds;
              const isSimple = draftGame.scoringTemplate.type === 'simple';
              const rowTotal = (pid: string): number => {
                const stored = detailMatch.playerScores.find(ps => ps.playerId === pid);
                if (!editDraft) return stored?.total || 0;
                const sc = editDraft.scores[pid] || {};
                if (isSimple && cats.length === 0) return sc['total'] || 0;
                return cats.reduce((sum, c) =>
                  c.metadata === 'wonder_total' ? sum : sum + (sc[c.id] || 0), 0);
              };
              const currentWinnerId = editDraft
                ? (editDraft.sup?.playerId || editDraft.winnerId || undefined)
                : detailMatch.winnerId;

              const rows = shownIds
                .map(pid => {
                  const player = players.find(p => p.id === pid);
                  if (!player) return null;
                  const stored = detailMatch.playerScores.find(ps => ps.playerId === pid);
                  const scores = editDraft ? (editDraft.scores[pid] || {}) : (stored?.scores || {});
                  const specialVictory = editDraft
                    ? (editDraft.sup?.playerId === pid ? editDraft.sup.type : undefined)
                    : stored?.specialVictory;
                  return { playerId: pid, player, scores, total: rowTotal(pid), specialVictory };
                })
                .filter((r): r is NonNullable<typeof r> => !!r)
                .sort((a, b) => b.total - a.total);

              return (
                <div className="space-y-2 mb-4">
                  {rows.map((row, idx) => (
                    <div key={row.playerId} className={cn('rounded-2xl p-3 border', row.playerId === currentWinnerId ? 'bg-amber-50 border-amber-200' : 'bg-secondary border-border')}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: row.player.color }}>
                          {row.player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-foreground font-bold text-sm flex-1">{row.player.name}</span>
                        <span className="text-lg font-black text-foreground">
                          {row.specialVictory ? `⚡ ${row.specialVictory}` : row.total}
                        </span>
                      </div>

                      {draftGame.scoringTemplate.type === 'complex' && !row.specialVictory && (
                        <div className="grid grid-cols-3 gap-1">
                          {cats.map(cat => (
                            <div key={cat.id} className="text-center">
                              <span className="text-[10px] text-muted-foreground block truncate">{cat.name}</span>
                              {editDraft ? (
                                <input type="number" inputMode="numeric"
                                  value={editDraft.scores[row.playerId]?.[cat.id] ?? 0}
                                  onChange={e => setDraftScore(row.playerId, cat.id, parseInt(e.target.value) || 0)}
                                  className="w-full input-field text-center px-1 py-1 text-xs" />
                              ) : (
                                <span className="text-xs text-foreground font-bold">{row.scores[cat.id] || 0}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {draftGame.scoringTemplate.type === 'simple' && editDraft && (
                        <input type="number" inputMode="numeric"
                          value={editDraft.scores[row.playerId]?.['total'] ?? ''}
                          onChange={e => setDraftScore(row.playerId, 'total', parseInt(e.target.value) || 0)}
                          placeholder="Puntuación total"
                          className="input-field text-center text-sm py-2" />
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="flex gap-2 mt-4">
              {editDraft ? (
                <>
                  <button onClick={() => setEditDraft(null)} className="btn btn-secondary flex-1 py-3">Cancelar</button>
                  <button
                    onClick={saveEdit}
                    disabled={editDraft.playerIds.length === 0 || (!!editDraft.sup && !editDraft.sup.playerId)}
                    className="btn btn-success flex-1 py-3 disabled:opacity-50 disabled:pointer-events-none">
                    <Save className="h-4 w-4" /> Guardar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={startEdit} className="btn btn-secondary flex-1 py-3"><Pencil className="h-4 w-4" /> Editar</button>
                  <button onClick={() => {
                    if (confirm('¿Eliminar esta partida?')) {
                      deleteMatch(detailMatch.id);
                      closeDetail();
                    }
                  }} className="btn btn-danger py-3 px-5"><Trash2 className="h-4 w-4" /></button>
                </>
              )}
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

/** Categorías de un juego + expansiones activas de la partida. */
function allCatsFor(
  game: Game,
  match: { activeExpansionIds: string[] },
  games: Game[],
): ScoreCategory[] {
  const cats: ScoreCategory[] = [...game.scoringTemplate.categories];
  match.activeExpansionIds.forEach(eid => {
    const exp = games.find(g => g.id === eid);
    if (exp) cats.push(...exp.scoringTemplate.categories);
  });
  return cats;
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
  playerRows,
  allPlayers,
  winnerId,
  editingScores,
  onScoreChange,
}: {
  game: Game;
  playerRows: Array<{ playerId: string; scores: Record<string, number>; total: number }>;
  allPlayers: Player[];
  winnerId?: string;
  editingScores?: Record<string, Record<string, number>> | null;
  onScoreChange?: (playerId: string, catId: string, value: number) => void;
}) {
  const defaults = buildDuelPadCategories();
  const orderedCats = (() => {
    const out: ScoreCategory[] = [];
    const seen = new Set<string>();
    const isExcluded = (c: ScoreCategory) =>
      !!c.metadata && DUEL_PAD_EXCLUDED_METADATA.has(c.metadata);
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

  const liveTotal = (pid: string): number => {
    if (editingScores) {
      return orderedCats.reduce(
        (sum, c) => c.metadata === 'wonder_total' ? sum : sum + (editingScores[pid]?.[c.id] || 0),
        0,
      );
    }
    return playerRows.find(r => r.playerId === pid)?.total || 0;
  };

  const matchPlayers = playerRows
    .map(r => ({ ...r, player: allPlayers.find(p => p.id === r.playerId)! }))
    .filter(r => r.player)
    .sort((a, b) => liveTotal(b.playerId) - liveTotal(a.playerId));

  const headerStyle = getDuelPadRowStyle('wonder_header');

  // Ancho mínimo por columna + scroll horizontal solo con muchos jugadores.
  const tableMinWidth = `${90 + matchPlayers.length * 64}px`;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/20 mb-4">
      <div className="overflow-x-auto">
        <div style={{ minWidth: tableMinWidth }}>
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
        {matchPlayers.map(r => (
          <div key={r.player.id} className="flex flex-col items-center justify-center py-3 px-1 border-l border-white/20">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1"
              style={{ backgroundColor: r.player.color }}>
              {r.player.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] font-bold truncate max-w-full">
              {r.playerId === winnerId ? '🏆 ' : ''}
              {r.player.name}
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
              {matchPlayers.map(r => (
                <div key={r.player.id} className="border-l border-black/10 flex items-center justify-center py-2 px-1">
                  {editingScores && onScoreChange ? (
                    <input type="number" inputMode="numeric"
                      value={editingScores[r.player.id]?.[cat.id] ?? 0}
                      onChange={e => onScoreChange(r.player.id, cat.id, parseInt(e.target.value) || 0)}
                      className="w-full input-field text-center px-1 py-1 text-xs" />
                  ) : (
                    <span className="text-sm font-bold text-foreground tabular-nums">{r.scores[cat.id] || 0}</span>
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
            {matchPlayers.map(r => {
              if (isTotal) {
                return (
                  <div
                    key={r.player.id}
                    className="border-l border-white/20 flex items-center justify-center py-2 px-1 tabular-nums font-black text-base"
                    style={{ backgroundColor: style.bg, color: '#FFFFFF' }}
                  >
                    {liveTotal(r.playerId)}
                  </div>
                );
              }
              const val = editingScores
                ? (editingScores[r.player.id]?.[cat.id] ?? 0)
                : (r.scores[cat.id] || 0);
              return (
                <div
                  key={r.player.id}
                  className="border-l border-black/10 flex items-center justify-center py-1.5 px-1"
                  style={{ backgroundColor: style.bg }}
                >
                  {editingScores && onScoreChange ? (
                    <input type="number" inputMode="numeric"
                      value={val}
                      onChange={e => onScoreChange(r.player.id, cat.id, parseInt(e.target.value) || 0)}
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
      </div>
    </div>
  );
}
