import { describe, it, expect } from 'vitest';
import {
  applyRound,
  createSession,
  editLastRound,
  getBalance,
  getSettlements,
  sessionPhase,
  NewSessionConfig,
} from './engine';

function baseConfig(overrides: Partial<NewSessionConfig> = {}): NewSessionConfig {
  return {
    name: 'Partida de prueba',
    maxPlayers: 8,
    targetScore: 150,
    pricePerRound: 1,
    pricePerGame: 5,
    pricePerReentry: 2,
    playerNames: ['Ana', 'Bruno', 'Carla'],
    ...overrides,
  };
}

describe('createSession', () => {
  it('exige al menos 2 jugadores', () => {
    expect(() => createSession(baseConfig({ playerNames: ['Solo'] }))).toThrow();
  });

  it('recorta nombres vacíos y arranca en waiting', () => {
    const s = createSession(baseConfig({ playerNames: [' Ana ', 'Bruno', '', '  '] }));
    expect(s.players.map((p) => p.guest_name)).toEqual(['Ana', 'Bruno']);
    expect(s.status).toBe('waiting');
    expect(s.rounds).toHaveLength(0);
    expect(s.synced).toBe(false);
  });
});

describe('applyRound', () => {
  it('acumula puntos y paga del perdedor al ganador', () => {
    const s = createSession(baseConfig());
    const [ana, bruno, carla] = s.players;
    const next = applyRound(s, [
      { playerId: ana.id, points: 5 },
      { playerId: bruno.id, points: 10 },
      { playerId: carla.id, points: 3 },
    ]);
    // Gana carla (menos puntos)
    expect(next.status).toBe('in_progress');
    expect(next.players.find((p) => p.id === carla.id)!.total_rounds_won).toBe(1);
    expect(next.players.find((p) => p.id === carla.id)!.current_score).toBe(3);
    // Pagos: Ana y Bruno pagan 1€ a Carla
    const carlaBalance = getBalance(next, carla.id);
    expect(carlaBalance).toBe(2);
    expect(getBalance(next, ana.id)).toBe(-1);
    expect(getBalance(next, bruno.id)).toBe(-1);
  });

  it('una partida finalizada no registra más rondas', () => {
    let s = createSession(baseConfig({ targetScore: 10 }));
    const [ana, bruno, carla] = s.players;
    // Ana y Bruno se eliminan, Carla gana -> partida finalizada
    s = applyRound(s, [
      { playerId: ana.id, points: 12 },
      { playerId: bruno.id, points: 12 },
      { playerId: carla.id, points: 1 },
    ]);
    expect(s.status).toBe('finished');
    expect(s.players.find((p) => p.id === ana.id)!.status).toBe('eliminated');
    const roundsBefore = s.rounds.length;
    const after = applyRound(s, [
      { playerId: ana.id, points: 5 },
      { playerId: bruno.id, points: 5 },
      { playerId: carla.id, points: 5 },
    ]);
    // Sin jugadores activos no se puede puntuar: sin ronda nueva ni cambios
    expect(after.rounds).toHaveLength(roundsBefore);
    expect(after.players.find((p) => p.id === carla.id)!.current_score).toBe(1);
  });

  it('aplica reenganche si quedan >=2 vivos al pasarse', () => {
    let s = createSession(baseConfig({ targetScore: 10 }));
    const [ana, bruno, carla] = s.players;
    // Ana y Bruno a 9, Carla a 1
    s = applyRound(s, [
      { playerId: ana.id, points: 9 },
      { playerId: bruno.id, points: 9 },
      { playerId: carla.id, points: 1 },
    ]);
    // Ana supera el objetivo (9+2=11) con Bruno y Carla vivos -> reenganche
    s = applyRound(s, [
      { playerId: ana.id, points: 2 },
      { playerId: bruno.id, points: 0 },
      { playerId: carla.id, points: 0 },
    ]);
    const anaNow = s.players.find((p) => p.id === ana.id)!;
    expect(anaNow.reentry_count).toBe(1);
    expect(anaNow.status).toBe('active');
    expect(anaNow.current_score).toBe(9); // reenganchada al máximo vivo
  });

  it('nunca deja la partida zombi si todos se pasan del objetivo', () => {
    let s = createSession(baseConfig({ targetScore: 10 }));
    const [ana, bruno, carla] = s.players;
    // Los tres activos superan el objetivo en la misma ronda -> gana el de
    // menos puntos acumulados y la partida se finaliza.
    s = applyRound(s, [
      { playerId: ana.id, points: 11 },
      { playerId: bruno.id, points: 12 },
      { playerId: carla.id, points: 13 },
    ]);
    expect(s.status).toBe('finished');
    expect(s.winner_id).toBe(ana.id);
    const winner = s.players.find((p) => p.id === ana.id)!;
    expect(winner.status).toBe('winner');
    // Ana gana la ronda (menos puntos) y la partida: 2 pagos de ronda + 2 de partida
    expect(getBalance(s, ana.id)).toBe(2 * s.price_per_round + 2 * s.price_per_game);
  });

  it('finaliza con ganador y pagos de partida cuando queda 1 vivo', () => {
    let s = createSession(baseConfig({ targetScore: 10 }));
    const [ana, bruno, carla] = s.players;
    // Ana y Bruno se pasan del objetivo (solo Carla queda dentro) -> se
    // eliminan y Carla gana.
    s = applyRound(s, [
      { playerId: ana.id, points: 12 },
      { playerId: bruno.id, points: 12 },
      { playerId: carla.id, points: 1 },
    ]);
    expect(s.players.find((p) => p.id === ana.id)!.status).toBe('eliminated');
    expect(s.status).toBe('finished');
    expect(s.winner_id).toBe(carla.id);
    // Carla gana ronda (1) y partida: 2 pagos de ronda + 2 de partida
    expect(getBalance(s, carla.id)).toBe(2 * s.price_per_round + 2 * s.price_per_game);
  });
});

