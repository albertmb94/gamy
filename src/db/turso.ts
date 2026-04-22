/**
 * Turso Database Configuration for Gamy
 * 
 * Para conectar la aplicación a una base de datos Turso:
 * 
 * 1. Instala el CLI de Turso:
 *    curl -sSfL https://get.tur.so/install.sh | bash
 * 
 * 2. Autentícate:
 *    turso auth signup   (o turso auth login)
 * 
 * 3. Crea una base de datos:
 *    turso db create gamy-db
 * 
 * 4. Obtén la URL de la base de datos:
 *    turso db show gamy-db --url
 *    (Ejemplo: libsql://gamy-db-usuario.turso.io)
 * 
 * 5. Crea un token de autenticación:
 *    turso db tokens create gamy-db
 * 
 * 6. Configura las variables de entorno en un archivo .env del backend:
 *    TURSO_DATABASE_URL=libsql://gamy-db-usuario.turso.io
 *    TURSO_AUTH_TOKEN=tu-token-aquí
 * 
 * 7. Si la app usa Vite en el frontend, no expongas estas credenciales
 *    directamente. Usa un backend (API) como intermediario entre el
 *    frontend y Turso para mantener los secretos fuera del cliente.
 *    
 *    Opciones recomendadas:
 *    - Cloudflare Workers con @libsql/client
 *    - Vercel Edge Functions
 *    - Un servidor Express/Fastify con @libsql/client
 * 
 * Esquema SQL sugerido:
 * 
 * CREATE TABLE games (
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   image_url TEXT,
 *   types TEXT, -- JSON array
 *   is_expansion BOOLEAN DEFAULT FALSE,
 *   base_game_id TEXT REFERENCES games(id),
 *   scoring_template TEXT, -- JSON
 *   allow_special_victory BOOLEAN DEFAULT FALSE,
 *   special_victory_types TEXT, -- JSON array
 *   created_at TEXT DEFAULT (datetime('now'))
 * );
 * 
 * CREATE TABLE players (
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   color TEXT NOT NULL,
 *   avatar TEXT,
 *   created_at TEXT DEFAULT (datetime('now'))
 * );
 * 
 * CREATE TABLE matches (
 *   id TEXT PRIMARY KEY,
 *   game_id TEXT REFERENCES games(id),
 *   date TEXT NOT NULL,
 *   player_ids TEXT, -- JSON array
 *   active_expansion_ids TEXT, -- JSON array
 *   player_scores TEXT, -- JSON
 *   winner_id TEXT REFERENCES players(id),
 *   first_player_id TEXT REFERENCES players(id),
 *   created_at TEXT DEFAULT (datetime('now'))
 * );
 * 
 * CREATE TABLE player_achievements (
 *   achievement_id TEXT NOT NULL,
 *   player_id TEXT REFERENCES players(id),
 *   unlocked_at TEXT NOT NULL,
 *   match_id TEXT REFERENCES matches(id),
 *   PRIMARY KEY (achievement_id, player_id)
 * );
 */

import { DbStatus } from '../types';

// Connection status checker
let statusCallback: ((status: DbStatus) => void) | null = null;

export function setDbStatusCallback(cb: (status: DbStatus) => void) {
  statusCallback = cb;
}

export function checkDbConnection(): DbStatus {
  // This client-side helper is intentionally offline-first.
  // Real Turso connectivity should be checked through your backend/API,
  // which can safely read TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.
  return 'disconnected';
}

export function startDbMonitor(cb: (status: DbStatus) => void) {
  statusCallback = cb;
  
  // Initial check
  const initial = checkDbConnection();
  cb(initial);

  // Periodic check every 30 seconds
  const interval = setInterval(() => {
    const status = checkDbConnection();
    if (statusCallback) statusCallback(status);
  }, 30000);

  return () => clearInterval(interval);
}

// Sync queue processor - would sync local data to Turso when connected
export async function syncToDb(_data: unknown): Promise<boolean> {
  const status = checkDbConnection();
  if (status !== 'connected') return false;
  
  // Implementation would use @libsql/client here
  // const client = createClient({ url: dbUrl, authToken: dbToken });
  // await client.execute(...)
  
  return false;
}
