import { createClient, Client } from '@libsql/client/web';
import { DbStatus, Game, Player, MatchRecord, PlayerAchievement } from '../types';

/**
 * Gamy Database Connection Layer
 *
 * La aplicación utiliza IndexedDB como almacenamiento principal (offline-first).
 * Opcionalmente, puede sincronizar directamente con Turso usando @libsql/client/web.
 *
 * Para conectar directamente con Turso desde el cliente:
 * 1. Crea la base de datos: turso db create gamy-db
 * 2. Obtén URL y token: turso db show gamy-db --url && turso db tokens create gamy-db
 * 3. Configura Vite con variables que empiecen por VITE_ para que lleguen al navegador:
 *    VITE_TURSO_DATABASE_URL=libsql://tu-db.turso.io
 *    VITE_TURSO_AUTH_TOKEN=tu-token
 *
 * Nota de seguridad: exponer TURSO_AUTH_TOKEN en el cliente implica que cualquier
 * usuario con acceso a la app pueda leerlo. Para producción pública se recomienda
 * usar un backend intermedio. Como alternativa segura puedes configurar:
 *    VITE_SYNC_API_URL=https://tu-api.example.com
 *    VITE_SYNC_API_KEY=tu-api-key (opcional)
 */

const TURSO_URL = (typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_TURSO_DATABASE_URL : undefined) as string | undefined;
const TURSO_TOKEN = (typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_TURSO_AUTH_TOKEN : undefined) as string | undefined;
const SYNC_API_URL = (typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_SYNC_API_URL : undefined) as string | undefined;
const SYNC_API_KEY = (typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_SYNC_API_KEY : undefined) as string | undefined;

export type ExtendedDbStatus = DbStatus | 'local';

let statusCallback: ((status: ExtendedDbStatus) => void) | null = null;
let tursoClient: Client | null = null;

export function setDbStatusCallback(cb: (status: ExtendedDbStatus) => void) {
  statusCallback = cb;
}

export function getDbConfig(): {
  tursoUrl?: string;
  tursoToken?: string;
  syncApiUrl?: string;
  syncApiKey?: string;
} {
  return {
    tursoUrl: TURSO_URL,
    tursoToken: TURSO_TOKEN,
    syncApiUrl: SYNC_API_URL,
    syncApiKey: SYNC_API_KEY,
  };
}

function getTursoClient(): Client | null {
  if (!TURSO_URL || !TURSO_TOKEN) return null;
  if (!tursoClient) {
    tursoClient = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
  }
  return tursoClient;
}

export async function ensureSchema(): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.batch([
      `CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        image_url TEXT,
        types TEXT,
        is_expansion BOOLEAN DEFAULT FALSE,
        base_game_id TEXT,
        expansion_ids TEXT,
        scoring_template TEXT,
        allow_special_victory BOOLEAN DEFAULT FALSE,
        special_victory_types TEXT,
        difficulty INTEGER,
        duration INTEGER,
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        avatar TEXT,
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        game_id TEXT,
        date TEXT NOT NULL,
        player_ids TEXT,
        active_expansion_ids TEXT,
        player_scores TEXT,
        winner_id TEXT,
        first_player_id TEXT,
        synced BOOLEAN DEFAULT FALSE,
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS player_achievements (
        achievement_id TEXT NOT NULL,
        player_id TEXT NOT NULL,
        unlocked_at TEXT NOT NULL,
        match_id TEXT,
        PRIMARY KEY (achievement_id, player_id)
      );`,
    ], 'write');
    return true;
  } catch (e) {
    console.error('Error ensuring Turso schema:', e);
    return false;
  }
}

