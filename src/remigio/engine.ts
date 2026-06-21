import { v4 as uuid } from 'uuid';
import {
  RemigioSession,
  RemigioPlayer,
  RemigioSettlement,
  RemigioTransaction,
} from './types';

export interface NewSessionConfig {
  name: string;
  maxPlayers: number;
  targetScore: number;
  pricePerRound: number;
  pricePerGame: number;
  pricePerReentry: number;
  playerNames: string[];
}

export function createSession(config: NewSessionConfig): RemigioSession {
  const names = config.playerNames.map((n) => n.trim()).filter((n) => n !== '');
  if (names.length < 2) {
    throw new Error('Añade al menos 2 jugadores');
  }

  const players: RemigioPlayer[] = names.map((name, index) => ({
    id: uuid(),
    guest_name: name,
    current_score: 0,
    status: 'active',
    reentry_count: 0,
    total_rounds_won: 0,
    position: index + 1,
  }));

  return {
    id: uuid(),
    name: config.name.trim() || 'Partida de Remigio',
    status: 'waiting',
    max_players: config.maxPlayers,
    target_score: config.targetScore,
    price_per_round: config.pricePerRound,
    price_per_game: config.pricePerGame,
    price_per_reentry: config.pricePerReentry,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    players,
    rounds: [],
    transactions: [],
    synced: false,
  };
}

function clone(session: RemigioSession): RemigioSession {
  return JSON.parse(JSON.stringify(session));
}

/**
 * Aplica una ronda a la partida y devuelve una nueva sesión con:
 * - puntuaciones acumuladas y rondas ganadas actualizadas
 * - transacciones de pago por ronda
 * - reenganches / eliminaciones según el objetivo
 * - detección de ganador y pagos finales
 *
 * Réplica de la lógica de `addRound` de brisca-app (server action).
 */
export function applyRound(
  prev: RemigioSession,
  roundPoints: { playerId: string; points: number }[],
): RemigioSession {
  const session = clone(prev);
  const game = session;

  // Solo jugadores activos participan.
  const activePoints = roundPoints.filter((rp) =>
    session.players.some((p) => p.id === rp.playerId && p.status === 'active'),
  );
  if (activePoints.length === 0) return session;

  // Gana la ronda quien menos puntos obtiene.
  const winner = activePoints.reduce((min, curr) => (curr.points < min.points ? curr : min));

  const roundNumber = session.rounds.length + 1;
  const roundId = uuid();

  session.rounds.push({
    id: roundId,
    round_number: roundNumber,
    winner_id: winner.playerId,
    completed_at: new Date().toISOString(),
    scores: activePoints.map((rp) => ({
      id: uuid(),
      game_player_id: rp.playerId,
      points: rp.points,
    })),
  });

  // Acumular puntuaciones y rondas ganadas.
  for (const rp of activePoints) {
    const player = session.players.find((p) => p.id === rp.playerId);
    if (!player) continue;
    player.current_score += rp.points;
    if (rp.playerId === winner.playerId) player.total_rounds_won += 1;
  }

  // Pagos por ronda: perdedores pagan al ganador.
  const losers = activePoints.filter((rp) => rp.playerId !== winner.playerId);
  for (const loser of losers) {
    session.transactions.push({
      id: uuid(),
      game_player_id: loser.playerId,
      recipient_id: winner.playerId,
      type: 'round_payment',
      amount: game.price_per_round,
      round_number: roundNumber,
      created_at: new Date().toISOString(),
    });
  }

  // Procesar reenganches / eliminaciones.
  const targetScore = game.target_score;
  const alivePlayers = session.players.filter(
    (p) => p.status === 'active' && p.current_score <= targetScore,
  );
  const overTarget = session.players.filter(
    (p) => p.status === 'active' && p.current_score > targetScore,
  );

  for (const player of overTarget) {
    if (alivePlayers.length >= 2) {
      const maxAliveScore = Math.max(...alivePlayers.map((p) => p.current_score));
      player.current_score = maxAliveScore;
      player.reentry_count += 1;
    } else {
      player.status = 'eliminated';
    }
  }

  // Verificar victoria: queda 1 jugador activo dentro del objetivo.
  const finalAlive = session.players.filter(
    (p) => p.current_score <= targetScore && p.status === 'active',
  );

  if (finalAlive.length === 1) {
    const winnerPlayer = finalAlive[0];
    winnerPlayer.status = 'winner';
    session.status = 'finished';
    session.ended_at = new Date().toISOString();
    session.winner_id = winnerPlayer.id;

    for (const player of session.players) {
      if (player.id === winnerPlayer.id) continue;
      session.transactions.push({
        id: uuid(),
        game_player_id: player.id,
        recipient_id: winnerPlayer.id,
        type: 'game_payment',
        amount: game.price_per_game,
        created_at: new Date().toISOString(),
      });
      if (player.reentry_count > 0) {
        session.transactions.push({
          id: uuid(),
          game_player_id: player.id,
          recipient_id: winnerPlayer.id,
          type: 'reentry_payment',
          amount: game.price_per_reentry * player.reentry_count,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  session.synced = false;
  session.updated_at = new Date().toISOString();
  return session;
}

export function getBalance(session: RemigioSession, playerId: string): number {
  const received = session.transactions
    .filter((t) => t.recipient_id === playerId)
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const paid = session.transactions
    .filter((t) => t.game_player_id === playerId)
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  return received - paid;
}

export function getSettlements(session: RemigioSession): RemigioSettlement[] {
  return session.players.map((player) => {
    const paid = session.transactions
      .filter((t) => t.game_player_id === player.id)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const received = session.transactions
      .filter((t) => t.recipient_id === player.id)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    return { player, paid, received, balance: received - paid };
  });
}

export function lastRound(session: RemigioSession) {
  if (session.rounds.length === 0) return null;
  return session.rounds.reduce((max, r) => (r.round_number > max.round_number ? r : max), session.rounds[0]);
}

export interface RemigioRoundSummaryRow {
  player: RemigioPlayer;
  paid: number;
  received: number;
  net: number;
}

export function getRoundSummary(
  session: RemigioSession,
  roundNumber: number,
): RemigioRoundSummaryRow[] {
  const round = session.rounds.find((r) => r.round_number === roundNumber);
  if (!round) return [];

  const roundTx = session.transactions.filter(
    (t) => t.type === 'round_payment' && t.round_number === roundNumber,
  );
  const pricePerRound = session.price_per_round || 0;

  return session.players.map((player) => {
    const paid = roundTx
      .filter((t) => t.game_player_id === player.id)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const received = roundTx
      .filter((t) => t.recipient_id === player.id)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const isWinner = round.winner_id === player.id;
    if (isWinner) {
      const losersCount = round.scores.filter((s) => s.game_player_id !== player.id).length;
      return { player, paid: 0, received: losersCount * pricePerRound, net: losersCount * pricePerRound };
    }
    return { player, paid, received, net: received - paid };
  });
}

export function transactionLabel(t: RemigioTransaction): string {
  switch (t.type) {
    case 'round_payment':
      return `Ronda ${t.round_number}`;
    case 'game_payment':
      return 'Partida';
    case 'reentry_payment':
      return 'Reenganche';
    default:
      return t.type;
  }
}

export function statusLabel(status: RemigioSession['status']): string {
  switch (status) {
    case 'waiting':
      return 'En espera';
    case 'in_progress':
      return 'En juego';
    case 'paused':
      return 'Pausada';
    case 'finished':
      return 'Finalizada';
    default:
      return status;
  }
}
