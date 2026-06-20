import { useState, useMemo, useEffect } from 'react';
import { Search, X, Dices, Check, Crown, Package, Target, Rocket } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PlayerScore, ScoreCategory } from '../types';
import { cn } from '../utils/cn';
import { GameCover } from './GameCover';

type PlayStep = 'selectGame' | 'selectPlayers' | 'configure' | 'scoring';

const GAME_EMOJIS: Record<string, string> = {
  'Estrategia': '♟️', 'Cartas': '🃏', 'Filler': '⚡', 'Cooperativo': '🤝',
  'Dados': '🎲', 'Puzzle': '🧩', 'Construcción': '🏗️', 'Negociación': '🤝',
  'Destreza': '🎯', 'Familiar': '👨‍👩‍👧‍👦', 'Abstracto': '🔷', 'Duel': '⚔️',
};

function typeGradient(type: string) {
  const key = type.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return `type-gradient-${key}`;
}

function StepHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {onBack && (
        <button onClick={onBack} className="btn btn-secondary px-3 py-2 text-sm">← Atrás</button>
      )}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function PlaySession() {
  const { games, players, addMatch, setTab } = useStore();
  const preselectedGameId = useStore((s) => s.selectedGameId);
  const setPreselectedGameId = useStore((s) => s.setSelectedGameId);
  const [step, setStep] = useState<PlayStep>('selectGame');
  const [selectedGameId, setSelectedGameId] = useState('');

  // Permite iniciar una partida directamente desde la Ludoteca: si hay un juego
  // preseleccionado en el store, se salta el paso de selección de juego.
  useEffect(() => {
    if (preselectedGameId && games.some((g) => g.id === preselectedGameId)) {
      setSelectedGameId(preselectedGameId);
      setStep('selectPlayers');
      setPreselectedGameId(null);
    }
  }, [preselectedGameId, games, setPreselectedGameId]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [activeExpansionIds, setActiveExpansionIds] = useState<string[]>([]);
  const [firstPlayerId, setFirstPlayerId] = useState('');
  const [playerScores, setPlayerScores] = useState<Record<string, Record<string, number>>>({});
  const [specialVictories, setSpecialVictories] = useState<Record<string, string>>({});
  const [winnerId, setWinnerId] = useState('');
  const [gameSearch, setGameSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name-asc' | 'duration-asc' | 'duration-desc' | 'favorites'>('favorites');

  const selectedGame = games.find(g => g.id === selectedGameId);
  const expansions = games.filter(g => g.baseGameId === selectedGameId);
  const baseGames = games.filter(g => !g.isExpansion);

  const filteredBaseGames = baseGames.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(gameSearch.toLowerCase());
    const matchFavorite = !favoritesOnly || !!g.isFavorite;
    return matchSearch && matchFavorite;
  });
  const sortedBaseGames = [...filteredBaseGames].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc': return a.name.localeCompare(b.name, 'es');
      case 'duration-asc': return (a.duration ?? Infinity) - (b.duration ?? Infinity);
      case 'duration-desc': return (b.duration ?? 0) - (a.duration ?? 0);
      case 'favorites':
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || a.name.localeCompare(b.name, 'es');
    }
  });

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
    setFavoritesOnly(false);
    setTab('history');
  };

  // Step: Select Game
  if (step === 'selectGame') {
    return (
      <div className="space-y-4">
        <StepHeader title="¿A qué jugamos?" subtitle="Elige un juego de tu ludoteca" />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input value={gameSearch} onChange={e => setGameSearch(e.target.value)} placeholder="Buscar juego..."
            className="input-field pl-10" />
          {gameSearch && (
            <button onClick={() => setGameSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">Ordenar:</span>
          <button onClick={() => setSortBy('favorites')}
            className={`chip whitespace-nowrap ${sortBy === 'favorites' ? 'chip-active' : ''}`}>♡ Favoritos</button>
          <button onClick={() => setSortBy('name-asc')}
            className={`chip whitespace-nowrap ${sortBy === 'name-asc' ? 'chip-active' : ''}`}>Nombre A-Z</button>
          <button onClick={() => setSortBy('duration-asc')}
            className={`chip whitespace-nowrap ${sortBy === 'duration-asc' ? 'chip-active' : ''}`}>Duración ↑</button>
          <button onClick={() => setSortBy('duration-desc')}
            className={`chip whitespace-nowrap ${sortBy === 'duration-desc' ? 'chip-active' : ''}`}>Duración ↓</button>
          <button
            onClick={() => setFavoritesOnly(v => !v)}
            className={`chip whitespace-nowrap ${favoritesOnly ? 'chip-active' : ''}`}>
            {favoritesOnly ? '♥ Solo favoritos' : '♡ Solo favoritos'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {sortedBaseGames.map(game => {
            return (
              <button key={game.id} onClick={() => { setSelectedGameId(game.id); setStep('selectPlayers'); }}
                className="glass-card overflow-hidden text-left hover:border-foreground/30 transition-colors group animate-slide-up relative">
                <div className={`h-28 relative overflow-hidden ${typeGradient(game.types[0])}`}>
                  {game.imageUrl ? (
                    <img src={game.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <GameCover game={game} className="group-hover:scale-105 transition-transform duration-500" />
                  )}
                  {game.isFavorite && (
                    <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs backdrop-blur-sm">♥</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-foreground text-sm font-bold leading-tight line-clamp-2">{game.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {game.types.slice(0, 2).map(t => (
                      <span key={t} className="text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {sortedBaseGames.length === 0 && (
          <div className="text-center py-16 glass-card">
            <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">No se encontraron juegos{gameSearch && ` con "${gameSearch}"`}</p>
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
            <p className="text-sm text-foreground font-bold">{selectedGame?.name}</p>
            <p className="text-xs text-muted-foreground">{selectedGame?.types.join(' • ')}</p>
          </div>
        </div>

        <div className="space-y-2">
          {players.map(player => {
            const sel = selectedPlayerIds.includes(player.id);
            return (
              <button key={player.id} onClick={() => togglePlayer(player.id)}
                className={cn('w-full flex items-center gap-3 p-3.5 rounded-xl transition-all border', sel ? 'bg-secondary border-foreground/30 ring-1 ring-foreground/15' : 'bg-card border-border hover:bg-secondary')}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: player.color }}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-foreground font-semibold flex-1 text-left">{player.name}</span>
                {sel && (
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Check className="h-3.5 w-3.5" /></span>
                )}
              </button>
            );
          })}
        </div>

        {players.length === 0 && (
          <div className="text-center py-12 glass-card">
            <p className="text-muted-foreground">Añade jugadores primero en la pestaña Jugadores</p>
          </div>
        )}

        {selectedPlayerIds.length >= 1 && (
          <button onClick={() => setStep('configure')}
            className="w-full btn btn-primary py-3.5 text-base">
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
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" /> Expansiones
            </h3>
            <div className="space-y-2">
              {expansions.map(exp => {
                const on = activeExpansionIds.includes(exp.id);
                return (
                  <button key={exp.id} onClick={() => toggleExpansion(exp.id)}
                    className={cn('w-full flex items-center gap-3 p-3 rounded-xl transition-all border', on ? 'bg-secondary border-foreground/30' : 'bg-card border-border hover:bg-secondary')}>
                    <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-all', on ? 'bg-primary border-primary' : 'border-input')}>
                      {on && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm text-foreground font-medium">{exp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" /> Jugador inicial
          </h3>
          <button onClick={randomFirstPlayer}
            className="w-full btn btn-primary py-3.5 text-base">
            <Dices className="h-5 w-5" /> Sortear jugador inicial
          </button>
          {firstPlayer && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-5 py-2.5 rounded-full border border-amber-200">
                <Crown className="h-4 w-4" />
                <span className="font-bold">{firstPlayer.name} empieza</span>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {selectedPlayers.map(p => (
              <button key={p.id} onClick={() => setFirstPlayerId(p.id)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-semibold transition-all border', firstPlayerId === p.id ? 'text-white border-transparent' : 'bg-secondary text-muted-foreground border-border')}
                style={firstPlayerId === p.id ? { backgroundColor: p.color } : {}}>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setStep('scoring')}
          className="w-full btn btn-primary py-3.5 text-base">
          <Rocket className="h-5 w-5" /> Empezar partida
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
            <span className="text-sm text-foreground font-bold">{selectedGame?.name}</span>
            {activeExpansionIds.length > 0 && (
              <span className="text-xs text-muted-foreground block">
                + {activeExpansionIds.map(id => games.find(g => g.id === id)?.name).join(', ')}
              </span>
            )}
          </div>
        </div>

        {hasSpecialVictory && allSpecialVictoryTypes.length > 0 && (
          <div className="glass-card p-4 border-amber-200 bg-amber-50">
            <h3 className="text-amber-700 font-bold text-sm mb-2 flex items-center gap-2">⚡ Victoria especial</h3>
            <p className="text-xs text-muted-foreground mb-3">Si alguien ganó por una condición especial, selecciónalo. No será necesario introducir puntos.</p>
            {selectedPlayers.map(player => (
              <div key={player.id} className="mb-3">
                <p className="text-xs text-foreground font-semibold mb-1.5">{player.name}</p>
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: player.color }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-foreground font-bold text-sm">{player.name}</span>
                  <span className="ml-auto text-xl font-black text-foreground tabular-nums">{getPlayerTotal(player.id)}</span>
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
                        <label className="text-[10px] font-semibold text-muted-foreground mb-0.5 block truncate">{cat.name}</label>
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Ganador</h3>
            <div className="flex gap-2 flex-wrap">
              {selectedPlayers.map(p => (
                <button key={p.id} onClick={() => setWinnerId(winnerId === p.id ? '' : p.id)}
                  className={`chip ${(winnerId || determineWinner()) === p.id ? 'bg-amber-500 text-white border-transparent' : ''}`}>
                  <Crown className="h-3 w-3" /> {p.name} ({getPlayerTotal(p.id)})
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleFinish}
          className="w-full btn btn-success py-3.5 text-base">
          <Check className="h-5 w-5" /> Guardar partida
        </button>
      </div>
    );
  }

  return null;
}
