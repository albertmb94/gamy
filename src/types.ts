export type GameType = 'Estrategia' | 'Cartas' | 'Filler' | 'Cooperativo' | 'Dados' | 'Puzzle' | 'Construcción' | 'Negociación' | 'Destreza' | 'Familiar' | 'Abstracto' | 'Duel';

export interface ScoreCategory {
  id: string;
  name: string;
  metadata?: 'militar' | 'ciencia' | 'comercio' | 'gremio' | 'civil' | 'politica' | 'maravilla' | 'moneda' | 'progreso' | 'general';
}

export interface ScoringTemplate {
  type: 'simple' | 'complex';
  categories: ScoreCategory[];
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

export type DbStatus = 'connected' | 'reconnecting' | 'disconnected';

export type ViewTab = 'library' | 'play' | 'history' | 'stats' | 'players';
