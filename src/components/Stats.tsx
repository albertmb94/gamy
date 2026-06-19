import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useRemigioStore } from '../store/useRemigioStore';
import { getBalance } from '../remigio/engine';
import { GameType } from '../types';

const ALL_TYPES: GameType[] = ['Estrategia', 'Cartas', 'Filler', 'Cooperativo', 'Dados', 'Puzzle', 'Construcción', 'Negociación', 'Destreza', 'Familiar', 'Abstracto', 'Duel'];

const GAME_EMOJIS: Record<string, string> = {
  'Estrategia': '♟️', 'Cartas': '🃏', 'Filler': '⚡', 'Cooperativo': '🤝',
  'Dados': '🎲', 'Puzzle': '🧩', 'Construcción': '🏗️', 'Negociación': '🤝',
  'Destreza': '🎯', 'Familiar': '👨‍👩‍👧‍👦', 'Abstracto': '🔷', 'Duel': '⚔️',
};

type StatsView = 'global' | 'game' | 'type' | 'remigio' | 'achievements';

const ACHIEVEMENTS_MAP: Record<string, { name: string; icon: string; description: string }> = {
  racha_3: { name: 'Racha de 3', icon: '🔥', description: 'Ganar 3 partidas consecutivas' },
  club_100: { name: 'Club de los 100', icon: '💯', description: 'Superar 100 puntos en una partida' },
  pacificador: { name: 'El Pacificador', icon: '🕊️', description: 'Ganar 7 Wonders con 0 en militar' },
};

