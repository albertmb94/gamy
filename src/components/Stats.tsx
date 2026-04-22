import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { GameType } from '../types';

const ALL_TYPES: GameType[] = ['Estrategia', 'Cartas', 'Filler', 'Cooperativo', 'Dados', 'Puzzle', 'Construcción', 'Negociación', 'Destreza', 'Familiar', 'Abstracto', 'Duel'];

type StatsView = 'global' | 'game' | 'type' | 'achievements';

const ACHIEVEMENTS_MAP: Record<string, { name: string; icon: string; description: string }> = {
  racha_3: { name: 'Racha de 3', icon: '🔥', description: 'Ganar 3 partidas consecutivas' },
  club_100: { name: 'Club de los 100', icon: '💯', description: 'Superar 100 puntos en una partida' },
  pacificador: { name: 'El Pacificador', icon: '🕊️', description: 'Ganar 7 Wonders con 0 en categoría militar' },
};

export default function Stats() {
  const { players, matches, games, playerAchievements } = useStore();
  const [view, setView] = useState<StatsView>('global');
  const [filterGameId, setFilterGameId] = useState('');
  const [filterType, setFilterType] = useState<GameType | ''>('');
  const [filterExpansionId, setFilterExpansionId] = useState('');

  const baseGames = games.filter(g => !g.isExpansion);
  const filterExpansions = filterGameId ? games.filter(g => g.baseGameId === filterGameId) : [];

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (view === 'game' && filterGameId && m.gameId !== filterGameId) return false;
      if (view === 'game' && filterExpansionId && !m.activeExpansionIds.includes(filterExpansionId)) return false;
      if (view === 'type' && filterType) {
        const game = games.find(g => g.id === m.gameId);
        if (!game || !game.types.includes(filterType)) return false;
      }
      return true;
    });
  }, [matches, view, filterGameId, filterType, filterExpansionId, games]);

  const rankings = useMemo(() => {
    return players.map(player => {
      const pMatches = filteredMatches.filter(m => m.playerIds.includes(player.id));
      const wins = pMatches.filter(m => m.winnerId === player.id).length;
      const losses = pMatches.length - wins;
      const winRate = pMatches.length > 0 ? (wins / pMatches.length) * 100 : 0;
      const totalPoints = pMatches.reduce((sum, m) => {
        const ps = m.playerScores.find(s => s.playerId === player.id);
        return sum + (ps?.total || 0);
      }, 0);
      const avgPoints = pMatches.length > 0 ? totalPoints / pMatches.length : 0;

      // Best streak
      const sorted = [...pMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      let bestStreak = 0;
      let currentStreak = 0;
      sorted.forEach(m => {
        if (m.winnerId === player.id) { currentStreak++; bestStreak = Math.max(bestStreak, currentStreak); }
        else currentStreak = 0;
      });

      return { player, total: pMatches.length, wins, losses, winRate, totalPoints, avgPoints, bestStreak };
    }).sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);
  }, [players, filteredMatches]);

  return (
    <div className="space-y-4">
      {/* View tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
        {[
          { key: 'global', label: '🌍 Global' },
          { key: 'game', label: '🎲 Juego' },
          { key: 'type', label: '🏷️ Tipo' },
          { key: 'achievements', label: '🏆 Logros' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setView(key as StatsView); setFilterGameId(''); setFilterType(''); setFilterExpansionId(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              view === key ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {view === 'game' && (
        <div className="space-y-2">
          <select value={filterGameId} onChange={e => { setFilterGameId(e.target.value); setFilterExpansionId(''); }}
            className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Todos los juegos</option>
            {baseGames.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          {filterExpansions.length > 0 && (
            <select value={filterExpansionId} onChange={e => setFilterExpansionId(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Cualquier configuración</option>
              {filterExpansions.map(e => <option key={e.id} value={e.id}>Con {e.name}</option>)}
            </select>
          )}
        </div>
      )}

      {view === 'type' && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {ALL_TYPES.map(t => (
            <button key={t} onClick={() => setFilterType(filterType === t ? '' : t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filterType === t ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Rankings */}
      {view !== 'achievements' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-gray-400">Ranking</h3>
            <span className="text-xs text-gray-500">{filteredMatches.length} partidas</span>
          </div>

          {rankings.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">No hay datos</p>
          ) : (
            rankings.map((r, idx) => (
              <div key={r.player.id} className={`bg-gray-800 rounded-xl p-4 ${idx === 0 && r.wins > 0 ? 'ring-1 ring-amber-500/30' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg w-7 text-center">
                    {idx === 0 && r.wins > 0 ? '🥇' : idx === 1 && r.wins > 0 ? '🥈' : idx === 2 && r.wins > 0 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: r.player.color }}>
                    {r.player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm truncate">{r.player.name}</h4>
                    <p className="text-xs text-gray-400">{r.total} partidas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{r.wins}W</p>
                    <p className="text-xs text-gray-400">{r.winRate.toFixed(0)}%</p>
                  </div>
                </div>

                {/* Stats bar */}
                {r.total > 0 && (
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${r.winRate}%`,
                      backgroundColor: r.player.color,
                    }} />
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 mt-2 text-center">
                  <div>
                    <p className="text-[10px] text-gray-500">Victorias</p>
                    <p className="text-xs text-green-400 font-semibold">{r.wins}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Derrotas</p>
                    <p className="text-xs text-red-400 font-semibold">{r.losses}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Pts/Partida</p>
                    <p className="text-xs text-white font-semibold">{r.avgPoints.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Mejor racha</p>
                    <p className="text-xs text-amber-400 font-semibold">{r.bestStreak}🔥</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Achievements view */}
      {view === 'achievements' && (
        <div className="space-y-4">
          {/* Available achievements */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Logros Disponibles</h3>
            <div className="space-y-2">
              {Object.entries(ACHIEVEMENTS_MAP).map(([id, info]) => {
                const unlocked = playerAchievements.filter(a => a.achievementId === id);
                return (
                  <div key={id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm">{info.name}</h4>
                        <p className="text-xs text-gray-400">{info.description}</p>
                      </div>
                    </div>
                    {unlocked.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {unlocked.map(u => {
                          const player = players.find(p => p.id === u.playerId);
                          return player ? (
                            <span key={u.playerId} className="text-xs px-2 py-1 rounded-full text-white"
                              style={{ backgroundColor: player.color }}>
                              {player.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    {unlocked.length === 0 && (
                      <p className="text-xs text-gray-600 mt-2">Nadie ha desbloqueado este logro aún</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Player achievements */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Logros por Jugador</h3>
            <div className="space-y-2">
              {players.map(player => {
                const pAch = playerAchievements.filter(a => a.playerId === player.id);
                return (
                  <div key={player.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: player.color }}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-semibold text-sm">{player.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{pAch.length}/{Object.keys(ACHIEVEMENTS_MAP).length}</span>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(ACHIEVEMENTS_MAP).map(([id, info]) => {
                        const has = pAch.some(a => a.achievementId === id);
                        return (
                          <span key={id} className={`text-xl transition-all ${has ? '' : 'grayscale opacity-30'}`} title={info.name}>
                            {info.icon}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
