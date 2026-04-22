import { useState } from 'react';
import { useStore } from '../store/useStore';

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

    // Recalculate winner
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
      {/* Filters */}
      <div className="flex gap-2">
        <select value={filterGameId} onChange={e => { setFilterGameId(e.target.value); setFilterExpansionId(''); }}
          className="flex-1 bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">Todos los juegos</option>
          {baseGames.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        {filterExpansions.length > 0 && (
          <select value={filterExpansionId} onChange={e => setFilterExpansionId(e.target.value)}
            className="bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Cualquier config</option>
            {filterExpansions.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        )}
      </div>

      {/* Match list */}
      <div className="space-y-2">
        {filteredMatches.map(match => {
          const game = games.find(g => g.id === match.gameId);
          const winner = players.find(p => p.id === match.winnerId);

          return (
            <button key={match.id} onClick={() => setDetailId(match.id)}
              className="w-full bg-gray-800 rounded-xl p-4 text-left hover:ring-1 hover:ring-purple-500 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-semibold text-sm truncate flex-1">{game?.name || 'Desconocido'}</span>
                <span className="text-xs text-gray-400 ml-2 shrink-0">{formatDate(match.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                {winner && (
                  <span className="text-xs text-amber-400">👑 {winner.name}</span>
                )}
                {match.activeExpansionIds.length > 0 && (
                  <span className="text-[10px] text-purple-400">
                    +{match.activeExpansionIds.map(id => games.find(g => g.id === id)?.name).join(', ')}
                  </span>
                )}
                {!match.synced && (
                  <span className="text-[10px] text-amber-500 ml-auto">⏳ Sin sincronizar</span>
                )}
              </div>
              <div className="flex gap-1 mt-1.5">
                {match.playerIds.map(pid => {
                  const p = players.find(pl => pl.id === pid);
                  const score = match.playerScores.find(ps => ps.playerId === pid);
                  return p ? (
                    <span key={pid} className={`text-[10px] px-2 py-0.5 rounded-full ${
                      pid === match.winnerId ? 'text-white' : 'text-gray-300 bg-gray-700'
                    }`} style={pid === match.winnerId ? { backgroundColor: p.color } : {}}>
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
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">No hay partidas registradas</p>
        </div>
      )}

      {/* Match Detail Modal */}
      {detailMatch && detailGame && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center" onClick={() => { setDetailId(null); setEditingScores(null); }}>
          <div className="bg-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{detailGame.name}</h2>
                <p className="text-sm text-gray-400">{formatDate(detailMatch.date)}</p>
                {detailMatch.activeExpansionIds.length > 0 && (
                  <p className="text-xs text-purple-400 mt-0.5">
                    + {detailMatch.activeExpansionIds.map(id => games.find(g => g.id === id)?.name).join(', ')}
                  </p>
                )}
              </div>
              <button onClick={() => { setDetailId(null); setEditingScores(null); }} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>

            {detailMatch.firstPlayerId && (
              <p className="text-xs text-gray-400 mb-3">
                🎯 Primer turno: <span className="text-white">{players.find(p => p.id === detailMatch.firstPlayerId)?.name}</span>
              </p>
            )}

            {/* Scores table */}
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
                    <div key={ps.playerId} className={`rounded-xl p-3 ${
                      ps.playerId === detailMatch.winnerId ? 'bg-amber-900/20 ring-1 ring-amber-500/30' : 'bg-gray-700/50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: player.color }}>
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-semibold text-sm flex-1">{player.name}</span>
                        <span className="text-lg font-bold text-white">
                          {ps.specialVictory ? `⚡ ${ps.specialVictory}` : ps.total}
                        </span>
                      </div>

                      {detailGame.scoringTemplate.type === 'complex' && !ps.specialVictory && (
                        <div className="grid grid-cols-3 gap-1">
                          {allCats.map(cat => (
                            <div key={cat.id} className="text-center">
                              <span className="text-[10px] text-gray-400 block">{cat.name}</span>
                              {editingScores ? (
                                <input type="number" inputMode="numeric"
                                  value={editingScores[ps.playerId]?.[cat.id] ?? 0}
                                  onChange={e => setEditingScores(prev => prev ? ({
                                    ...prev,
                                    [ps.playerId]: { ...(prev[ps.playerId] || {}), [cat.id]: parseInt(e.target.value) || 0 }
                                  }) : null)}
                                  className="w-full bg-gray-600 text-white text-center rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500" />
                              ) : (
                                <span className="text-xs text-white font-medium">{ps.scores[cat.id] || 0}</span>
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
                  <button onClick={() => setEditingScores(null)} className="flex-1 bg-gray-700 text-gray-300 rounded-xl py-3 font-medium">Cancelar</button>
                  <button onClick={saveEdit} className="flex-1 bg-green-600 text-white rounded-xl py-3 font-medium">💾 Guardar</button>
                </>
              ) : (
                <>
                  <button onClick={startEdit} className="flex-1 bg-gray-700 text-white rounded-xl py-3 font-medium">✏️ Editar</button>
                  <button onClick={() => {
                    if (confirm('¿Eliminar esta partida?')) {
                      deleteMatch(detailMatch.id);
                      setDetailId(null);
                    }
                  }} className="bg-red-600/20 text-red-400 rounded-xl py-3 px-5 font-medium">🗑️</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
