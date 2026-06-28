import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Game, Player, MatchRecord, PlayerAchievement } from '../types';
import { RemigioSession } from '../remigio/types';

const DB_NAME = 'ludotic-db';
const DB_VERSION = 4;

interface LudoticDB extends DBSchema {
  games: {
    key: string;
    value: Game;
  };
  players: {
    key: string;
    value: Player;
  };
  matches: {
    key: string;
    value: MatchRecord;
  };
  achievements: {
    key: [string, string];
    value: PlayerAchievement;
  };
  remigioSessions: {
    key: string;
    value: RemigioSession;
  };
  syncQueue: {
    key: string;
    value: { id: string; type: 'match' | 'player' | 'game' | 'achievement'; updatedAt: string };
  };
  meta: {
    key: string;
    value: string | number | boolean;
  };
}

let dbPromise: Promise<IDBPDatabase<LudoticDB>> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<LudoticDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('games')) db.createObjectStore('games', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('players')) db.createObjectStore('players', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('matches')) db.createObjectStore('matches', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('achievements')) db.createObjectStore('achievements', { keyPath: ['achievementId', 'playerId'] });
          if (!db.objectStoreNames.contains('syncQueue')) db.createObjectStore('syncQueue', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
        }
        if (oldVersion < 2) {
          // Versión 1 usaba keyPath 'id' para achievements, que no existe en PlayerAchievement.
          // Recreamos el store con la clave compuesta correcta.
          if (db.objectStoreNames.contains('achievements')) {
            db.deleteObjectStore('achievements');
          }
          db.createObjectStore('achievements', { keyPath: ['achievementId', 'playerId'] });
        }
        if (oldVersion < 3) {
          // Partidas de Remigio (integración de brisca-app).
          if (!db.objectStoreNames.contains('remigioSessions')) {
            db.createObjectStore('remigioSessions', { keyPath: 'id' });
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function isDbAvailable(): Promise<boolean> {
  try {
    const db = await getDb();
    return !!db;
  } catch {
    return false;
  }
}

export async function loadLocalState(): Promise<{
  games: Game[];
  players: Player[];
  matches: MatchRecord[];
  playerAchievements: PlayerAchievement[];
  initialized: boolean;
}> {
  try {
    const db = await getDb();
    const [games, players, matches, achievements, initialized] = await Promise.all([
      db.getAll('games'),
      db.getAll('players'),
      db.getAll('matches'),
      db.getAll('achievements'),
      db.get('meta', 'initialized'),
    ]);
    return {
      games,
      players,
      matches,
      playerAchievements: achievements,
      initialized: initialized === true,
    };
  } catch (e) {
    console.error('Error loading local state:', e);
    return { games: [], players: [], matches: [], playerAchievements: [], initialized: false };
  }
}

export async function saveGame(game: Game, skipSync = false) {
  const db = await getDb();
  await db.put('games', game);
  if (!skipSync) {
    await db.put('syncQueue', { id: `game:${game.id}`, type: 'game', updatedAt: new Date().toISOString() });
  }
}

export async function deleteGame(id: string) {
  const db = await getDb();
  await db.delete('games', id);
  await db.put('syncQueue', { id: `game-del:${id}`, type: 'game', updatedAt: new Date().toISOString() });
}

export async function savePlayer(player: Player, skipSync = false) {
  const db = await getDb();
  await db.put('players', player);
  if (!skipSync) {
    await db.put('syncQueue', { id: `player:${player.id}`, type: 'player', updatedAt: new Date().toISOString() });
  }
}

export async function deletePlayer(id: string) {
  const db = await getDb();
  await db.delete('players', id);
  await db.put('syncQueue', { id: `player-del:${id}`, type: 'player', updatedAt: new Date().toISOString() });
}

export async function saveMatch(match: MatchRecord, skipSync = false) {
  const db = await getDb();
  await db.put('matches', match);
  if (!skipSync) {
    await db.put('syncQueue', { id: `match:${match.id}`, type: 'match', updatedAt: new Date().toISOString() });
  }
}

export async function deleteMatch(id: string) {
  const db = await getDb();
  await db.delete('matches', id);
  await db.put('syncQueue', { id: `match-del:${id}`, type: 'match', updatedAt: new Date().toISOString() });
}

export async function saveAchievement(achievement: PlayerAchievement, skipSync = false) {
  const db = await getDb();
  await db.put('achievements', achievement);
  if (!skipSync) {
    await db.put('syncQueue', {
      id: `ach:${achievement.achievementId}:${achievement.playerId}`,
      type: 'achievement',
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function getSyncQueue(): Promise<{ id: string; type: 'match' | 'player' | 'game' | 'achievement'; updatedAt: string }[]> {
  const db = await getDb();
  return db.getAll('syncQueue');
}

export async function clearSyncItem(id: string) {
  const db = await getDb();
  await db.delete('syncQueue', id);
}

// ----- Remigio -----
// Las partidas de Remigio se guardan localmente. La sincronización remota
// (migración de las partidas de brisca-app) se abordará más adelante.

export async function loadRemigioSessions(): Promise<RemigioSession[]> {
  try {
    const db = await getDb();
    return await db.getAll('remigioSessions');
  } catch (e) {
    console.error('Error loading remigio sessions:', e);
    return [];
  }
}

export async function saveRemigioSession(session: RemigioSession) {
  const db = await getDb();
  await db.put('remigioSessions', session);
}

export async function deleteRemigioSession(id: string) {
  const db = await getDb();
  await db.delete('remigioSessions', id);
}

// Tombstones de partidas de Remigio borradas que aún no se han propagado a
// Turso (p. ej. borradas sin conexión). Se reintenta su borrado al sincronizar.
export async function getRemigioTombstones(): Promise<string[]> {
  const db = await getDb();
  const raw = await db.get('meta', 'remigioDeleted');
  return typeof raw === 'string' ? (JSON.parse(raw) as string[]) : [];
}

export async function setRemigioTombstones(ids: string[]) {
  const db = await getDb();
  await db.put('meta', JSON.stringify(ids), 'remigioDeleted');
}

/**
 * Importa una sola vez las partidas históricas de brisca-app a IndexedDB.
 * Idempotente: usa una bandera en `meta` y no sobrescribe partidas existentes,
 * de modo que no duplica ni reintroduce partidas que el usuario haya borrado.
 */
export async function importRemigioSeedOnce(seed: RemigioSession[]): Promise<void> {
  const db = await getDb();
  const alreadyImported = await db.get('meta', 'remigioImported');
  if (alreadyImported === true) return;

  const tx = db.transaction(['remigioSessions', 'meta'], 'readwrite');
  const store = tx.objectStore('remigioSessions');
  for (const session of seed) {
    const existing = await store.get(session.id);
    if (!existing) await store.put(session);
  }
  await tx.objectStore('meta').put(true, 'remigioImported');
  await tx.done;
}

/**
 * Importa una sola vez los juegos predefinidos (p. ej. 7 Wonders Duel) en
 * IndexedDB. Idempotente: no sobrescribe juegos existentes por nombre, de
 * forma que si el usuario ya tenía un 7 Wonders Duel creado (por ejemplo
 * desde la plantilla), no se duplica ni se le pisa su configuración.
 */
export async function importGamesSeedOnce(seed: Game[]): Promise<void> {
  const db = await getDb();
  const alreadyImported = await db.get('meta', 'gamesImported');
  if (alreadyImported === true) return;

  const tx = db.transaction(['games', 'meta'], 'readwrite');
  const store = tx.objectStore('games');
  for (const game of seed) {
    // Solo insertamos si NO existe ya un juego con el mismo nombre (case-insensitive).
    const all = await store.getAll();
    const lower = game.name.trim().toLowerCase();
    const exists = all.some((g: Game) => g.name.trim().toLowerCase() === lower);
    if (!exists) await store.put(game);
  }
  await tx.objectStore('meta').put(true, 'gamesImported');
  await tx.done;
}
