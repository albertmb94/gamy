// Modelo de datos de Remigio dentro de ludotic.
//
// Se almacena como un único documento anidado por partida (RemigioSession),
// lo que encaja con el patrón de IndexedDB de ludotic y mapea limpiamente a las
// tablas relacionales de brisca-app (games / game_players / rounds /
// round_scores / transactions) cuando se migren las partidas existentes.

export type RemigioStatus = 'waiting' | 'in_progress' | 'paused' | 'finished';
export type RemigioPlayerStatus = 'active' | 'eliminated' | 'winner';
export type RemigioTransactionType = 'round_payment' | 'game_payment' | 'reentry_payment';

export interface RemigioPlayer {
  id: string;
  guest_name: string;
  current_score: number;
  status: RemigioPlayerStatus;
  reentry_count: number;
  total_rounds_won: number;
  position: number;
}

export interface RemigioRoundScore {
  id: string;
  game_player_id: string;
  points: number;
}

export interface RemigioRound {
  id: string;
  round_number: number;
  winner_id?: string;
  completed_at?: string;
  scores: RemigioRoundScore[];
}

export interface RemigioTransaction {
  id: string;
  game_player_id: string;
  recipient_id?: string;
  type: RemigioTransactionType;
  amount: number;
  round_number?: number;
  created_at: string;
}

export interface RemigioSession {
  id: string;
  name: string;
  status: RemigioStatus;
  max_players: number;
  target_score: number;
  price_per_round: number;
  price_per_game: number;
  price_per_reentry: number;
  created_at: string;
  updated_at?: string;
  ended_at?: string;
  winner_id?: string;
  players: RemigioPlayer[];
  rounds: RemigioRound[];
  transactions: RemigioTransaction[];
  synced: boolean;
}

export interface RemigioSettlement {
  player: RemigioPlayer;
  paid: number;
  received: number;
  balance: number;
}
