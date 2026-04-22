import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Game, GameType, ScoringTemplate, ScoreCategory } from '../types';
import { v4 as uuid } from 'uuid';

const ALL_TYPES: GameType[] = ['Estrategia', 'Cartas', 'Filler', 'Cooperativo', 'Dados', 'Puzzle', 'Construcción', 'Negociación', 'Destreza', 'Familiar', 'Abstracto', 'Duel'];

const DURATION_RANGES = [
  { label: 'Todos', min: 0, max: 9999 },
  { label: '≤15\'', min: 0, max: 15 },
  { label: '16-30\'', min: 16, max: 30 },
  { label: '31-45\'', min: 31, max: 45 },
  { label: '46-60\'', min: 46, max: 60 },
  { label: '61-90\'', min: 61, max: 90 },
  { label: '90+\'', min: 91, max: 9999 },
];

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

const GAME_EMOJIS: Record<string, string> = {
  'Estrategia': '♟️',
  'Cartas': '🃏',
  'Filler': '⚡',
  'Cooperativo': '🤝',
  'Dados': '🎲',
  'Puzzle': '🧩',
  'Construcción': '🏗️',
  'Negociación': '🤝',
  'Destreza': '🎯',
  'Familiar': '👨‍👩‍👧‍👦',
  'Abstracto': '🔷',
  'Duel': '⚔️',
};

