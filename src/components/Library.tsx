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

const GAME_EMOJIS: Record<string, string> = {
  'Estrategia': '♟️', 'Cartas': '🃏', 'Filler': '⚡', 'Cooperativo': '🤝',
  'Dados': '🎲', 'Puzzle': '🧩', 'Construcción': '🏗️', 'Negociación': '🤝',
  'Destreza': '🎯', 'Familiar': '👨‍👩‍👧‍👦', 'Abstracto': '🔷', 'Duel': '⚔️',
};

function typeGradient(type: string) {
  const key = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return `type-gradient-${key}`;
}

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
          className={`${size === 'sm' ? 'text-base' : 'text-xs'} ${!onChange ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
        >
          <span className={s <= value ? 'text-amber-400 drop-shadow-sm' : 'text-slate-600'}>{s <= value ? '★' : '☆'}</span>
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
    <span className="text-[10px] font-medium bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600/30 flex items-center gap-1">
      <span>⏱</span>{label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">{title}</h3>
      {children}
    </div>
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

    const payload = {
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
    };

    if (gameToEdit) {
      updateGame(gameToEdit.id, payload);
    } else {
      addGame(payload);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-white">{gameToEdit ? 'Editar Juego' : 'Nuevo Juego'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors">✕</button>
        </div>

        <div className="space-y-5">
          <Section title="Información básica">
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del juego"
                className="input-field" />
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL de imagen o /images/mi-juego.jpg"
                className="input-field" />
              {imageUrl && (
                <div className="h-28 w-28 rounded-xl overflow-hidden border border-[var(--border)] bg-slate-800">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
          </Section>

          <Section title="Dificultad y duración">
            <div className="space-y-3">
              <StarRating value={difficulty} onChange={setDifficulty} size="sm" />
              <div className="flex items-center gap-2 flex-wrap">
                <input type="number" inputMode="numeric" value={duration || ''} onChange={e => setDuration(parseInt(e.target.value) || 0)}
                  placeholder="Minutos" className="input-field w-28 text-center" />
                {[15, 30, 45, 60, 90, 120].map(m => (
                  <button key={m} type="button" onClick={() => setDuration(m)}
                    className={`chip ${duration === m ? 'chip-active' : ''}`}>
                    {m}'
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Tipo de juego">
            <div className="flex flex-wrap gap-2">
              {ALL_TYPES.map(t => (
                <button key={t} onClick={() => toggleType(t)}
                  className={`chip ${types.includes(t) ? 'chip-active' : ''}`}>
                  {GAME_EMOJIS[t]} {t}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Configuración">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative inline-flex items-center">
                  <input type="checkbox" checked={isExpansion} onChange={e => setIsExpansion(e.target.checked)} className="sr-only peer" />
                  <div className="w-12 h-7 bg-slate-700 rounded-full peer peer-checked:bg-violet-600 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all shadow-inner"></div>
                </div>
                <span className="text-sm text-slate-300 font-medium">Es una expansión</span>
              </label>

              {isExpansion && (
                <select value={baseGameId} onChange={e => setBaseGameId(e.target.value)}
                  className="input-field">
                  <option value="">Seleccionar juego base...</option>
                  {baseGames.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              )}

              <div className="flex gap-2">
                <button onClick={() => setScoringType('simple')}
                  className={`btn flex-1 ${scoringType === 'simple' ? 'btn-primary' : 'btn-secondary'}`}>
                  Simple
                </button>
                <button onClick={() => setScoringType('complex')}
                  className={`btn flex-1 ${scoringType === 'complex' ? 'btn-primary' : 'btn-secondary'}`}>
                  Compleja
                </button>
              </div>
            </div>
          </Section>

          {scoringType === 'complex' && (
            <Section title="Categorías de puntuación">
              <div className="space-y-2">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className="flex gap-2 items-center">
                    <input value={cat.name} onChange={e => updateCategory(idx, { name: e.target.value })}
                      placeholder="Categoría" className="input-field flex-1 text-sm py-2" />
                    <select value={cat.metadata || 'general'} onChange={e => updateCategory(idx, { metadata: e.target.value as ScoreCategory['metadata'] })}
                      className="input-field w-auto text-xs py-2">
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
                    <button onClick={() => removeCategory(idx)} className="btn btn-danger px-2.5 py-2">✕</button>
                  </div>
                ))}
                <div className="flex gap-2 items-center">
                  <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategoryFromText(); } }}
                    placeholder="Nueva categoría..." className="input-field flex-1 text-sm py-2" />
                  <button onClick={addCategoryFromText} className="btn btn-primary px-3 py-2">+</button>
                </div>
              </div>
            </Section>
          )}

          <Section title="Victoria especial">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative inline-flex items-center">
                  <input type="checkbox" checked={allowSpecialVictory} onChange={e => setAllowSpecialVictory(e.target.checked)} className="sr-only peer" />
                  <div className="w-12 h-7 bg-slate-700 rounded-full peer peer-checked:bg-violet-600 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all shadow-inner"></div>
                </div>
                <span className="text-sm text-slate-300 font-medium">Permitir victoria especial</span>
              </label>

              {allowSpecialVictory && (
                <div className="space-y-2">
                  {specialVictoryTypes.map((svt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="flex-1 input-field text-sm py-2">{svt}</span>
                      <button onClick={() => setSpecialVictoryTypes(prev => prev.filter((_, idx) => idx !== i))} className="btn btn-danger px-2.5 py-2">✕</button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input value={newSVT} onChange={e => setNewSVT(e.target.value)} placeholder="Ej: Supremacía Militar"
                      className="input-field flex-1 text-sm py-2" />
                    <button onClick={() => { if (newSVT.trim()) { setSpecialVictoryTypes(p => [...p, newSVT.trim()]); setNewSVT(''); } }}
                      className="btn btn-primary px-3 py-2">+</button>
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>

        <div className="flex gap-3 mt-7">
          <button onClick={onClose} className="btn btn-secondary flex-1 py-3">Cancelar</button>
          <button onClick={handleSave} className="btn btn-primary flex-1 py-3">
            {gameToEdit ? 'Guardar cambios' : 'Crear juego'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Game Detail ----
function GameDetail({ game, onClose }: { game: Game; onClose: () => void }) {
  const { games, matches, players, deleteGame, setEditingGameId, setShowGameForm, toggleFavorite } = useStore();
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

  const emoji = GAME_EMOJIS[game.types[0]] || '🎲';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`h-56 w-full relative overflow-hidden ${typeGradient(game.types[0])}`}>
          {game.imageUrl ? (
            <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl opacity-40">{emoji}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <button
            onClick={() => toggleFavorite(game.id)}
            title={game.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center text-base backdrop-blur transition-all border border-white/10 ${
              game.isFavorite
                ? 'bg-rose-500/90 text-white hover:bg-rose-500'
                : 'bg-black/30 text-white/80 hover:bg-black/50 hover:text-white'
            }`}>
            {game.isFavorite ? '♥' : '♡'}
          </button>
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center text-sm hover:bg-black/50 transition-colors">✕</button>
        </div>

        <div className="p-5 -mt-10 relative z-10">
          <div className="glass-card-elevated p-4 mb-4">
            <h2 className="text-xl font-extrabold text-white mb-1">{game.name}</h2>
            {game.isExpansion && baseGame && (
              <p className="text-sm text-violet-300 font-medium mb-2">📦 Expansión de {baseGame.name}</p>
            )}
            <div className="flex items-center gap-3 mb-3">
              {game.difficulty ? <StarRating value={game.difficulty} size="xs" /> : null}
              <DurationBadge minutes={game.duration} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {game.types.map(t => (
                <span key={t} className="chip chip-active text-[10px]">{GAME_EMOJIS[t]} {t}</span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Puntuación</h3>
              <p className="text-sm text-slate-300 font-medium mb-2">
                {game.scoringTemplate.type === 'simple' ? 'Puntuación simple' : 'Puntuación compleja'}
              </p>
              {game.scoringTemplate.type === 'complex' && (
                <div className="flex flex-wrap gap-1.5">
                  {game.scoringTemplate.categories.map(c => (
                    <span key={c.id} className="chip text-[10px]">
                      {c.name} {c.metadata && c.metadata !== 'general' && <span className="text-violet-300">({c.metadata})</span>}
                    </span>
                  ))}
                </div>
              )}
              {game.allowSpecialVictory && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <span className="text-xs text-amber-400 font-semibold">⚡ Victorias especiales: </span>
                  <span className="text-xs text-slate-300">{game.specialVictoryTypes?.join(', ')}</span>
                </div>
              )}
            </div>

            {expansions.length > 0 && (
              <div className="glass-card p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Expansiones</h3>
                <div className="space-y-1.5">
                  {expansions.map(exp => (
                    <div key={exp.id} className="bg-slate-800/60 rounded-lg px-3 py-2 text-sm text-slate-300 border border-[var(--border)]">📦 {exp.name}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Estadísticas</h3>
              <p className="text-sm text-slate-300">Partidas jugadas: <span className="text-white font-bold">{gameMatches.length}</span></p>
              {gameMatches.length > 0 && (() => {
                const winnerCounts: Record<string, number> = {};
                gameMatches.forEach(m => { if (m.winnerId) winnerCounts[m.winnerId] = (winnerCounts[m.winnerId] || 0) + 1; });
                const topWinnerId = Object.entries(winnerCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
                const topWinner = players.find(p => p.id === topWinnerId);
                return topWinner ? (
                  <p className="text-sm text-slate-300 mt-1">Mejor jugador: <span className="text-white font-bold">{topWinner.name}</span></p>
                ) : null;
              })()}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={handleEdit} className="btn btn-secondary flex-1 py-3">✏️ Editar</button>
            <button onClick={handleDelete} className="btn btn-danger py-3 px-5">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Library Main ----
type SortKey = 'name-asc' | 'name-desc' | 'duration-asc' | 'duration-desc' | 'difficulty-asc' | 'difficulty-desc' | 'favorites' | 'recent';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name-asc', label: 'Nombre A-Z' },
  { key: 'name-desc', label: 'Nombre Z-A' },
  { key: 'duration-asc', label: 'Duración ↑' },
  { key: 'duration-desc', label: 'Duración ↓' },
  { key: 'difficulty-asc', label: 'Dificultad ↑' },
  { key: 'difficulty-desc', label: 'Dificultad ↓' },
  { key: 'favorites', label: '♡ Favoritos' },
  { key: 'recent', label: 'Recientes' },
];

function compareGames(a: Game, b: Game, sortBy: SortKey): number {
  switch (sortBy) {
    case 'name-asc': return a.name.localeCompare(b.name, 'es');
    case 'name-desc': return b.name.localeCompare(a.name, 'es');
    case 'duration-asc': return (a.duration ?? Infinity) - (b.duration ?? Infinity);
    case 'duration-desc': return (b.duration ?? 0) - (a.duration ?? 0);
    case 'difficulty-asc': return (a.difficulty ?? Infinity) - (b.difficulty ?? Infinity);
    case 'difficulty-desc': return (b.difficulty ?? 0) - (a.difficulty ?? 0);
    case 'favorites':
      return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || a.name.localeCompare(b.name, 'es');
    case 'recent':
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }
}

export default function Library() {
  const { games, showGameForm, editingGameId, setShowGameForm, setEditingGameId, toggleFavorite } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<GameType | ''>('');
  const [filterDifficulty, setFilterDifficulty] = useState(0);
  const [filterDurationIdx, setFilterDurationIdx] = useState(0);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('name-asc');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const baseGames = games.filter(g => !g.isExpansion);
  const filtered = baseGames.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || g.types.includes(filterType);
    const matchDifficulty = !filterDifficulty || (g.difficulty || 0) === filterDifficulty;
    const dur = DURATION_RANGES[filterDurationIdx];
    const matchDuration = filterDurationIdx === 0 || ((g.duration || 0) >= dur.min && (g.duration || 0) <= dur.max);
    const matchFavorite = !favoritesOnly || !!g.isFavorite;
    return matchSearch && matchType && matchDifficulty && matchDuration && matchFavorite;
  });
  const sorted = [...filtered].sort((a, b) => compareGames(a, b, sortBy));

  const gameToEdit = editingGameId ? games.find(g => g.id === editingGameId) : undefined;
  const activeFiltersCount = (filterType ? 1 : 0) + (filterDifficulty ? 1 : 0) + (filterDurationIdx ? 1 : 0) + (favoritesOnly ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Ludoteca</h2>
          <p className="text-sm text-[var(--text-secondary)]">{baseGames.length} juegos</p>
        </div>
        <button onClick={() => { setEditingGameId(null); setShowGameForm(true); }}
          className="btn btn-primary px-4 py-2.5 shadow-lg shadow-violet-900/40">
          <span>+</span> Nuevo
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar juego..."
            className="input-field pl-10" />
        </div>
        <button
          onClick={() => setFavoritesOnly(v => !v)}
          title={favoritesOnly ? 'Mostrando solo favoritos' : 'Mostrar solo favoritos'}
          className={`relative btn px-3.5 py-2.5 ${favoritesOnly ? 'btn-primary' : 'btn-secondary'}`}>
          {favoritesOnly ? '♥' : '♡'}
        </button>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`relative btn ${showFilters ? 'btn-primary' : 'btn-secondary'} px-3.5 py-2.5`}>
          🎛️
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-slate-900">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Sort selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] shrink-0">Ordenar:</span>
        {SORT_OPTIONS.map(opt => (
          <button key={opt.key} onClick={() => setSortBy(opt.key)}
            className={`chip whitespace-nowrap ${sortBy === opt.key ? 'chip-active' : ''}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="glass-card p-4 space-y-4 animate-fade-in">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Categoría</label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button onClick={() => setFilterType('')} className={`chip whitespace-nowrap ${!filterType ? 'chip-active' : ''}`}>Todas</button>
              {ALL_TYPES.map(t => (
                <button key={t} onClick={() => setFilterType(filterType === t ? '' : t)}
                  className={`chip whitespace-nowrap ${filterType === t ? 'chip-active' : ''}`}>
                  {GAME_EMOJIS[t]} {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Dificultad</label>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setFilterDifficulty(0)} className={`chip ${filterDifficulty === 0 ? 'chip-active' : ''}`}>Todas</button>
              {[1, 2, 3, 4, 5].map(d => (
                <button key={d} onClick={() => setFilterDifficulty(filterDifficulty === d ? 0 : d)}
                  className={`chip ${filterDifficulty === d ? 'chip-active' : ''}`}>
                  {'★'.repeat(d)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Duración</label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {DURATION_RANGES.map((r, i) => (
                <button key={i} onClick={() => setFilterDurationIdx(filterDurationIdx === i ? 0 : i)}
                  className={`chip whitespace-nowrap ${filterDurationIdx === i ? 'chip-active' : ''}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button onClick={() => { setFilterType(''); setFilterDifficulty(0); setFilterDurationIdx(0); setFavoritesOnly(false); }}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold">
              ✕ Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sorted.map(game => {
          const expansionCount = games.filter(g => g.baseGameId === game.id).length;
          const emoji = GAME_EMOJIS[game.types[0]] || '🎲';
          return (
            <button key={game.id} onClick={() => setSelectedGame(game)}
              className="glass-card overflow-hidden text-left hover:ring-2 hover:ring-violet-500/50 transition-all group animate-slide-up">
              <div className={`h-36 relative overflow-hidden ${typeGradient(game.types[0])}`}>
                {game.imageUrl ? (
                  <img src={game.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl opacity-40 group-hover:scale-110 transition-transform">{emoji}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}
                  title={game.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm backdrop-blur-sm transition-all border border-white/10 ${
                    game.isFavorite
                      ? 'bg-rose-500/90 text-white hover:bg-rose-500'
                      : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
                  }`}>
                  {game.isFavorite ? '♥' : '♡'}
                </button>
                {expansionCount > 0 && (
                  <span className="absolute top-2 right-2 text-[10px] bg-violet-600/90 text-white px-2 py-0.5 rounded-full font-bold backdrop-blur-sm border border-white/10">
                    +{expansionCount}
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-white text-sm font-bold leading-tight line-clamp-2 mb-2">{game.name}</h3>
                <div className="flex flex-wrap items-center gap-1 mb-2">
                  {game.types.slice(0, 2).map(t => (
                    <span key={t} className="text-[10px] bg-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600/20">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  {game.difficulty ? <StarRating value={game.difficulty} size="xs" /> : <span />}
                  <DurationBadge minutes={game.duration} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16 glass-card">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-[var(--text-secondary)] font-medium">No se encontraron juegos</p>
        </div>
      )}

      {selectedGame && <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} />}
      {showGameForm && <GameForm gameToEdit={gameToEdit} onClose={() => setShowGameForm(false)} />}
    </div>
  );
}
