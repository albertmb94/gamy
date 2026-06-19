import { useState } from 'react';
import { Crown, Pencil, Trash2, Save, X, Target, ScrollText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

const GAME_EMOJIS: Record<string, string> = {
  'Estrategia': '♟️', 'Cartas': '🃏', 'Filler': '⚡', 'Cooperativo': '🤝',
  'Dados': '🎲', 'Puzzle': '🧩', 'Construcción': '🏗️', 'Negociación': '🤝',
  'Destreza': '🎯', 'Familiar': '👨‍👩‍👧‍👦', 'Abstracto': '🔷', 'Duel': '⚔️',
};

export default function History() {
  const { matches, games, players, deleteMatch, updateMatch } = useStore();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingScores, setEditingScores] = useState<Record<string, Record<string, number>> | null>(null);
  const [filterGameId, setFilterGameId] = useState('');
  const [filterExpansionId, setFilterExpansionId] = useState('');

  const baseGames = games.filter(g => !g.isExpansion);
  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredMatches = sortedMatches.filter(m => {
    if (filterGameId && m.gameId !== filterGameId) return false;
    if (filterExpansionId && !m.activeExpansionIds.includes(filterExpansionId)) return false;
    return true;
  });

  const filterExpansions = filterGameId ? games.filter(g => g.baseGameId === filterGameId) : [];

  const detailMatch = detailId ? matches.find(m => m.id === detailId) : null;
  const detailGame = detailMatch ? games.find(g => g.id === detailMatch.gameId) : null;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Historial</h2>
        <p className="text-sm text-muted-foreground">{matches.length} partidas registradas</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select value={filterGameId} onChange={e => { setFilterGameId(e.target.value); setFilterExpansionId(''); }}
          className="input-field flex-1">
          <option value="">Todos los juegos</option>
          {baseGames.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        {filterExpansions.length > 0 && (
          <select value={filterExpansionId} onChange={e => setFilterExpansionId(e.target.value)}
            className="input-field">
            <option value="">Cualquier config</option>
            {filterExpansions.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        )}
      </div>

      {/* Match list */}
      <div className="space-y-3">
        {filteredMatches.map(match => {
          const game = games.find(g => g.id === match.gameId);
          const winner = players.find(p => p.id === match.winnerId);
          const emoji = GAME_EMOJIS[game?.types[0] || ''] || '🎲';

          return (
            <button key={match.id} onClick={() => setDetailId(match.id)}
              className="w-full glass-card p-4 text-left hover:border-foreground/30 transition-colors animate-slide-up">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-foreground font-bold text-sm truncate">{game?.name || 'Desconocido'}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{formatDate(match.date)}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {winner && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1"><Crown className="h-3 w-3" /> {winner.name}</span>
                )}
                {match.activeExpansionIds.length > 0 && (
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
                    +{match.activeExpansionIds.map(id => games.find(g => g.id === id)?.name).join(', ')}
                  </span>
                )}
                {!match.synced && (
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 ml-auto">⏳ Sin sincronizar</span>
                )}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {match.playerIds.map(pid => {
                  const p = players.find(pl => pl.id === pid);
                  const score = match.playerScores.find(ps => ps.playerId === pid);
                  return p ? (
                    <span key={pid} className={cn('text-[10px] px-2 py-1 rounded-full font-semibold border', pid === match.winnerId ? 'text-white border-transparent' : 'text-muted-foreground bg-secondary border-border')}
                      style={pid === match.winnerId ? { backgroundColor: p.color } : {}}>
                      {p.name}: {score?.specialVictory || score?.total}
                    </span>
                  ) : null;
                })}
              </div>
            </button>
          );
        })}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-16 glass-card">
          <ScrollText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">No hay partidas registradas</p>
        </div>
      )}

      {/* Match Detail Modal */}
      {detailMatch && detailGame && (
        <div className="modal-overlay" onClick={() => { setDetailId(null); setEditingScores(null); }}>
          <div className="modal-panel p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{detailGame.name}</h2>
                <p className="text-sm text-muted-foreground">{formatDate(detailMatch.date)}</p>
                {detailMatch.activeExpansionIds.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    + {detailMatch.activeExpansionIds.map(id => games.find(g => g.id === id)?.name).join(', ')}
                  </p>
                )}
              </div>
              <button onClick={() => { setDetailId(null); setEditingScores(null); }} className="w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"><X className="h-4 w-4" /></button>
            </div>

            {detailMatch.firstPlayerId && (
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <Target className="h-3.5 w-3.5" /> Primer turno: <span className="text-foreground font-semibold">{players.find(p => p.id === detailMatch.firstPlayerId)?.name}</span>
              </p>
            )}

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
                    <div key={ps.playerId} className={cn('rounded-xl p-3 border', ps.playerId === detailMatch.winnerId ? 'bg-amber-50 border-amber-200' : 'bg-secondary border-border')}>
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

            <div className="flex gap-2">
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
