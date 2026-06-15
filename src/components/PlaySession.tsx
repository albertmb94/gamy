import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PlayerScore, ScoreCategory } from '../types';

type PlayStep = 'selectGame' | 'selectPlayers' | 'configure' | 'scoring';

const GAME_EMOJIS: Record<string, string> = {
  'Estrategia': '♟️', 'Cartas': '🃏', 'Filler': '⚡', 'Cooperativo': '🤝',
  'Dados': '🎲', 'Puzzle': '🧩', 'Construcción': '🏗️', 'Negociación': '🤝',
  'Destreza': '🎯', 'Familiar': '👨‍👩‍👧‍👦', 'Abstracto': '🔷', 'Duel': '⚔️',
};

function typeGradient(type: string) {
  const key = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return `type-gradient-${key}`;
}

function StepHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {onBack && (
        <button onClick={onBack} className="btn btn-secondary px-3 py-2 text-sm">← Atrás</button>
      )}
      <div>
        <h2 className="text-2xl font-extrabold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function PlaySession() {
  const { games, players, addMatch, setTab } = useStore();
  const [step, setStep] = useState<PlayStep>('selectGame');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [activeExpansionIds, setActiveExpansionIds] = useState<string[]>([]);
  const [firstPlayerId, setFirstPlayerId] = useState('');
  const [playerScores, setPlayerScores] = useState<Record<string, Record<string, number>>>({});
  const [specialVictories, setSpecialVictories] = useState<Record<string, string>>({});
  const [winnerId, setWinnerId] = useState('');
  const [gameSearch, setGameSearch] = useState('');

  const selectedGame = games.find(g => g.id === selectedGameId);
  const expansions = games.filter(g => g.baseGameId === selectedGameId);
  const baseGames = games.filter(g => !g.isExpansion);

  const filteredBaseGames = baseGames.filter(g =>
    g.name.toLowerCase().includes(gameSearch.toLowerCase())
  );

  const allCategories = useMemo(() => {
    if (!selectedGame) return [];
    let cats = [...selectedGame.scoringTemplate.categories];
    activeExpansionIds.forEach(eid => {
      const exp = games.find(g => g.id === eid);
      if (exp) cats = [...cats, ...exp.scoringTemplate.categories];
    });
    return cats;
  }, [selectedGame, activeExpansionIds, games]);

  const allSpecialVictoryTypes = useMemo(() => {
    if (!selectedGame) return [];
    let types = [...(selectedGame.specialVictoryTypes || [])];
    activeExpansionIds.forEach(eid => {
      const exp = games.find(g => g.id === eid);
      if (exp?.specialVictoryTypes) types = [...types, ...exp.specialVictoryTypes];
    });
    return types;
  }, [selectedGame, activeExpansionIds, games]);

  const hasSpecialVictory = selectedGame?.allowSpecialVictory || activeExpansionIds.some(eid => games.find(g => g.id === eid)?.allowSpecialVictory);

  const togglePlayer = (id: string) => {
    setSelectedPlayerIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleExpansion = (id: string) => {
    setActiveExpansionIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const randomFirstPlayer = () => {
    if (selectedPlayerIds.length === 0) return;
    const idx = Math.floor(Math.random() * selectedPlayerIds.length);
    setFirstPlayerId(selectedPlayerIds[idx]);
  };

  const updateScore = (playerId: string, catId: string, value: number) => {
    setPlayerScores(prev => ({
      ...prev,
      [playerId]: { ...(prev[playerId] || {}), [catId]: value }
    }));
  };

  const setSpecialVictory = (playerId: string, victoryType: string) => {
    if (specialVictories[playerId] === victoryType) {
      setSpecialVictories(prev => { const n = { ...prev }; delete n[playerId]; return n; });
    } else {
      setSpecialVictories({ [playerId]: victoryType });
      setWinnerId(playerId);
    }
  };

  const getPlayerTotal = (playerId: string): number => {
    const scores = playerScores[playerId] || {};
    return allCategories.reduce((sum, cat) => sum + (scores[cat.id] || 0), 0);
  };

  const hasAnySpecialVictory = Object.keys(specialVictories).length > 0;

  const determineWinner = (): string => {
    if (hasAnySpecialVictory) {
      return Object.keys(specialVictories)[0];
    }
    let maxScore = -Infinity;
    let winner = '';
    selectedPlayerIds.forEach(pid => {
      const total = getPlayerTotal(pid);
      if (total > maxScore) { maxScore = total; winner = pid; }
    });
    return winner;
  };

  const handleFinish = () => {
    const finalWinnerId = winnerId || determineWinner();
    const finalScores: PlayerScore[] = selectedPlayerIds.map(pid => ({
      playerId: pid,
      scores: playerScores[pid] || {},
      total: getPlayerTotal(pid),
      specialVictory: specialVictories[pid],
    }));

    addMatch({
      gameId: selectedGameId,
      date: new Date().toISOString(),
      playerIds: selectedPlayerIds,
      activeExpansionIds,
      playerScores: finalScores,
      winnerId: finalWinnerId,
      firstPlayerId: firstPlayerId || undefined,
    });

    setStep('selectGame');
    setSelectedGameId('');
    setSelectedPlayerIds([]);
    setActiveExpansionIds([]);
    setFirstPlayerId('');
    setPlayerScores({});
    setSpecialVictories({});
    setWinnerId('');
    setGameSearch('');
    setTab('history');
  };

  // Step: Select Game
  if (step === 'selectGame') {
    return (
      <div className="space-y-4">
        <StepHeader title="¿A qué jugamos?" subtitle="Elige un juego de tu ludoteca" />

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">🔍</span>
          <input value={gameSearch} onChange={e => setGameSearch(e.target.value)} placeholder="Buscar juego..."
            className="input-field pl-10" />
          {gameSearch && (
            <button onClick={() => setGameSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white">✕</button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredBaseGames.map(game => {
            const emoji = GAME_EMOJIS[game.types[0]] || '🎲';
            return (
              <button key={game.id} onClick={() => { setSelectedGameId(game.id); setStep('selectPlayers'); }}
                className="glass-card overflow-hidden text-left hover:ring-2 hover:ring-violet-500/50 transition-all group animate-slide-up">
                <div className={`h-28 relative overflow-hidden ${typeGradient(game.types[0])}`}>
                  {game.imageUrl ? (
                    <img src={game.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-40">{emoji}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-bold leading-tight line-clamp-2">{game.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {game.types.slice(0, 2).map(t => (
                      <span key={t} className="text-[9px] bg-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filteredBaseGames.length === 0 && (
          <div className="text-center py-16 glass-card">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-[var(--text-secondary)] font-medium">No se encontraron juegos con "{gameSearch}"</p>
          </div>
        )}
      </div>
    );
  }

  // Step: Select Players
  if (step === 'selectPlayers') {
    return (
      <div className="space-y-4">
        <StepHeader title="Jugadores" subtitle="Selecciona quién juega" onBack={() => setStep('selectGame')} />

        <div className="glass-card p-3 flex items-center gap-3">
          {selectedGame?.imageUrl ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              <img src={selectedGame.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${typeGradient(selectedGame?.types[0] || '')}`}>
              <span className="text-xl">{GAME_EMOJIS[selectedGame?.types[0] || ''] || '🎲'}</span>
            </div>
          )}
          <div>
            <p className="text-sm text-white font-bold">{selectedGame?.name}</p>
            <p className="text-xs text-[var(--text-secondary)]">{selectedGame?.types.join(' • ')}</p>
          </div>
        </div>

        <div className="space-y-2">
          {players.map(player => (
            <button key={player.id} onClick={() => togglePlayer(player.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all border ${
                selectedPlayerIds.includes(player.id)
                  ? 'bg-violet-600/15 border-violet-500/50 ring-1 ring-violet-500/30'
                  : 'bg-slate-800/40 border-[var(--border)] hover:bg-slate-800/70'
              }`}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                style={{ backgroundColor: player.color }}>
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-white font-semibold flex-1 text-left">{player.name}</span>
              {selectedPlayerIds.includes(player.id) && (
                <span className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">✓</span>
              )}
            </button>
          ))}
        </div>

        {players.length === 0 && (
          <div className="text-center py-12 glass-card">
            <p className="text-4xl mb-3">👤</p>
            <p className="text-[var(--text-secondary)]">Añade jugadores primero en la pestaña Jugadores</p>
          </div>
        )}

        {selectedPlayerIds.length >= 1 && (
          <button onClick={() => setStep('configure')}
            className="w-full btn btn-primary py-3.5 text-base shadow-lg shadow-violet-900/40">
            Continuar con {selectedPlayerIds.length} jugadores
          </button>
        )}
      </div>
    );
  }

  // Step: Configure
  if (step === 'configure') {
    const selectedPlayers = players.filter(p => selectedPlayerIds.includes(p.id));
    const firstPlayer = players.find(p => p.id === firstPlayerId);

    return (
      <div className="space-y-4">
        <StepHeader title="Configurar partida" subtitle="Expansiones y jugador inicial" onBack={() => setStep('selectPlayers')} />

        {expansions.length > 0 && (
          <div className="glass-card p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span>📦</span> Expansiones
            </h3>
            <div className="space-y-2">
              {expansions.map(exp => (
                <button key={exp.id} onClick={() => toggleExpansion(exp.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                    activeExpansionIds.includes(exp.id)
                      ? 'bg-violet-600/15 border-violet-500/50'
                      : 'bg-slate-800/40 border-[var(--border)] hover:bg-slate-800/70'
                  }`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    activeExpansionIds.includes(exp.id) ? 'bg-violet-600 border-violet-600' : 'border-slate-500'
                  }`}>
                    {activeExpansionIds.includes(exp.id) && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-sm text-white font-medium">{exp.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span>🎯</span> Jugador inicial
          </h3>
          <button onClick={randomFirstPlayer}
            className="w-full btn btn-primary bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 py-3.5 text-base shadow-lg shadow-violet-900/30">
            🎲 Sortear jugador inicial
          </button>
          {firstPlayer && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 px-5 py-2.5 rounded-full border border-amber-500/30">
                <span className="text-lg">👑</span>
                <span className="font-bold">{firstPlayer.name} empieza</span>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {selectedPlayers.map(p => (
              <button key={p.id} onClick={() => setFirstPlayerId(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  firstPlayerId === p.id ? 'text-white border-transparent' : 'bg-slate-800/60 text-[var(--text-secondary)] border-[var(--border)]'
                }`} style={firstPlayerId === p.id ? { backgroundColor: p.color } : {}}>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setStep('scoring')}
          className="w-full btn btn-primary py-3.5 text-base shadow-lg shadow-violet-900/40">
          Empezar partida 🚀
        </button>
      </div>
    );
  }

  // Step: Scoring
  if (step === 'scoring') {
    const selectedPlayers = players.filter(p => selectedPlayerIds.includes(p.id));
    const isSimple = selectedGame?.scoringTemplate.type === 'simple' && activeExpansionIds.length === 0;

    return (
      <div className="space-y-4">
        <StepHeader title="Puntuación" subtitle="Introduce los resultados" onBack={() => setStep('configure')} />

        <div className="glass-card p-3 flex items-center gap-3">
          {selectedGame?.imageUrl ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
              <img src={selectedGame.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : null}
          <div>
            <span className="text-sm text-white font-bold">{selectedGame?.name}</span>
            {activeExpansionIds.length > 0 && (
              <span className="text-xs text-violet-300 block">
                + {activeExpansionIds.map(id => games.find(g => g.id === id)?.name).join(', ')}
              </span>
            )}
          </div>
        </div>

        {hasSpecialVictory && allSpecialVictoryTypes.length > 0 && (
          <div className="glass-card p-4 border-amber-500/20 bg-amber-500/5">
            <h3 className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-2"><span>⚡</span> Victoria especial</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-3">Si alguien ganó por una condición especial, selecciónalo. No será necesario introducir puntos.</p>
            {selectedPlayers.map(player => (
              <div key={player.id} className="mb-3">
                <p className="text-xs text-white font-semibold mb-1.5">{player.name}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {allSpecialVictoryTypes.map(svt => (
                    <button key={svt} onClick={() => setSpecialVictory(player.id, svt)}
                      className={`chip ${specialVictories[player.id] === svt ? 'bg-amber-500 text-white border-transparent' : ''}`}>
                      {svt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!hasAnySpecialVictory && (
          <div className="space-y-3">
            {selectedPlayers.map(player => (
              <div key={player.id} className="glass-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: player.color }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-bold text-sm">{player.name}</span>
                  <span className="ml-auto text-xl font-black text-violet-300">{getPlayerTotal(player.id)}</span>
                </div>

                {isSimple ? (
                  <input type="number" inputMode="numeric" value={playerScores[player.id]?.['total'] ?? ''}
                    onChange={e => updateScore(player.id, 'total', parseInt(e.target.value) || 0)}
                    placeholder="Puntuación total"
                    className="input-field text-center text-lg font-bold py-3" />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {allCategories.map((cat: ScoreCategory) => (
                      <div key={cat.id}>
                        <label className="text-[10px] font-semibold text-[var(--text-muted)] mb-0.5 block truncate">{cat.name}</label>
                        <input type="number" inputMode="numeric" value={playerScores[player.id]?.[cat.id] ?? ''}
                          onChange={e => updateScore(player.id, cat.id, parseInt(e.target.value) || 0)}
                          className="input-field text-center text-sm py-2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!hasAnySpecialVictory && (
          <div className="glass-card p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Ganador</h3>
            <div className="flex gap-2 flex-wrap">
              {selectedPlayers.map(p => (
                <button key={p.id} onClick={() => setWinnerId(winnerId === p.id ? '' : p.id)}
                  className={`chip ${(winnerId || determineWinner()) === p.id ? 'bg-amber-500 text-white border-transparent' : ''}`}>
                  👑 {p.name} ({getPlayerTotal(p.id)})
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleFinish}
          className="w-full btn btn-success py-3.5 text-base shadow-lg shadow-emerald-900/30">
          ✅ Guardar partida
        </button>
      </div>
    );
  }

  return null;
}
