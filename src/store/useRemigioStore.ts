import { create } from 'zustand';
import { RemigioSession } from '../remigio/types';
import { applyRound, createSession, editLastRound, NewSessionConfig } from '../remigio/engine';
import {
  loadRemigioSessions,
  saveRemigioSession,
  deleteRemigioSession,
  importRemigioSeedOnce,
  getRemigioTombstones,
  setRemigioTombstones,
} from '../db/localDb';
import { syncItemToRemote, fetchRemoteRemigio, normalizeSessionDates } from '../db/turso';

export type RemigioScreen = 'list' | 'new' | 'session' | 'settings';

interface RemigioState {
  sessions: RemigioSession[];
  hydrated: boolean;

  // Navegación del módulo Remigio (overlay a pantalla completa).
  open: boolean;
  screen: RemigioScreen;
  activeSessionId: string | null;

  load: () => Promise<void>;
  syncAll: () => Promise<void>;
  openModule: () => void;
  closeModule: () => void;
  goList: () => void;
  goNew: () => void;
  goSettings: () => void;
  openSession: (id: string) => void;

  create: (config: NewSessionConfig) => string;
  addRound: (sessionId: string, points: { playerId: string; points: number }[]) => void;
  updateLastRound: (sessionId: string, points: { playerId: string; points: number }[]) => void;
  setStatus: (sessionId: string, status: RemigioSession['status']) => void;
  remove: (id: string) => void;
}

const ts = (s: RemigioSession) => new Date(s.updated_at ?? s.created_at).getTime();