export async function checkRemoteConnection(): Promise<ExtendedDbStatus> {
  // 1. Intentar conexión directa a Turso
  const client = getTursoClient();
  if (client) {
    try {
      await ensureSchema();
      await client.execute('SELECT 1');
      return 'connected';
    } catch (e) {
      console.error('Turso connection error:', e);
      return 'disconnected';
    }
  }

  // 2. Fallback a backend intermedio
  if (!SYNC_API_URL) return 'local';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${SYNC_API_URL}/health`, {
      method: 'GET',
      headers: SYNC_API_KEY ? { 'x-api-key': SYNC_API_KEY } : {},
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok ? 'connected' : 'disconnected';
  } catch {
    return 'disconnected';
  }
}

export function startDbMonitor(cb: (status: ExtendedDbStatus) => void) {
  statusCallback = cb;

  const update = async () => {
    const status = await checkRemoteConnection();
    cb(status);
    if (statusCallback) statusCallback(status);
  };

  update();
  const interval = setInterval(update, 30000);
  return () => clearInterval(interval);
}

export async function syncItemToRemote(
  type: 'game' | 'player' | 'match' | 'achievement',
  payload: unknown,
  isDelete = false
): Promise<boolean> {
  // 1. Intentar sincronización directa con Turso
  const client = getTursoClient();
  if (client) {
    try {
      await ensureSchema();
      const p = payload as Record<string, unknown>;

      if (isDelete) {
        if (type === 'game') await client.execute({ sql: 'DELETE FROM games WHERE id = ?', args: [p.id] });
        else if (type === 'player') await client.execute({ sql: 'DELETE FROM players WHERE id = ?', args: [p.id] });
        else if (type === 'match') await client.execute({ sql: 'DELETE FROM matches WHERE id = ?', args: [p.id] });
        else if (type === 'achievement') {
          await client.execute({
            sql: 'DELETE FROM player_achievements WHERE achievement_id = ? AND player_id = ?',
            args: [p.achievementId, p.playerId],
          });
        }
        return true;
      }

      if (type === 'game') {
        const game = p as any;
        await client.execute({
          sql: `INSERT OR REPLACE INTO games
            (id, name, image_url, types, is_expansion, base_game_id, expansion_ids, scoring_template, allow_special_victory, special_victory_types, difficulty, duration, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            game.id,
            game.name,
            game.imageUrl ?? null,
            JSON.stringify(game.types ?? []),
            game.isExpansion ? 1 : 0,
            game.baseGameId ?? null,
            JSON.stringify(game.expansionIds ?? []),
            JSON.stringify(game.scoringTemplate),
            game.allowSpecialVictory ? 1 : 0,
            JSON.stringify(game.specialVictoryTypes ?? []),
            game.difficulty ?? null,
            game.duration ?? null,
            game.createdAt,
          ],
        });
      } else if (type === 'player') {
        const player = p as any;
        await client.execute({
          sql: `INSERT OR REPLACE INTO players (id, name, color, avatar, created_at) VALUES (?, ?, ?, ?, ?)`,
          args: [player.id, player.name, player.color, player.avatar ?? null, player.createdAt],
        });
      } else if (type === 'match') {
        const match = p as any;
        await client.execute({
          sql: `INSERT OR REPLACE INTO matches
            (id, game_id, date, player_ids, active_expansion_ids, player_scores, winner_id, first_player_id, synced, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            match.id,
            match.gameId,
            match.date,
            JSON.stringify(match.playerIds ?? []),
            JSON.stringify(match.activeExpansionIds ?? []),
            JSON.stringify(match.playerScores ?? []),
            match.winnerId ?? null,
            match.firstPlayerId ?? null,
            match.synced ? 1 : 0,
            match.createdAt,
          ],
        });
      } else if (type === 'achievement') {
        const ach = p as any;
        await client.execute({
          sql: `INSERT OR REPLACE INTO player_achievements (achievement_id, player_id, unlocked_at, match_id) VALUES (?, ?, ?, ?)`,
          args: [ach.achievementId, ach.playerId, ach.unlockedAt, ach.matchId ?? null],
        });
      }
      return true;
    } catch (e) {
      console.error('[Turso sync error]', { type, isDelete, payload }, e);
      return false;
    }
  }

  // 2. Fallback a backend intermedio
  if (!SYNC_API_URL) return false;
  try {
    const res = await fetch(`${SYNC_API_URL}/sync/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SYNC_API_KEY ? { 'x-api-key': SYNC_API_KEY } : {}),
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function safeJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function fetchRemoteState(): Promise<{
  games: Game[];
  players: Player[];
  matches: MatchRecord[];
  playerAchievements: PlayerAchievement[];
}> {
  const client = getTursoClient();
  if (!client) {
    return { games: [], players: [], matches: [], playerAchievements: [] };
  }

  try {
    await ensureSchema();
    const [gamesRes, playersRes, matchesRes, achievementsRes] = await Promise.all([
      client.execute('SELECT * FROM games'),
      client.execute('SELECT * FROM players'),
      client.execute('SELECT * FROM matches'),
      client.execute('SELECT * FROM player_achievements'),
    ]);

    const games: Game[] = (gamesRes.rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      imageUrl: row.image_url ?? undefined,
      types: safeJson<string[]>(row.types, []),
      isExpansion: Boolean(row.is_expansion),
      baseGameId: row.base_game_id ?? undefined,
      expansionIds: safeJson<string[]>(row.expansion_ids, []),
      scoringTemplate: safeJson(row.scoring_template, { type: 'simple', categories: [{ id: 'total', name: 'Total' }] }),
      allowSpecialVictory: Boolean(row.allow_special_victory),
      specialVictoryTypes: safeJson<string[]>(row.special_victory_types, []),
      difficulty: row.difficulty ?? undefined,
      duration: row.duration ?? undefined,
      createdAt: row.created_at,
    }));

    const players: Player[] = (playersRes.rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
      avatar: row.avatar ?? undefined,
      createdAt: row.created_at,
    }));

    const matches: MatchRecord[] = (matchesRes.rows as any[]).map(row => ({
      id: row.id,
      gameId: row.game_id,
      date: row.date,
      playerIds: safeJson<string[]>(row.player_ids, []),
      activeExpansionIds: safeJson<string[]>(row.active_expansion_ids, []),
      playerScores: safeJson(row.player_scores, []),
      winnerId: row.winner_id ?? undefined,
      firstPlayerId: row.first_player_id ?? undefined,
      synced: true,
      createdAt: row.created_at,
    }));

    const playerAchievements: PlayerAchievement[] = (achievementsRes.rows as any[]).map(row => ({
      achievementId: row.achievement_id,
      playerId: row.player_id,
      unlockedAt: row.unlocked_at,
      matchId: row.match_id ?? undefined,
    }));

    return { games, players, matches, playerAchievements };
  } catch (e) {
    console.error('Error fetching remote state:', e);
    return { games: [], players: [], matches: [], playerAchievements: [] };
  }
}
