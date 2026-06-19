import { create } from 'zustand';
import { RemigioSession } from '../remigio/types';
import { applyRound, createSession, NewSessionConfig } from '../remigio/engine';
import {
  loadRemigioSessions,
  saveRemigioSession,
  deleteRemigioSession,
  importRemigioSeedOnce,
} from '../db/localDb';
import { remigioSeed } from '../remigio/seed';

export type RemigioScreen = 'list' | 'new' | 'session';

interface RemigioState {
  sessions: RemigioSession[];
  hydrated: boolean;

  // Navegación del módulo Remigio (overlay a pantalla completa).
  open: boolean;
  screen: RemigioScreen;
  activeSessionId: string | null;

  load: () => Promise<void>;
  openModule: () => void;
  closeModule: () => void;
  goList: () => void;
  goNew: () => void;
  openSession: (id: string) => void;

  create: (config: NewSessionConfig) => string;
  addRound: (sessionId: string, points: { playerId: string; points: number }[]) => void;
  setStatus: (sessionId: string, status: RemigioSession['status']) => void;
  remove: (id: string) => void;
}

function persist(session: RemigioSession) {
  saveRemigioSession(session).catch((e) => console.error('Error saving remigio session:', e));
}

export const useRemigioStore = create<RemigioState>()((set) => ({
  sessions: [],
  hydrated: false,
  open: false,
  screen: 'list',
  activeSessionId: null,

  load: async () => {
    // Importa (una sola vez) las partidas históricas migradas de brisca-app.
    await importRemigioSeedOnce(remigioSeed).catch((e) => console.error('Error importing remigio seed:', e));
    const sessions = (await loadRemigioSessions()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    set({ sessions, hydrated: true });
  },

  openModule: () => set({ open: true, screen: 'list', activeSessionId: null }),
  closeModule: () => set({ open: false }),
  goList: () => set({ screen: 'list', activeSessionId: null }),
  goNew: () => set({ screen: 'new' }),
  openSession: (id) => set({ screen: 'session', activeSessionId: id }),

  create: (config) => {
    const session = createSession(config);
    set((s) => ({ sessions: [session, ...s.sessions] }));
    persist(session);
    return session.id;
  },

  addRound: (sessionId, points) => {
    set((s) => {
      const sessions = s.sessions.map((sess) => {
        if (sess.id !== sessionId) return sess;
        const updated = applyRound(sess, points);
        persist(updated);
        return updated;
      });
      return { sessions };
    });
  },

  setStatus: (sessionId, status) => {
    set((s) => {
      const sessions = s.sessions.map((sess) => {
        if (sess.id !== sessionId) return sess;
        const updated: RemigioSession = { ...sess, status, synced: false };
        persist(updated);
        return updated;
      });
      return { sessions };
    });
  },

  remove: (id) => {
    set((s) => ({
      sessions: s.sessions.filter((sess) => sess.id !== id),
      activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
      screen: s.activeSessionId === id ? 'list' : s.screen,
    }));
    deleteRemigioSession(id).catch((e) => console.error('Error deleting remigio session:', e));
  },
}));