function sortByDate(sessions: RemigioSession[]) {
  return [...sessions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export const useRemigioStore = create<RemigioState>()((set, get) => {
  // Mutex: evita doble sincronización simultánea (load() y el efecto de App
  // pueden invocar syncAll casi al mismo tiempo).
  let syncing = false;

  // Persiste localmente y sube a Turso en tiempo real. Al confirmar la subida
  // marca la partida como sincronizada (synced) tanto en memoria como en local.
  const persistAndPush = (session: RemigioSession) => {
    saveRemigioSession(session).catch((e) => console.error('Error saving remigio session:', e));
    syncItemToRemote('remigio', session, false)
      .then((ok) => {
        if (!ok) return;
        set((s) => {
          const sessions = s.sessions.map((x) => (x.id === session.id ? { ...x, synced: true } : x));
          const updated = sessions.find((x) => x.id === session.id);
          if (updated) saveRemigioSession(updated).catch(() => {});
          return { sessions };
        });
      })
      .catch(() => {/* offline: queda synced:false y se reintenta en syncAll */});
  };

  const doSyncAll = async () => {
    const tombstones = new Set(await getRemigioTombstones());
    const remote = await fetchRemoteRemigio();
    if (remote === null) {
      // Fallo de red/credenciales: NO confundir con remoto vacío. Se
      // conservan el estado local y los pendientes para reintentar después.
      return;
    }

    const byId = new Map<string, RemigioSession>();
    get().sessions.forEach((s) => byId.set(s.id, s));
    for (const r of remote) {
      if (tombstones.has(r.id)) continue; // borrada localmente, no resucitar
      const local = byId.get(r.id);
      if (!local || ts(r) > ts(local)) byId.set(r.id, r);
    }

    const merged = sortByDate([...byId.values()]);
    set({ sessions: merged });
    await Promise.all(merged.map((s) => saveRemigioSession(s).catch(() => {})));

    // Subir partidas locales aún no sincronizadas.
    const pending = merged.filter((s) => !s.synced);
    await Promise.all(pending.map((s) => persistAndPush(s)));

    // Reintentar borrados pendientes.
    if (tombstones.size > 0) {
      const stillPending: string[] = [];
      for (const id of tombstones) {
        const ok = await syncItemToRemote('remigio', { id }, true).catch(() => false);
        if (!ok) stillPending.push(id);
      }
      await setRemigioTombstones(stillPending);
    }
  };

  return {
    sessions: [],
    hydrated: false,
    open: false,
    screen: 'list',
    activeSessionId: null,

    load: async () => {
      // Importa (una sola vez) las partidas históricas migradas de brisca-app.
      // Import dinámico: el seed (~1800 líneas) no debe viajar en el bundle
      // inicial. Solo se descarga si aún no se ha importado.
      const { remigioSeed } = await import('../remigio/seed');
      // Las fechas se normalizan a ISO porque el seed contiene valores sin zona.
      await importRemigioSeedOnce(remigioSeed.map(normalizeSessionDates)).catch((e) =>
        console.error('Error importing remigio seed:', e)
      );
      // La carga también normaliza: instalações previas ya tienen fechas
      // legacy guardadas en IndexedDB.
      const loaded = await loadRemigioSessions();
      const sessions = sortByDate(loaded.map(normalizeSessionDates));
      set({ sessions, hydrated: true });
      // Sincroniza con Turso (pull + push) sin bloquear el render inicial.
      get().syncAll();
    },

    // Sincronización bidireccional con Turso: descarga lo remoto, fusiona por
    // last-write-wins (updated_at) y sube lo local pendiente y los borrados.
    syncAll: async () => {
      if (syncing) return;
      syncing = true;
      try {
        await doSyncAll();
      } finally {
        syncing = false;
      }
    },

    openModule: () => set({ open: true, screen: 'list', activeSessionId: null }),
    closeModule: () => set({ open: false }),
    goList: () => set({ screen: 'list', activeSessionId: null }),
    goNew: () => set({ screen: 'new' }),
    goSettings: () => set({ screen: 'settings', activeSessionId: null }),
    openSession: (id) => set({ screen: 'session', activeSessionId: id }),

    create: (config) => {
      const session = createSession(config);
      set((s) => ({ sessions: [session, ...s.sessions] }));
      persistAndPush(session);
      return session.id;
    },

    addRound: (sessionId, points) => {
      let updated: RemigioSession | null = null;
      set((s) => {
        const sessions = s.sessions.map((sess) => {
          if (sess.id !== sessionId) return sess;
          const next = applyRound(sess, points);
          // applyRound puede devolver un clon sin cambios (ronda sin
          // activos): solo persistimos si realmente cambió algo.
          if (next !== sess) updated = next;
          return next;
        });
        return { sessions };
      });
      if (updated) persistAndPush(updated);
    },

    updateLastRound: (sessionId, points) => {
      let updated: RemigioSession | null = null;
      set((s) => {
        const sessions = s.sessions.map((sess) => {
          if (sess.id !== sessionId) return sess;
          if (sess.rounds.length === 0) return sess; // nada que editar
          const next = editLastRound(sess, points);
          if (next !== sess) updated = next;
          return next;
        });
        return { sessions };
      });
      if (updated) persistAndPush(updated);
    },

    setStatus: (sessionId, status) => {
      let updated: RemigioSession | null = null;
      set((s) => {
        const sessions = s.sessions.map((sess) => {
          if (sess.id !== sessionId) return sess;
          updated = { ...sess, status, synced: false, updated_at: new Date().toISOString() };
          return updated;
        });
        return { sessions };
      });
      if (updated) persistAndPush(updated);
    },

    remove: (id) => {
      set((s) => ({
        sessions: s.sessions.filter((sess) => sess.id !== id),
        activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
        screen: s.activeSessionId === id ? 'list' : s.screen,
      }));
      deleteRemigioSession(id).catch((e) => console.error('Error deleting remigio session:', e));
      // Tombstone SIEMPRE y permanente: aunque el borrado remoto tenga éxito,
      // otro dispositivo que aún tenga la partida podría subirla de nuevo en
      // su próximo push. El tombstone evita resurrecciones (y el ping-pong de
      // borrar/subir). Los ids son uuid, así que una partida nueva legítima
      // nunca colisiona con un tombstone.
      const addTombstone = async () => {
        try {
          const t = await getRemigioTombstones();
          if (!t.includes(id)) await setRemigioTombstones([...t, id]);
        } catch (e) {
          console.error('Error registering tombstone:', e);
        }
      };
      addTombstone();
      syncItemToRemote('remigio', { id }, true)
        .then((ok) => {
          if (!ok) {/* el tombstone ya está registrado; se reintenta en syncAll */}
        })
        .catch(() => {/* offline: idem */});
    },
  };
});
