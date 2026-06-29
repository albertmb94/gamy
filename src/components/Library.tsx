import { useState } from 'react';
import { Search, Plus, SlidersHorizontal, Heart, X, Pencil, Trash2, Package, Spade, Swords, Play } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRemigioStore } from '../store/useRemigioStore';
import { Game, GameType, ScoringTemplate, ScoreCategory } from '../types';
import { v4 as uuid } from 'uuid';
import { cn } from '../utils/cn';
import { GameCover } from './GameCover';
import { buildDuelPadCategories } from '../utils/duelPad';

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
  const key = type.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
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
          className={`${size === 'sm' ? 'text-base' : 'text-xs'} ${!onChange ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <span className={s <= value ? 'text-amber-500' : 'text-foreground/20'}>{s <= value ? '★' : '☆'}</span>
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
    <span className="text-[11px] font-medium text-muted-foreground">
      {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</h3>
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

  const applyDuelPadPreset = () => {
    if (!name.trim()) setName('7 Wonders Duel');
    if (!imageUrl.trim()) setImageUrl('/images/7wonders-duel.jpg');
    if (!types.includes('Duel')) setTypes(prev => [...prev, 'Duel']);
    if (!types.includes('Cartas')) setTypes(prev => [...prev, 'Cartas']);
    setScoringType('complex');
    setCategories(buildDuelPadCategories());
    setAllowSpecialVictory(true);
    if (specialVictoryTypes.length === 0) {
      setSpecialVictoryTypes(['Supremacía Militar', 'Supremacía Científica', 'Supremacía Civil']);
    }
    setDifficulty(3);
    setDuration(30);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const isDuelPad =
      name.toLowerCase().includes('7 wonders') ||
      categories.some(c => c.metadata?.startsWith('wonder_'));
    const template: ScoringTemplate = scoringType === 'simple'
      ? { type: 'simple', categories: [{ id: 'total', name: 'Total' }] }
      : { type: 'complex', categories, ...(isDuelPad ? { layout: 'duel-pad' as const } : {}) };

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
          <h2 className="text-xl font-bold text-foreground">{gameToEdit ? 'Editar Juego' : 'Nuevo Juego'}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-5">
          <Section title="Información básica">
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del juego"
                className="input-field" />
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL de imagen o /images/mi-juego.jpg"
                className="input-field" />
              {imageUrl && (
                <div className="h-28 w-28 rounded-2xl overflow-hidden border border-border bg-secondary">
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
                  <div className="w-12 h-7 bg-input rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow"></div>
                </div>
                <span className="text-sm text-foreground font-medium">Es una expansión</span>
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

              <button type="button" onClick={applyDuelPadPreset}
                className="w-full btn btn-secondary py-2.5 text-sm">
                <Swords className="h-4 w-4" /> Usar plantilla 7 Wonders Duel
              </button>
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
                      <option value="wonder_civil">7WD · Azul</option>
                      <option value="wonder_comercio">7WD · Verde</option>
                      <option value="wonder_recurso">7WD · Amarilla</option>
                      <option value="wonder_gremio">7WD · Morada</option>
                      <option value="maravilla">7WD · Etapa</option>
                      <option value="wonder_moneda">7WD · Moneda V</option>
                      <option value="wonder_derrota">7WD · Derrota</option>
                      <option value="wonder_militar">7WD · Militar</option>
                      <option value="wonder_progreso">7WD · Progreso</option>
                      <option value="wonder_supremacia_militar">7WD · Supremacía M.</option>
                      <option value="wonder_supremacia_cientifica">7WD · Supremacía C.</option>
                      <option value="wonder_supremacia_civil">7WD · Supremacía V.</option>
                      <option value="wonder_total">7WD · Total</option>
                    </select>
                    <button onClick={() => removeCategory(idx)} className="btn btn-danger px-2.5 py-2"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <div className="flex gap-2 items-center">
                  <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategoryFromText(); } }}
                    placeholder="Nueva categoría..." className="input-field flex-1 text-sm py-2" />
                  <button onClick={addCategoryFromText} className="btn btn-primary px-3 py-2"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            </Section>
          )}

          <Section title="Victoria especial">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative inline-flex items-center">
                  <input type="checkbox" checked={allowSpecialVictory} onChange={e => setAllowSpecialVictory(e.target.checked)} className="sr-only peer" />
                  <div className="w-12 h-7 bg-input rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow"></div>
                </div>
                <span className="text-sm text-foreground font-medium">Permitir victoria especial</span>
              </label>

              {allowSpecialVictory && (
                <div className="space-y-2">
                  {specialVictoryTypes.map((svt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="flex-1 input-field text-sm py-2">{svt}</span>
                      <button onClick={() => setSpecialVictoryTypes(prev => prev.filter((_, idx) => idx !== i))} className="btn btn-danger px-2.5 py-2"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input value={newSVT} onChange={e => setNewSVT(e.target.value)} placeholder="Ej: Supremacía Militar"
                      className="input-field flex-1 text-sm py-2" />
                    <button onClick={() => { if (newSVT.trim()) { setSpecialVictoryTypes(p => [...p, newSVT.trim()]); setNewSVT(''); } }}
                      className="btn btn-primary px-3 py-2"><Plus className="h-4 w-4" /></button>
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

// ---- Game Detail (estilo álbum) ----
function GameDetail({ game, onClose }: { game: Game; onClose: () => void }) {
  const { games, matches, players, deleteGame, setEditingGameId, setShowGameForm, toggleFavorite, setTab, setSelectedGameId } = useStore();
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

  const handlePlay = () => {
    setSelectedGameId(game.id);
    setTab('play');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Cabecera estilo "Album detail" de la imagen */}
        <div className="px-5 pt-4 pb-5 flex items-center justify-between">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-card border border-border text-foreground flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
          <div className="text-center leading-tight">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{game.isExpansion ? 'Expansión' : 'Juego'}</p>
            <p className="text-sm font-bold text-foreground truncate max-w-[200px] mx-auto">{game.name}</p>
          </div>
          <button
            onClick={() => toggleFavorite(game.id)}
            title={game.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-all', game.isFavorite ? 'bg-rose-500 text-white' : 'bg-card border border-border text-foreground hover:bg-secondary')}>
            <Heart className={cn('h-4 w-4', game.isFavorite && 'fill-current')} />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-start gap-4">
            <div className={`w-32 h-32 rounded-2xl overflow-hidden shrink-0 ${typeGradient(game.types[0])}`}>
              {game.imageUrl ? (
                <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <GameCover game={game} large />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-[11px] text-muted-foreground">
                {game.isExpansion && baseGame ? `${baseGame.name}` : 'Ludoteca'} · {gameMatches.length} partidas · {game.duration ? `${game.duration}'` : '—'}
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground leading-tight mt-1">{game.name}</h2>
              {game.isExpansion && baseGame && (
                <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Expansión de {baseGame.name}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {game.types.map(t => (
                  <span key={t} className="text-[11px] bg-secondary text-muted-foreground px-2.5 py-1 rounded-full font-medium">
                    {GAME_EMOJIS[t]} {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={handlePlay} className="btn btn-primary flex-1 py-3">
              <Play className="h-4 w-4 fill-current" /> Jugar
            </button>
            <button onClick={handleEdit} className="btn btn-secondary py-3 px-5"><Pencil className="h-4 w-4" /></button>
            <button onClick={handleDelete} className="btn btn-danger py-3 px-4"><Trash2 className="h-4 w-4" /></button>
          </div>

          {/* Track-list: secciones con índice y meta */}
          <div className="mt-6 space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">Detalles</h3>

            <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors">
              <span className="text-xs font-bold text-muted-foreground w-6 tabular-nums">01</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">Puntuación</p>
                <p className="text-xs text-muted-foreground truncate">
                  {game.scoringTemplate.type === 'simple' ? 'Simple · total único' : `Compleja · ${game.scoringTemplate.categories.length} categorías`}
                </p>
              </div>
              {game.allowSpecialVictory && (
                <span className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">⚡ {game.specialVictoryTypes?.length || 0}</span>
              )}
            </div>

            {expansions.length > 0 && (
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-6 tabular-nums">02</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">Expansiones</p>
                  <p className="text-xs text-muted-foreground truncate">{expansions.map(e => e.name).join(', ')}</p>
                </div>
                <span className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{expansions.length}</span>
              </div>
            )}

            {game.scoringTemplate.type === 'complex' && (
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-6 tabular-nums">03</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">Categorías</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {game.scoringTemplate.categories.map(c => c.name).join(' · ')}
                  </p>
                </div>
              </div>
            )}

            {gameMatches.length > 0 && (() => {
              const winnerCounts: Record<string, number> = {};
              gameMatches.forEach(m => { if (m.winnerId) winnerCounts[m.winnerId] = (winnerCounts[m.winnerId] || 0) + 1; });
              const topWinnerId = Object.entries(winnerCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
              const topWinner = players.find(p => p.id === topWinnerId);
              return (
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground w-6 tabular-nums">04</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">Mejor jugador</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {topWinner ? `${topWinner.name} · ${winnerCounts[topWinnerId]} victoria${winnerCounts[topWinnerId] > 1 ? 's' : ''}` : '—'}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Remigio featured tile (estilo álbum destacado) ----
function RemigioTile() {
  const openModule = useRemigioStore(s => s.openModule);
  const sessions = useRemigioStore(s => s.sessions);
  const active = sessions.filter(s => s.status !== 'finished').length;
  return (
    <button
      onClick={openModule}
      className="col-span-2 sm:col-span-3 glass-card overflow-hidden text-left hover:border-foreground/20 transition-colors animate-slide-up"
    >
      <div className="flex items-center gap-4 p-4">
        <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <Spade className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Juego en vivo</p>
          <h3 className="text-base font-bold text-foreground truncate">Remigio</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rondas, reenganches y pagos · {active > 0 ? `${active} activa${active > 1 ? 's' : ''}` : 'toca para jugar'}
          </p>
        </div>
        <span className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Play className="h-5 w-5 fill-current" />
        </span>
      </div>
    </button>
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

  const showRemigio = !search && !favoritesOnly && !filterDifficulty && !filterDurationIdx && (filterType === '' || filterType === 'Cartas');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Ludoteca</h2>
          <p className="text-sm text-muted-foreground">{baseGames.length} juegos</p>
        </div>
        <button onClick={() => { setEditingGameId(null); setShowGameForm(true); }}
          className="btn btn-primary px-4 py-2.5">
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar juego..."
            className="input-field pl-10" />
        </div>
        <button
          onClick={() => setFavoritesOnly(v => !v)}
          title={favoritesOnly ? 'Mostrando solo favoritos' : 'Mostrar solo favoritos'}
          className={cn('btn px-3.5 py-2.5', favoritesOnly ? 'btn-primary' : 'btn-secondary')}>
          <Heart className={cn('h-4 w-4', favoritesOnly && 'fill-current')} />
        </button>
        <button onClick={() => setShowFilters(!showFilters)}
          className={cn('relative btn', showFilters ? 'btn-primary' : 'btn-secondary', 'px-3.5 py-2.5')}>
          <SlidersHorizontal className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Sort selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Categoría</label>
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
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Dificultad</label>
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
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Duración</label>
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
              className="text-xs text-destructive hover:opacity-80 font-semibold flex items-center gap-1">
              <X className="h-3.5 w-3.5" /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Game Grid — estilo cuadrícula de álbums */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {showRemigio && <RemigioTile />}
        {sorted.map(game => {
          const expansionCount = games.filter(g => g.baseGameId === game.id).length;
          return (
            <div key={game.id} className="text-left animate-slide-up group">
              <button
                onClick={() => setSelectedGame(game)}
                className="block w-full aspect-square rounded-2xl overflow-hidden relative bg-gradient-to-br from-zinc-100 to-zinc-200"
              >
                {game.imageUrl ? (
                  <img src={game.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <GameCover game={game} className="group-hover:scale-105 transition-transform duration-500 rounded-2xl" />
                )}
                {expansionCount > 0 && (
                  <span className="absolute top-2 right-2 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">
                    +{expansionCount}
                  </span>
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}
                title={game.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                className={cn('absolute -mt-7 ml-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all border border-white/20 shadow-sm', game.isFavorite ? 'bg-rose-500 text-white border-transparent' : 'bg-black/40 text-white hover:bg-black/55')}>
                <Heart className={cn('h-3.5 w-3.5', game.isFavorite && 'fill-current')} />
              </button>
              <div className="pt-2 px-1">
                <h3 className="text-foreground text-sm font-bold leading-tight truncate">{game.name}</h3>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                  {game.types[0] && <span className="truncate">{game.types[0]}</span>}
                  {game.types[0] && game.duration && <span>·</span>}
                  {game.duration && <DurationBadge minutes={game.duration} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && !showRemigio && (
        <div className="text-center py-16 glass-card">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-muted-foreground font-medium">No se encontraron juegos</p>
        </div>
      )}

      {selectedGame && <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} />}
      {showGameForm && <GameForm gameToEdit={gameToEdit} onClose={() => setShowGameForm(false)} />}
    </div>
  );
}