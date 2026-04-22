import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PlayerScore, ScoreCategory } from '../types';

type PlayStep = 'selectGame' | 'selectPlayers' | 'configure' | 'scoring' | 'results';

const GAME_EMOJIS: Record<string, string> = {
  'Estrategia': '♟️', 'Cartas': '🃏', 'Filler': '⚡', 'Cooperativo': '🤝',
  'Dados': '🎲', 'Puzzle': '🧩', 'Construcción': '🏗️', 'Negociación': '🤝',
  'Destreza': '🎯', 'Familiar': '👨‍👩‍👧‍👦', 'Abstracto': '🔷', 'Duel': '⚔️',
};

const GAME_GRADIENTS: Record<string, string> = {
  'Estrategia': 'from-blue-900/80 to-indigo-800/60',
  'Cartas': 'from-red-900/80 to-rose-800/60',
  'Filler': 'from-green-900/80 to-emerald-800/60',
  'Cooperativo': 'from-teal-900/80 to-cyan-800/60',
  'Dados': 'from-orange-900/80 to-amber-800/60',
  'Puzzle': 'from-purple-900/80 to-violet-800/60',
  'Construcción': 'from-yellow-900/80 to-amber-800/60',
  'Negociación': 'from-pink-900/80 to-fuchsia-800/60',
  'Destreza': 'from-lime-900/80 to-green-800/60',
  'Familiar': 'from-sky-900/80 to-blue-800/60',
  'Abstracto': 'from-gray-800/80 to-slate-700/60',
  'Duel': 'from-red-900/80 to-orange-800/60',
};

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

  // Build complete scoring categories including active expansions
  const allCategories = useMemo(() => {
    if (!selectedGame) return [];
    let cats = [...selectedGame.scoringTemplate.categories];
    activeExpansionIds.forEach(eid => {
      const exp = games.find(g => g.id === eid);
      if (exp) cats = [...cats, ...exp.scoringTemplate.categories];
    });
    return cats;
  }, [selectedGame, activeExpansionIds, games]);

  // Collect all special victory types
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
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">¿A qué jugamos?</h2>
        
        {/* Search bar */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            value={gameSearch}
            onChange={e => setGameSearch(e.target.value)}
            placeholder="Buscar juego..."
            className="w-full bg-gray-800 text-white rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          {gameSearch && (
            <button onClick={() => setGameSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm">
              ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredBaseGames.map(game => {
            const gradient = GAME_GRADIENTS[game.types[0]] || 'from-gray-800 to-gray-700';
            const emoji = GAME_EMOJIS[game.types[0]] || '🎲';
            return (
              <button key={game.id} onClick={() => { setSelectedGameId(game.id); setStep('selectPlayers'); }}
                className="bg-gray-800 rounded-xl overflow-hidden text-left hover:ring-2 hover:ring-purple-500 transition-all group">
                <div className={`h-24 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden relative`}>
                  {game.imageUrl ? (
                    <img src={game.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <span className="text-3xl opacity-40">{emoji}</span>
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="text-white text-sm font-semibold leading-tight line-clamp-2">{game.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {game.types.slice(0, 2).map(t => (
                      <span key={t} className="text-[9px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filteredBaseGames.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">No se encontraron juegos con "{gameSearch}"</p>
          </div>
        )}
      </div>
    );
  }

  // Step: Select Players
  if (step === 'selectPlayers') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep('selectGame')} className="text-gray-400 hover:text-white">← Atrás</button>
          <h2 className="text-lg font-bold text-white">Jugadores</h2>
          <div className="w-12" />
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3 flex items-center gap-3">
          {selectedGame?.imageUrl ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
              <img src={selectedGame.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center shrink-0">
              <span className="text-lg">{GAME_EMOJIS[selectedGame?.types[0] || ''] || '🎲'}</span>
            </div>
          )}
          <span className="text-sm text-white font-semibold">{selectedGame?.name}</span>
        </div>

        <div className="space-y-2">
          {players.map(player => (
            <button key={player.id} onClick={() => togglePlayer(player.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                selectedPlayerIds.includes(player.id) ? 'bg-purple-600/20 ring-2 ring-purple-500' : 'bg-gray-800 hover:bg-gray-700'
              }`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: player.color }}>
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-white font-medium flex-1 text-left">{player.name}</span>
              {selectedPlayerIds.includes(player.id) && <span className="text-purple-400 text-xl">✓</span>}
            </button>
          ))}
        </div>

        {players.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">Añade jugadores primero en la pestaña Jugadores</p>
        )}

        {selectedPlayerIds.length >= 1 && (
          <button onClick={() => setStep('configure')}
            className="w-full bg-purple-600 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-purple-500 transition-colors">
            Continuar ({selectedPlayerIds.length} jugadores)
          </button>
        )}
      </div>
    );
  }

  // Step: Configure (expansions + first player)
  if (step === 'configure') {
    const selectedPlayers = players.filter(p => selectedPlayerIds.includes(p.id));
    const firstPlayer = players.find(p => p.id === firstPlayerId);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep('selectPlayers')} className="text-gray-400 hover:text-white">← Atrás</button>
          <h2 className="text-lg font-bold text-white">Configurar Partida</h2>
          <div className="w-12" />
        </div>

        {/* Expansions */}
        {expansions.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">📦 Expansiones</h3>
            <div className="space-y-2">
              {expansions.map(exp => (
                <button key={exp.id} onClick={() => toggleExpansion(exp.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeExpansionIds.includes(exp.id) ? 'bg-purple-600/20 ring-1 ring-purple-500' : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    activeExpansionIds.includes(exp.id) ? 'bg-purple-600 border-purple-600' : 'border-gray-500'
                  }`}>
                    {activeExpansionIds.includes(exp.id) && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-sm text-white">{exp.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* First player randomizer */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">🎯 Jugador Inicial</h3>
          <button onClick={randomFirstPlayer}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl py-4 font-bold text-base hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95 transform">
            🎲 ¡Sortear!
          </button>
          {firstPlayer && (
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full">
                <span className="text-lg">👑</span>
                <span className="font-semibold">{firstPlayer.name} empieza</span>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-3 flex-wrap justify-center">
            {selectedPlayers.map(p => (
              <button key={p.id} onClick={() => setFirstPlayerId(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  firstPlayerId === p.id ? 'ring-2 ring-amber-400 text-white' : 'bg-gray-700 text-gray-400'
                }`} style={firstPlayerId === p.id ? { backgroundColor: p.color } : {}}>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setStep('scoring')}
          className="w-full bg-purple-600 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-purple-500 transition-colors">
          Empezar Partida 🚀
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
        <div className="flex items-center justify-between">
          <button onClick={() => setStep('configure')} className="text-gray-400 hover:text-white">← Atrás</button>
          <h2 className="text-lg font-bold text-white">Puntuación</h2>
          <div className="w-12" />
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3 flex items-center gap-3">
          {selectedGame?.imageUrl ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
              <img src={selectedGame.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : null}
          <div>
            <span className="text-sm text-white font-semibold">{selectedGame?.name}</span>
            {activeExpansionIds.length > 0 && (
              <span className="text-xs text-purple-400 block">
                + {activeExpansionIds.map(id => games.find(g => g.id === id)?.name).join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Special Victory buttons */}
        {hasSpecialVictory && allSpecialVictoryTypes.length > 0 && (
          <div className="bg-amber-900/20 rounded-xl p-4">
            <h3 className="text-amber-400 font-semibold text-sm mb-3">⚡ Victoria Especial</h3>
            <p className="text-xs text-gray-400 mb-3">Si alguien ganó por una condición especial, selecciona al jugador y el tipo de victoria. No será necesario introducir puntos.</p>
            {selectedPlayers.map(player => (
              <div key={player.id} className="mb-2">
                <p className="text-xs text-gray-300 mb-1.5">{player.name}:</p>
                <div className="flex gap-1.5 flex-wrap">
                  {allSpecialVictoryTypes.map(svt => (
                    <button key={svt} onClick={() => setSpecialVictory(player.id, svt)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        specialVictories[player.id] === svt
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}>
                      {svt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Score inputs */}
        {!hasAnySpecialVictory && (
          <div className="space-y-3">
            {selectedPlayers.map(player => (
              <div key={player.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: player.color }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-semibold text-sm">{player.name}</span>
                  <span className="ml-auto text-lg font-bold text-purple-400">{getPlayerTotal(player.id)}</span>
                </div>

                {isSimple ? (
                  <input type="number" inputMode="numeric" value={playerScores[player.id]?.['total'] ?? ''}
                    onChange={e => updateScore(player.id, 'total', parseInt(e.target.value) || 0)}
                    placeholder="Puntuación total"
                    className="w-full bg-gray-700 text-white text-center rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-semibold" />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {allCategories.map((cat: ScoreCategory) => (
                      <div key={cat.id}>
                        <label className="text-[10px] text-gray-400 mb-0.5 block truncate">{cat.name}</label>
                        <input type="number" inputMode="numeric" value={playerScores[player.id]?.[cat.id] ?? ''}
                          onChange={e => updateScore(player.id, cat.id, parseInt(e.target.value) || 0)}
                          className="w-full bg-gray-700 text-white text-center rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Manual winner selection if special victory is not used */}
        {!hasAnySpecialVictory && (
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Ganador (auto o manual)</h3>
            <div className="flex gap-2 flex-wrap">
              {selectedPlayers.map(p => (
                <button key={p.id} onClick={() => setWinnerId(winnerId === p.id ? '' : p.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    (winnerId || determineWinner()) === p.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                  👑 {p.name} ({getPlayerTotal(p.id)})
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleFinish}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl py-3.5 font-semibold text-base hover:from-green-500 hover:to-emerald-500 transition-all">
          ✅ Guardar Partida
        </button>
      </div>
    );
  }

  return null;
}