describe('editLastRound / sessionPhase', () => {
  it('corrige la última ronda recalculando la partida', () => {
    let s = createSession(baseConfig());
    const [ana, bruno, carla] = s.players;
    s = applyRound(s, [
      { playerId: ana.id, points: 5 },
      { playerId: bruno.id, points: 3 },
      { playerId: carla.id, points: 4 },
    ]);
    s = applyRound(s, [
      { playerId: ana.id, points: 10 },
      { playerId: bruno.id, points: 20 },
      { playerId: carla.id, points: 30 },
    ]);
    const before = s.rounds.length;
    const fixed = editLastRound(s, [
      { playerId: ana.id, points: 10 },
      { playerId: bruno.id, points: 1 },
      { playerId: carla.id, points: 30 },
    ]);
    expect(fixed.rounds).toHaveLength(before);
    // El ganador de la ronda corregida ahora es Bruno (menos puntos)
    const last = fixed.rounds[fixed.rounds.length - 1];
    expect(last.winner_id).toBe(bruno.id);
  });

  it('sessionPhase normaliza waiting+rounds como en juego', () => {
    const s = createSession(baseConfig());
    const [ana, bruno, carla] = s.players;
    const withRounds = applyRound(s, [
      { playerId: ana.id, points: 1 },
      { playerId: bruno.id, points: 2 },
      { playerId: carla.id, points: 3 },
    ]);
    // Forzamos estado legacy waiting con rondas
    const legacy = { ...withRounds, status: 'waiting' as const };
    expect(sessionPhase(legacy)).toBe('in_progress');
    expect(sessionPhase(s)).toBe('waiting');
  });
});

describe('getSettlements', () => {
  it('balancea recibido - pagado por jugador', () => {
    const s = createSession(baseConfig());
    const [ana, bruno, carla] = s.players;
    const next = applyRound(s, [
      { playerId: ana.id, points: 5 },
      { playerId: bruno.id, points: 3 },
      { playerId: carla.id, points: 4 },
    ]);
    const settlements = getSettlements(next);
    const total = settlements.reduce((sum, st) => sum + st.balance, 0);
    expect(total).toBe(0);
    const winner = settlements.find((st) => st.player.id === bruno.id)!;
    expect(winner.balance).toBe(2);
  });
});
