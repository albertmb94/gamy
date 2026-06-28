export type GameType = 'Estrategia' | 'Cartas' | 'Filler' | 'Cooperativo' | 'Dados' | 'Puzzle' | 'Construcción' | 'Negociación' | 'Destreza' | 'Familiar' | 'Abstracto' | 'Duel';

// Metadatos ampliados para soportar 7 Wonders Duel y futuras expansiones.
// Los valores legacy (militar, ciencia, etc.) se mantienen para no romper
// logros y achievements preexistentes.
export type ScoreCategoryMetadata =
  | 'militar'
  | 'ciencia'
  | 'comercio'
  | 'gremio'
  | 'civil'
  | 'politica'
  | 'maravilla'
  | 'moneda'
  | 'progreso'
  | 'general'
  // 7 Wonders Duel
  | 'wonder_civil'        // Cartas azules (civiles)
  | 'wonder_comercio'     // Cartas verdes (comercio)
  | 'wonder_recurso'      // Cartas amarillas (materias primas)
  | 'wonder_gremio'       // Cartas moradas (gremios)
  | 'wonder_moneda'       // Monedas/ganancias
  | 'wonder_derrota'      // Derrota militar (negativo)
  | 'wonder_progreso'     // Tokens de progreso científico/civil
  | 'wonder_supremacia_militar'    // Token de supremacía militar
  | 'wonder_supremacia_cientifica' // Token de supremacía científica
  | 'wonder_supremacia_civil'      // Token de supremacía civil
  | 'wonder_total';       // Total Σ

export interface ScoreCategory {
  id: string;
  name: string;
  metadata?: ScoreCategoryMetadata;
}

export interface ScoringTemplate {
  type: 'simple' | 'complex';
  categories: ScoreCategory[];
  // Layout opcional: 'duel-pad' activa una UI específica para 7 Wonders Duel
  // (y otros juegos que sigan el mismo bloc de puntuación).
  layout?: 'default' | 'duel-pad';
}

export interface Game {
  id: string;
  name: string;
  imageUrl?: string;
  localImageData?: string;
  types: GameType[];
  isExpansion: boolean;
  baseGameId?: string;
  expansionIds: string[];
  scoringTemplate: ScoringTemplate;
  allowSpecialVictory?: boolean;
  specialVictoryTypes?: string[];
  difficulty?: number; // 1-5 stars
  duration?: number; // in minutes
  isFavorite?: boolean;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  createdAt: string;
}

export interface PlayerScore {
  playerId: string;
  scores: Record<string, number>;
  total: number;
  specialVictory?: string;
}

export interface MatchRecord {
  id: string;
  gameId: string;
  date: string;
  playerIds: string[];
  activeExpansionIds: string[];
  playerScores: PlayerScore[];
  winnerId?: string;
  firstPlayerId?: string;
  synced: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (player: Player, matches: MatchRecord[], games: Game[]) => boolean;
}

export interface PlayerAchievement {
  achievementId: string;
  playerId: string;
  unlockedAt: string;
  matchId?: string;
}

export type DbStatus = 'connected' | 'reconnecting' | 'disconnected' | 'local';

export type ViewTab = 'library' | 'play' | 'history' | 'stats' | 'players';
