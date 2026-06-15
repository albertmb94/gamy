import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Game, Player, MatchRecord, PlayerAchievement } from '../types';

const DB_NAME = 'gamy-db';
const DB_VERSION = 2;

interface GamyDB extends DBSchema {
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
  syncQueue: {
    key: string;
    value: { id: string; type: 'match' | 'player' | 'game' | 'achievement'; updatedAt: string };
  };
  meta: {
    key: string;
    value: string | number | boolean;
  };
}

let dbPromise: Promise<IDBPDatabase<GamyDB>> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<GamyDB>(DB_NAME, DB_VERSION, {
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

export async function saveGame(game: Game) {
  const db = await getDb();
  await db.put('games', game);
  await db.put('syncQueue', { id: `game:${game.id}`, type: 'game', updatedAt: new Date().toISOString() });
}

export async function deleteGame(id: string) {
  const db = await getDb();
  await db.delete('games', id);
  await db.put('syncQueue', { id: `game-del:${id}`, type: 'game', updatedAt: new Date().toISOString() });
}

export async function savePlayer(player: Player) {
  const db = await getDb();
  await db.put('players', player);
  await db.put('syncQueue', { id: `player:${player.id}`, type: 'player', updatedAt: new Date().toISOString() });
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

export async function saveAchievement(achievement: PlayerAchievement) {
  const db = await getDb();
  await db.put('achievements', achievement);
  await db.put('syncQueue', {
    id: `ach:${achievement.achievementId}:${achievement.playerId}`,
    type: 'achievement',
    updatedAt: new Date().toISOString(),
  });
}

export async function setInitialized(value: boolean) {
  const db = await getDb();
  await db.put('meta', value, 'initialized');
}

export async function getSyncQueue(): Promise<{ id: string; type: 'match' | 'player' | 'game' | 'achievement'; updatedAt: string }[]> {
  const db = await getDb();
  return db.getAll('syncQueue');
}

export async function clearSyncItem(id: string) {
  const db = await getDb();
  await db.delete('syncQueue', id);
}
