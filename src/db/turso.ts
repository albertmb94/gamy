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
 * 6. Configura las variables de entorno en un archivo .env:
 *    VITE_TURSO_DB_URL=libsql://gamy-db-usuario.turso.io
 *    VITE_TURSO_DB_AUTH_TOKEN=tu-token-aquí
 * 
 * 7. Para producción, necesitarás un backend (API) que actúe como 
 *    intermediario entre el frontend y Turso, ya que exponer 
 *    credenciales en el cliente no es seguro.
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
  // In a real implementation, this would ping the Turso database
  // For now, it returns 'disconnected' since no DB is configured
  const dbUrl = import.meta.env.VITE_TURSO_DB_URL;
  const dbToken = import.meta.env.VITE_TURSO_DB_AUTH_TOKEN;

  if (!dbUrl || !dbToken) {
    return 'disconnected';
  }

  // Would attempt connection here
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