export default function Stats() {
  const { players, matches, games, playerAchievements } = useStore();
  const remigioSessions = useRemigioStore(s => s.sessions);
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

  // Ranking de Remigio: agregado por nombre de jugador (invitado) a lo largo
  // de todas las partidas. Lo relevante aquí es el balance económico.
  const remigioRanking = useMemo(() => {
    const byName = new Map<string, { name: string; partidas: number; wins: number; rounds: number; balance: number }>();
    for (const s of remigioSessions) {
      for (const p of s.players) {
        const key = p.guest_name.trim().toLowerCase();
        if (!key) continue;
        const e = byName.get(key) ?? { name: p.guest_name.trim(), partidas: 0, wins: 0, rounds: 0, balance: 0 };
        e.partidas += 1;
        if (s.winner_id === p.id) e.wins += 1;
        e.rounds += p.total_rounds_won;
        e.balance += getBalance(s, p.id);
        byName.set(key, e);
      }
    }
    return [...byName.values()].sort((a, b) => b.balance - a.balance || b.wins - a.wins);
  }, [remigioSessions]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Estadísticas</h2>
        <p className="text-sm text-muted-foreground">Rankings, logros y más</p>
      </div>

      <div className="glass-card p-1">
        <div className="flex gap-1">
          {[
            { key: 'global', label: '🌍 Global' },
            { key: 'game', label: '🎲 Juego' },
            { key: 'type', label: '🏷️ Tipo' },
            { key: 'remigio', label: '🃏 Remigio' },
            { key: 'achievements', label: '🏆 Logros' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => { setView(key as StatsView); setFilterGameId(''); setFilterType(''); setFilterExpansionId(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                view === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === 'game' && (
        <div className="space-y-2">
          <select value={filterGameId} onChange={e => { setFilterGameId(e.target.value); setFilterExpansionId(''); }}
            className="input-field">
            <option value="">Todos los juegos</option>
            {baseGames.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          {filterExpansions.length > 0 && (
            <select value={filterExpansionId} onChange={e => setFilterExpansionId(e.target.value)}
              className="input-field">
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
              className={`chip whitespace-nowrap ${filterType === t ? 'chip-active' : ''}`}>
              {GAME_EMOJIS[t]} {t}
            </button>
          ))}
        </div>
      )}

      {(view === 'global' || view === 'game' || view === 'type') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ranking</h3>
            <span className="text-xs text-muted-foreground font-semibold">{filteredMatches.length} partidas</span>
          </div>

          {rankings.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <p className="text-muted-foreground">No hay datos</p>
            </div>
          ) : (
            rankings.map((r, idx) => (
              <div key={r.player.id} className={`glass-card p-4 ${idx === 0 && r.wins > 0 ? 'ring-1 ring-amber-400/50' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg w-7 text-center">
                    {idx === 0 && r.wins > 0 ? '🥇' : idx === 1 && r.wins > 0 ? '🥈' : idx === 2 && r.wins > 0 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: r.player.color }}>
                    {r.player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground font-bold text-sm truncate">{r.player.name}</h4>
                    <p className="text-xs text-muted-foreground">{r.total} partidas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-black text-lg">{r.wins}<span className="text-xs font-medium text-muted-foreground">W</span></p>
                    <p className="text-xs text-muted-foreground font-semibold">{r.winRate.toFixed(0)}%</p>
                  </div>
                </div>

                {r.total > 0 && (
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all" style={{ width: `${r.winRate}%`, backgroundColor: r.player.color }} />
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-secondary rounded-lg py-1.5">
                    <p className="text-[10px] text-muted-foreground">Victorias</p>
                    <p className="text-xs text-green-600 font-bold">{r.wins}</p>
                  </div>
                  <div className="bg-secondary rounded-lg py-1.5">
                    <p className="text-[10px] text-muted-foreground">Derrotas</p>
                    <p className="text-xs text-red-600 font-bold">{r.losses}</p>
                  </div>
                  <div className="bg-secondary rounded-lg py-1.5">
                    <p className="text-[10px] text-muted-foreground">Pts/Partida</p>
                    <p className="text-xs text-foreground font-bold">{r.avgPoints.toFixed(1)}</p>
                  </div>
                  <div className="bg-secondary rounded-lg py-1.5">
                    <p className="text-[10px] text-muted-foreground">Racha</p>
                    <p className="text-xs text-amber-600 font-bold">{r.bestStreak}🔥</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'remigio' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ranking de Remigio</h3>
            <span className="text-xs text-muted-foreground font-semibold">{remigioSessions.length} partidas</span>
          </div>

          {remigioRanking.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <p className="text-muted-foreground">Aún no hay partidas de Remigio</p>
            </div>
          ) : (
            remigioRanking.map((r, idx) => (
              <div key={r.name} className={`glass-card p-4 ${idx === 0 && r.balance > 0 ? 'ring-1 ring-amber-400/50' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg w-7 text-center">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center font-bold border border-border">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground font-bold text-sm truncate">{r.name}</h4>
                    <p className="text-xs text-muted-foreground">{r.partidas} partidas · {r.wins} ganadas</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg tabular-nums ${r.balance > 0 ? 'text-green-600' : r.balance < 0 ? 'text-red-600' : 'text-foreground'}`}>
                      {r.balance > 0 ? '+' : ''}{r.balance.toFixed(2)}€
                    </p>
                    <p className="text-xs text-muted-foreground font-semibold">balance</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-secondary rounded-lg py-1.5">
                    <p className="text-[10px] text-muted-foreground">Partidas</p>
                    <p className="text-xs text-foreground font-bold">{r.partidas}</p>
                  </div>
                  <div className="bg-secondary rounded-lg py-1.5">
                    <p className="text-[10px] text-muted-foreground">Victorias</p>
                    <p className="text-xs text-green-600 font-bold">{r.wins}</p>
                  </div>
                  <div className="bg-secondary rounded-lg py-1.5">
                    <p className="text-[10px] text-muted-foreground">Rondas ganadas</p>
                    <p className="text-xs text-foreground font-bold">{r.rounds}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'achievements' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Logros disponibles</h3>
            <div className="space-y-3">
              {Object.entries(ACHIEVEMENTS_MAP).map(([id, info]) => {
                const unlocked = playerAchievements.filter(a => a.achievementId === id);
                return (
                  <div key={id} className="glass-card p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{info.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-foreground font-bold text-sm">{info.name}</h4>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                    {unlocked.length > 0 ? (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {unlocked.map(u => {
                          const player = players.find(p => p.id === u.playerId);
                          return player ? (
                            <span key={u.playerId} className="text-xs px-2.5 py-1 rounded-full text-white font-semibold"
                              style={{ backgroundColor: player.color }}>
                              {player.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-3">Nadie ha desbloqueado este logro aún</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Logros por jugador</h3>
            <div className="space-y-3">
              {players.map(player => {
                const pAch = playerAchievements.filter(a => a.playerId === player.id);
                return (
                  <div key={player.id} className="glass-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: player.color }}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-foreground font-bold text-sm">{player.name}</span>
                      <span className="ml-auto text-xs font-bold text-muted-foreground">{pAch.length}/{Object.keys(ACHIEVEMENTS_MAP).length}</span>
                    </div>
                    <div className="flex gap-3">
                      {Object.entries(ACHIEVEMENTS_MAP).map(([id, info]) => {
                        const has = pAch.some(a => a.achievementId === id);
                        return (
                          <span key={id} className={`text-2xl transition-all ${has ? '' : 'grayscale opacity-25'}`} title={info.name}>
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