function StarRating({ value, onChange, size = 'sm' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'xs' }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-0.5">
      {stars.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(value === s ? 0 : s)}
          disabled={!onChange}
          className={`${size === 'sm' ? 'text-sm' : 'text-[10px]'} ${!onChange ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
        >
          <span className={s <= value ? 'text-amber-400' : 'text-gray-600'}>{s <= value ? '★' : '☆'}</span>
        </button>
      ))}
    </div>
  );
}

function DurationBadge({ minutes }: { minutes?: number }) {
  if (!minutes) return null;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const label = hrs > 0 ? `${hrs}h${mins > 0 ? `${mins}` : ''}` : `${mins}'`;
  return (
    <span className="text-[10px] bg-gray-700/80 text-gray-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
      <span className="text-[9px]">⏱</span>{label}
    </span>
  );
}

// ---- Game Form ----
function GameForm({ gameToEdit, onClose }: { gameToEdit?: Game; onClose: () => void }) {
  const { games, addGame, updateGame } = useStore();
  const [name, setName] = useState(gameToEdit?.name || '');
  const [imageUrl, setImageUrl] = useState(gameToEdit?.imageUrl || '');
  const [types, setTypes] = useState<GameType[]>(gameToEdit?.types || []);
  const [isExpansion, setIsExpansion] = useState(gameToEdit?.isExpansion || false);
  const [baseGameId, setBaseGameId] = useState(gameToEdit?.baseGameId || '');
  const [scoringType, setScoringType] = useState<'simple' | 'complex'>(gameToEdit?.scoringTemplate.type || 'simple');
  const [categories, setCategories] = useState<ScoreCategory[]>(
    gameToEdit?.scoringTemplate.type === 'complex' ? gameToEdit.scoringTemplate.categories : []
  );
  const [allowSpecialVictory, setAllowSpecialVictory] = useState(gameToEdit?.allowSpecialVictory || false);
  const [specialVictoryTypes, setSpecialVictoryTypes] = useState<string[]>(gameToEdit?.specialVictoryTypes || []);
  const [newSVT, setNewSVT] = useState('');
  const [difficulty, setDifficulty] = useState(gameToEdit?.difficulty || 0);
  const [duration, setDuration] = useState(gameToEdit?.duration || 0);
  const [newCatName, setNewCatName] = useState('');

  const baseGames = games.filter(g => !g.isExpansion && g.id !== gameToEdit?.id);

  const toggleType = (t: GameType) => {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const addCategoryFromText = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    setCategories(prev => [...prev, { id: uuid(), name: trimmed, metadata: 'general' }]);
    setNewCatName('');
  };

  const updateCategory = (idx: number, updates: Partial<ScoreCategory>) => {
    setCategories(prev => prev.map((c, i) => i === idx ? { ...c, ...updates } : c));
  };

  const removeCategory = (idx: number) => {
    setCategories(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const template: ScoringTemplate = scoringType === 'simple'
      ? { type: 'simple', categories: [{ id: 'total', name: 'Total' }] }
      : { type: 'complex', categories };

    if (gameToEdit) {
      updateGame(gameToEdit.id, {
        name: name.trim(),
        imageUrl: imageUrl.trim() || undefined,
        types,
        isExpansion,
        baseGameId: isExpansion ? baseGameId : undefined,
        scoringTemplate: template,
        allowSpecialVictory,
        specialVictoryTypes: allowSpecialVictory ? specialVictoryTypes : undefined,
        difficulty: difficulty || undefined,
        duration: duration || undefined,
      });
    } else {
      addGame({
        name: name.trim(),
        imageUrl: imageUrl.trim() || undefined,
        types,
        isExpansion,
        baseGameId: isExpansion ? baseGameId : undefined,
        scoringTemplate: template,
        allowSpecialVictory,
        specialVictoryTypes: allowSpecialVictory ? specialVictoryTypes : undefined,
        difficulty: difficulty || undefined,
        duration: duration || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">{gameToEdit ? 'Editar Juego' : 'Nuevo Juego'}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Nombre *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del juego"
              className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">URL de imagen</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://... o /images/mi-juego.jpg"
              className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            {imageUrl && (
              <div className="mt-2 h-24 w-24 rounded-lg overflow-hidden bg-gray-700">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Dificultad</label>
            <StarRating value={difficulty} onChange={setDifficulty} size="sm" />
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Duración (minutos)</label>
            <div className="flex items-center gap-2">
              <input type="number" inputMode="numeric" value={duration || ''} onChange={e => setDuration(parseInt(e.target.value) || 0)}
                placeholder="ej: 45" className="w-28 bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <div className="flex gap-1.5 flex-wrap">
                {[15, 30, 45, 60, 90, 120].map(m => (
                  <button key={m} type="button" onClick={() => setDuration(m)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${duration === m ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    {m}'
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Tipo de juego</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TYPES.map(t => (
                <button key={t} onClick={() => toggleType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${types.includes(t) ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isExpansion} onChange={e => setIsExpansion(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
            <span className="text-sm text-gray-300">Es una expansión</span>
          </div>

          {isExpansion && (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Juego base</label>
              <select value={baseGameId} onChange={e => setBaseGameId(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Seleccionar...</option>
                {baseGames.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Plantilla de puntuación</label>
            <div className="flex gap-2">
              <button onClick={() => setScoringType('simple')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${scoringType === 'simple' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                Simple
              </button>
              <button onClick={() => setScoringType('complex')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${scoringType === 'complex' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                Compleja
              </button>
            </div>
          </div>

          {scoringType === 'complex' && (
            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="flex gap-2 items-center">
                  <input value={cat.name} onChange={e => updateCategory(idx, { name: e.target.value })}
                    placeholder="Categoría" className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <select value={cat.metadata || 'general'} onChange={e => updateCategory(idx, { metadata: e.target.value as ScoreCategory['metadata'] })}
                    className="bg-gray-700 text-white rounded-lg px-2 py-2 text-xs focus:outline-none">
                    <option value="general">General</option>
                    <option value="militar">Militar</option>
                    <option value="ciencia">Ciencia</option>
                    <option value="comercio">Comercio</option>
                    <option value="civil">Civil</option>
                    <option value="gremio">Gremio</option>
                    <option value="maravilla">Maravilla</option>
                    <option value="moneda">Moneda</option>
                    <option value="progreso">Progreso</option>
                    <option value="politica">Política</option>
                  </select>
                  <button onClick={() => removeCategory(idx)} className="text-red-400 p-1 hover:text-red-300">✕</button>
                </div>
              ))}
              
              {/* Add category by typing */}
              <div className="flex gap-2 items-center">
                <input
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategoryFromText(); } }}
                  placeholder="Escribir nueva categoría..."
                  className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button onClick={addCategoryFromText}
                  className="bg-purple-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-purple-500 transition-colors">
                  +
                </button>
              </div>
              <p className="text-[10px] text-gray-500">Escribe el nombre y pulsa + o Enter. Puedes cambiar el tipo de metadata en el desplegable.</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={allowSpecialVictory} onChange={e => setAllowSpecialVictory(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
            <span className="text-sm text-gray-300">Victoria especial</span>
          </div>

          {allowSpecialVictory && (
            <div className="space-y-2">
              {specialVictoryTypes.map((svt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm">{svt}</span>
                  <button onClick={() => setSpecialVictoryTypes(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 p-1">✕</button>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={newSVT} onChange={e => setNewSVT(e.target.value)} placeholder="Ej: Supremacía Militar"
                  className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <button onClick={() => { if (newSVT.trim()) { setSpecialVictoryTypes(p => [...p, newSVT.trim()]); setNewSVT(''); } }}
                  className="bg-purple-600 text-white rounded-lg px-3 py-2 text-sm font-medium">+</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-700 text-gray-300 rounded-xl py-3 font-medium">Cancelar</button>
          <button onClick={handleSave} className="flex-1 bg-purple-600 text-white rounded-xl py-3 font-medium">
            {gameToEdit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Game Detail ----
function GameDetail({ game, onClose }: { game: Game; onClose: () => void }) {
  const { games, matches, players, deleteGame, setEditingGameId, setShowGameForm } = useStore();
  const expansions = games.filter(g => g.baseGameId === game.id);
  const baseGame = game.isExpansion ? games.find(g => g.id === game.baseGameId) : null;
  const gameMatches = matches.filter(m => m.gameId === game.id);

  const handleEdit = () => {
    setEditingGameId(game.id);
    setShowGameForm(true);
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar "${game.name}" y todas sus partidas?`)) {
      deleteGame(game.id);
      onClose();
    }
  };

  const gradient = GAME_GRADIENTS[game.types[0]] || 'from-gray-800 to-gray-700';
  const emoji = GAME_EMOJIS[game.types[0]] || '🎲';

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl" onClick={e => e.stopPropagation()}>
        <div className={`h-52 w-full overflow-hidden rounded-t-2xl relative bg-gradient-to-br ${gradient}`}>
          {game.imageUrl ? (
            <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-50">{emoji}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">✕</button>
        </div>
        <div className="p-5 -mt-8 relative z-10">
          <h2 className="text-xl font-bold text-white mb-1">{game.name}</h2>

          {game.isExpansion && baseGame && (
            <p className="text-sm text-purple-400 mb-2">📦 Expansión de: {baseGame.name}</p>
          )}

          <div className="flex items-center gap-3 mb-3">
            {game.difficulty && <StarRating value={game.difficulty} size="xs" />}
            {game.duration && <DurationBadge minutes={game.duration} />}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {game.types.map(t => (
              <span key={t} className="px-2.5 py-1 rounded-full text-xs bg-gray-700 text-gray-300">{t}</span>
            ))}
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Puntuación: {game.scoringTemplate.type === 'simple' ? 'Simple' : 'Compleja'}</h3>
            {game.scoringTemplate.type === 'complex' && (
              <div className="flex flex-wrap gap-1.5">
                {game.scoringTemplate.categories.map(c => (
                  <span key={c.id} className="text-xs bg-gray-700 px-2 py-1 rounded-lg text-gray-300">
                    {c.name} {c.metadata && c.metadata !== 'general' && <span className="text-purple-400">({c.metadata})</span>}
                  </span>
                ))}
              </div>
            )}
            {game.allowSpecialVictory && (
              <div className="mt-2">
                <span className="text-xs text-amber-400">⚡ Victorias especiales: </span>
                <span className="text-xs text-gray-300">{game.specialVictoryTypes?.join(', ')}</span>
              </div>
            )}
          </div>

          {expansions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Expansiones</h3>
              <div className="space-y-1.5">
                {expansions.map(exp => (
                  <div key={exp.id} className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300">📦 {exp.name}</div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Estadísticas</h3>
            <p className="text-sm text-gray-300">Partidas jugadas: <span className="text-white font-semibold">{gameMatches.length}</span></p>
            {gameMatches.length > 0 && (() => {
              const winnerCounts: Record<string, number> = {};
              gameMatches.forEach(m => { if (m.winnerId) winnerCounts[m.winnerId] = (winnerCounts[m.winnerId] || 0) + 1; });
              const topWinnerId = Object.entries(winnerCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
              const topWinner = players.find(p => p.id === topWinnerId);
              return topWinner ? (
                <p className="text-sm text-gray-300">Mejor jugador: <span className="text-white font-semibold">{topWinner.name}</span></p>
              ) : null;
            })()}
          </div>

          <div className="flex gap-3">
            <button onClick={handleEdit} className="flex-1 bg-gray-700 text-white rounded-xl py-3 font-medium hover:bg-gray-600 transition-colors">✏️ Editar</button>
            <button onClick={handleDelete} className="bg-red-600/20 text-red-400 rounded-xl py-3 px-5 font-medium hover:bg-red-600/30 transition-colors">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Library Main ----
export default function Library() {
  const { games, showGameForm, editingGameId, setShowGameForm, setEditingGameId } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<GameType | ''>('');
  const [filterDifficulty, setFilterDifficulty] = useState(0);
  const [filterDurationIdx, setFilterDurationIdx] = useState(0);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const baseGames = games.filter(g => !g.isExpansion);
  const filtered = baseGames.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || g.types.includes(filterType);
    const matchDifficulty = !filterDifficulty || (g.difficulty || 0) === filterDifficulty;
    const dur = DURATION_RANGES[filterDurationIdx];
    const matchDuration = filterDurationIdx === 0 || ((g.duration || 0) >= dur.min && (g.duration || 0) <= dur.max);
    return matchSearch && matchType && matchDifficulty && matchDuration;
  });

  const gameToEdit = editingGameId ? games.find(g => g.id === editingGameId) : undefined;
  const activeFiltersCount = (filterType ? 1 : 0) + (filterDifficulty ? 1 : 0) + (filterDurationIdx ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Search + Add */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar juego..."
            className="w-full bg-gray-800 text-white rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`relative rounded-xl px-3 py-2.5 font-medium text-sm transition-colors shrink-0 ${showFilters ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          🎛️
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
        <button onClick={() => { setEditingGameId(null); setShowGameForm(true); }}
          className="bg-purple-600 text-white rounded-xl px-3.5 py-2.5 font-bold text-sm hover:bg-purple-500 transition-colors shrink-0">
          +
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-800 rounded-xl p-4 space-y-3 animate-fade-in">
          {/* Type filter */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Categoría</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button onClick={() => setFilterType('')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${!filterType ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                Todas
              </button>
              {ALL_TYPES.map(t => (
                <button key={t} onClick={() => setFilterType(filterType === t ? '' : t)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${filterType === t ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty filter */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Dificultad</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilterDifficulty(0)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${filterDifficulty === 0 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                Todas
              </button>
              {[1, 2, 3, 4, 5].map(d => (
                <button key={d} onClick={() => setFilterDifficulty(filterDifficulty === d ? 0 : d)}
                  className={`px-2 py-1 rounded-full text-[11px] font-medium transition-all ${filterDifficulty === d ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  {'★'.repeat(d)}
                </button>
              ))}
            </div>
          </div>

          {/* Duration filter */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Duración</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {DURATION_RANGES.map((r, i) => (
                <button key={i} onClick={() => setFilterDurationIdx(filterDurationIdx === i ? 0 : i)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${filterDurationIdx === i ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button onClick={() => { setFilterType(''); setFilterDifficulty(0); setFilterDurationIdx(0); }}
              className="text-xs text-red-400 hover:text-red-300">
              ✕ Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map(game => {
          const expansionCount = games.filter(g => g.baseGameId === game.id).length;
          const gradient = GAME_GRADIENTS[game.types[0]] || 'from-gray-800 to-gray-700';
          const emoji = GAME_EMOJIS[game.types[0]] || '🎲';
          return (
            <button key={game.id} onClick={() => setSelectedGame(game)}
              className="bg-gray-800 rounded-xl overflow-hidden text-left hover:ring-2 hover:ring-purple-500 transition-all group">
              <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden relative`}>
                {game.imageUrl ? (
                  <>
                    <img src={game.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  </>
                ) : (
                  <span className="text-4xl opacity-40 group-hover:scale-110 transition-transform">{emoji}</span>
                )}
                {expansionCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] bg-purple-600/90 text-white px-1.5 py-0.5 rounded-full font-medium backdrop-blur-sm">
                    +{expansionCount}
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <h3 className="text-white text-[13px] font-semibold leading-tight line-clamp-2 mb-1.5">{game.name}</h3>
                <div className="flex flex-wrap items-center gap-1">
                  {game.types.slice(0, 2).map(t => (
                    <span key={t} className="text-[9px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  {game.difficulty ? <StarRating value={game.difficulty} size="xs" /> : <span />}
                  <DurationBadge minutes={game.duration} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No se encontraron juegos</p>
        </div>
      )}

      {selectedGame && <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} />}
      {showGameForm && <GameForm gameToEdit={gameToEdit} onClose={() => setShowGameForm(false)} />}
    </div>
  );
}
