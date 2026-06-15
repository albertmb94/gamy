import { DbStatus } from '../types';

/**
 * Gamy Database Connection Layer
 *
 * La aplicación utiliza IndexedDB como almacenamiento principal (offline-first).
 * Opcionalmente, puede sincronizar con Turso a través de un backend intermedio.
 *
 * Para conectar con Turso:
 * 1. Crea la base de datos: turso db create gamy-db
 * 2. Obtén URL y token: turso db show gamy-db --url && turso db tokens create gamy-db
 * 3. Configura un backend (Cloudflare Worker, Vercel Edge, Express...) que use @libsql/client
 * 4. Expón una API REST para recibir los cambios de la cola de sincronización.
 * 5. Configura Vite con:
 *    VITE_SYNC_API_URL=https://tu-api.example.com
 *    VITE_SYNC_API_KEY=tu-api-key (opcional)
 *
 * Nota: nunca expongas TURSO_AUTH_TOKEN directamente en el cliente.
 */

const SYNC_API_URL = (typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_SYNC_API_URL : undefined) as string | undefined;
const SYNC_API_KEY = (typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_SYNC_API_KEY : undefined) as string | undefined;

export type ExtendedDbStatus = DbStatus | 'local';

let statusCallback: ((status: ExtendedDbStatus) => void) | null = null;

export function setDbStatusCallback(cb: (status: ExtendedDbStatus) => void) {
  statusCallback = cb;
}

export function getDbConfig(): { syncApiUrl?: string; syncApiKey?: string } {
  return { syncApiUrl: SYNC_API_URL, syncApiKey: SYNC_API_KEY };
}

export async function checkRemoteConnection(): Promise<ExtendedDbStatus> {
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
  payload: unknown
): Promise<boolean> {
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
