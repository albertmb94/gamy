import { create } from 'zustand';
import { Game, Player, MatchRecord, PlayerAchievement, DbStatus, ViewTab } from '../types';
import { defaultGames } from '../data/defaultGames';
import { v4 as uuid } from 'uuid';
import {
  loadLocalState,
  saveGame,
  savePlayer,
  saveMatch,
  saveAchievement,
  deleteGame as deleteGameDb,
  deletePlayer as deletePlayerDb,
  deleteMatch as deleteMatchDb,
  setInitialized,
  getSyncQueue,
  clearSyncItem,
} from '../db/localDb';
import { syncItemToRemote, checkRemoteConnection, fetchRemoteState } from '../db/turso';

interface AppState {
  // Data
  games: Game[];
  players: Player[];
  matches: MatchRecord[];
  playerAchievements: PlayerAchievement[];
  initialized: boolean;
  hydrated: boolean;

  // UI
  currentTab: ViewTab;
  dbStatus: DbStatus;
  selectedGameId: string | null;
  selectedMatchId: string | null;
  editingGameId: string | null;
  showGameForm: boolean;
  showPlaySetup: boolean;
  showMatchDetail: string | null;
  pendingSyncQueue: string[];

  // Actions
  setTab: (tab: ViewTab) => void;
  setDbStatus: (s: DbStatus) => void;

  // Games
  addGame: (game: Omit<Game, 'id' | 'createdAt' | 'expansionIds'> & { expansionIds?: string[] }) => string;
  updateGame: (id: string, updates: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  setSelectedGameId: (id: string | null) => void;
  setEditingGameId: (id: string | null) => void;
  setShowGameForm: (v: boolean) => void;

  // Players
  addPlayer: (name: string, color: string) => string;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;

  // Matches
  addMatch: (match: Omit<MatchRecord, 'id' | 'createdAt' | 'synced'>) => string;
  updateMatch: (id: string, updates: Partial<MatchRecord>) => void;
  deleteMatch: (id: string) => void;
  setShowPlaySetup: (v: boolean) => void;
  setShowMatchDetail: (id: string | null) => void;

  // Achievements
  addAchievement: (a: PlayerAchievement) => void;
  checkAchievements: (matchId: string) => void;

  // Init & sync
  initializeDefaults: () => Promise<void>;
  loadFromLocalDb: () => Promise<void>;
  refreshPendingSync: () => Promise<void>;
  syncPendingItems: () => Promise<void>;
  checkConnection: () => Promise<void>;
}

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'
];

export const useStore = create<AppState>()((set, get) => ({
  games: [],
  players: [],
  matches: [],
  playerAchievements: [],
  initialized: false,
  hydrated: false,
  currentTab: 'library',
  dbStatus: 'local',
  selectedGameId: null,
  selectedMatchId: null,
  editingGameId: null,
  showGameForm: false,
  showPlaySetup: false,
  showMatchDetail: null,
  pendingSyncQueue: [],

  setTab: (tab) => set({ currentTab: tab }),
  setDbStatus: (s) => set({ dbStatus: s }),

  addGame: (gameData) => {
    const id = uuid();
    const game: Game = {
      ...gameData,
      id,
      expansionIds: gameData.expansionIds || [],
      createdAt: new Date().toISOString(),
    };
    set((s) => {
      const games = [...s.games, game];
      if (game.isExpansion && game.baseGameId) {
        const baseIdx = games.findIndex(g => g.id === game.baseGameId);
        if (baseIdx >= 0) {
          games[baseIdx] = { ...games[baseIdx], expansionIds: [...games[baseIdx].expansionIds, id] };
        }
      }
      return { games };
    });
    saveGame(game).catch(e => console.error('Error saving game:', e));
    return id;
  },

  updateGame: (id, updates) => {
    set((s) => {
      const games = s.games.map(g => g.id === id ? { ...g, ...updates } : g);
      const updated = games.find(g => g.id === id);
      if (updated) saveGame(updated).catch(e => console.error('Error saving game:', e));
      return { games };
    });
  },

  deleteGame: (id) => {
    set((s) => {
      const game = s.games.find(g => g.id === id);
      let games = s.games.filter(g => g.id !== id);
      if (game?.isExpansion && game.baseGameId) {
        games = games.map(g => g.id === game.baseGameId
          ? { ...g, expansionIds: g.expansionIds.filter(eid => eid !== id) }
          : g
        );
      }
      if (!game?.isExpansion) {
        games = games.filter(g => g.baseGameId !== id);
      }
      const nextGames = games.map(g => ({ ...g }));
      nextGames.forEach(g => saveGame(g).catch(e => console.error(e)));
      deleteGameDb(id).catch(e => console.error('Error deleting game:', e));
      return { games: nextGames, matches: s.matches.filter(m => m.gameId !== id) };
    });
  },

  setSelectedGameId: (id) => set({ selectedGameId: id }),
  setEditingGameId: (id) => set({ editingGameId: id }),
  setShowGameForm: (v) => set({ showGameForm: v, editingGameId: v ? get().editingGameId : null }),

  addPlayer: (name, color) => {
    const id = uuid();
    const player: Player = {
      id,
      name: name.trim(),
      color: color || PLAYER_COLORS[get().players.length % PLAYER_COLORS.length],
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ players: [...s.players, player] }));
    savePlayer(player).then(() => get().refreshPendingSync()).catch(e => console.error('Error saving player:', e));
    return id;
  },

  updatePlayer: (id, updates) => {
    set((s) => {
      const players = s.players.map(p => p.id === id ? { ...p, ...updates } : p);
      const updated = players.find(p => p.id === id);
      if (updated) savePlayer(updated).catch(e => console.error('Error saving player:', e));
      return { players };
    });
  },

  deletePlayer: (id) => {
    set((s) => ({
      players: s.players.filter(p => p.id !== id),
      matches: s.matches.filter(m => !m.playerIds.includes(id)),
    }));
    deletePlayerDb(id).catch(e => console.error('Error deleting player:', e));
  },

  addMatch: (matchData) => {
    const id = uuid();
    const match: MatchRecord = {
      ...matchData,
      id,
      synced: false,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      matches: [...s.matches, match],
    }));
    saveMatch(match).then(() => {
      get().refreshPendingSync();
      setTimeout(() => get().checkAchievements(id), 50);
    }).catch(e => console.error('Error saving match:', e));
    return id;
  },

  updateMatch: (id, updates) => {
    set((s) => {
      const matches = s.matches.map(m => m.id === id ? { ...m, ...updates, synced: false } : m);
      const updated = matches.find(m => m.id === id);
      if (updated) saveMatch(updated).then(() => get().refreshPendingSync()).catch(e => console.error(e));
      return { matches };
    });
  },

  deleteMatch: (id) => {
    set((s) => ({ matches: s.matches.filter(m => m.id !== id) }));
    deleteMatchDb(id).then(() => get().refreshPendingSync()).catch(e => console.error('Error deleting match:', e));
  },

  setShowPlaySetup: (v) => set({ showPlaySetup: v }),
  setShowMatchDetail: (id) => set({ showMatchDetail: id }),

  addAchievement: (a) => {
    set((s) => {
      const exists = s.playerAchievements.find(
        pa => pa.achievementId === a.achievementId && pa.playerId === a.playerId
      );
      if (exists) return {};
      const achievement: PlayerAchievement = { ...a, unlockedAt: a.unlockedAt || new Date().toISOString() };
      saveAchievement(achievement).catch(e => console.error('Error saving achievement:', e));
      return { playerAchievements: [...s.playerAchievements, achievement] };
    });
  },

  checkAchievements: (matchId) => {
    const state = get();
    const match = state.matches.find(m => m.id === matchId);
    if (!match) return;

    const game = state.games.find(g => g.id === match.gameId);
    if (!match.winnerId) return;

    match.playerIds.forEach(playerId => {
      const playerMatches = state.matches.filter(m => m.playerIds.includes(playerId));
      const isWinner = match.winnerId === playerId;

      if (isWinner) {
        const sortedMatches = [...playerMatches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        let streak = 0;
        for (const m of sortedMatches) {
          if (m.winnerId === playerId) streak++;
          else break;
        }
        if (streak >= 3) {
          state.addAchievement({
            achievementId: 'racha_3',
            playerId,
            unlockedAt: new Date().toISOString(),
            matchId
          });
        }
      }

      const playerScore = match.playerScores.find(ps => ps.playerId === playerId);
      if (playerScore && playerScore.total >= 100) {
        state.addAchievement({
          achievementId: 'club_100',
          playerId,
          unlockedAt: new Date().toISOString(),
          matchId
        });
      }

      if (isWinner && game && (game.name.includes('7 Wonders'))) {
        const militaryCat = game.scoringTemplate.categories.find(c => c.metadata === 'militar');
        if (militaryCat && playerScore) {
          const milScore = playerScore.scores[militaryCat.id] || 0;
          if (milScore === 0) {
            state.addAchievement({
              achievementId: 'pacificador',
              playerId,
              unlockedAt: new Date().toISOString(),
              matchId
            });
          }
        }
      }
    });
  },

  initializeDefaults: async () => {
    const state = get();
    if (!state.initialized) {
      const games = defaultGames.map(g => ({ ...g }));
      set({ games, initialized: true });
      await setInitialized(true);
      await Promise.all(games.map(g => saveGame(g)));
    }
  },

  loadFromLocalDb: async () => {
    const loaded = await loadLocalState();
    set({
      games: loaded.games,
      players: loaded.players,
      matches: loaded.matches,
      playerAchievements: loaded.playerAchievements,
      initialized: loaded.initialized,
      hydrated: true,
    });
    get().refreshPendingSync();

    // Si hay conexión remota, intentar sincronizar desde Turso
    const status = await checkRemoteConnection();
    set({ dbStatus: status });
    if (status === 'connected') {
      await get().syncFromRemote();
    }
  },

  refreshPendingSync: async () => {
    const queue = await getSyncQueue();
    set({ pendingSyncQueue: queue.map(q => q.id) });
  },

  syncPendingItems: async () => {
    const { matches, players, games, playerAchievements } = get();
    const queue = await getSyncQueue();
    console.log('[syncPendingItems] full queue:', queue.map(q => ({ id: q.id, type: q.type, updatedAt: q.updatedAt })));

    // Ordenar: primero deletes, luego inserts/updates, y dentro de cada grupo por fecha
    const sortedQueue = [...queue].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));

    for (const item of sortedQueue) {
      let payload: unknown = null;
      let type: 'game' | 'player' | 'match' | 'achievement' = item.type;
      let isDelete = false;
      let matchId: string | undefined;

      // Formato de id: tipo:id (insert/update) o tipo-del:id (delete)
      const idParts = item.id.split(':');
      const baseType = idParts[0]; // ej: 'match' o 'match-del'
      const realId = idParts.slice(1).join(':'); // por si el UUID contuviera ':'
      isDelete = baseType.endsWith('-del');

      if (item.type === 'match') {
        matchId = realId;
        payload = matches.find(m => m.id === matchId) ?? { id: matchId };
      } else if (item.type === 'player') {
        payload = players.find(p => p.id === realId) ?? { id: realId };
      } else if (item.type === 'game') {
        payload = games.find(g => g.id === realId) ?? { id: realId };
      } else if (item.type === 'achievement') {
        const [, achievementId, playerId] = item.id.split(':');
        payload = playerAchievements.find(a => a.achievementId === achievementId && a.playerId === playerId) ?? { achievementId, playerId };
      }

      console.log('[syncPendingItems]', { id: item.id, type, isDelete, payload: JSON.stringify(payload).slice(0, 200) });
      const ok = await syncItemToRemote(type, payload, isDelete);
      console.log('[syncPendingItems] result:', { id: item.id, ok });
      if (ok) {
        await clearSyncItem(item.id);
        // Marcar la partida como sincronizada si era un insert/update
        if (type === 'match' && matchId && !isDelete) {
          set((s) => ({
            matches: s.matches.map(m => m.id === matchId ? { ...m, synced: true } : m),
          }));
          const updatedMatch = get().matches.find(m => m.id === matchId);
          if (updatedMatch) await saveMatch(updatedMatch);
        }
      }
    }
    const remaining = await getSyncQueue();
    console.log('[syncPendingItems] remaining after sync:', remaining.map(q => q.id));
    get().refreshPendingSync();
  },

  syncFromRemote: async () => {
    const remote = await fetchRemoteState();
    if (remote.matches.length === 0 && remote.players.length === 0 && remote.games.length === 0) {
      // Turso está vacío: subir datos locales si los hay
      await get().syncPendingItems();
      return;
    }

    // Fusionar datos remotos con locales por ID, manteniendo el más reciente
    const { games: localGames, players: localPlayers, matches: localMatches, playerAchievements: localAchievements } = get();

    const mergeById = <T extends { id: string; createdAt: string }>(local: T[], remote: T[]): T[] => {
      const map = new Map<string, T>();
      local.forEach(item => map.set(item.id, item));
      remote.forEach(item => {
        const existing = map.get(item.id);
        if (!existing || new Date(item.createdAt).getTime() >= new Date(existing.createdAt).getTime()) {
          map.set(item.id, item);
        }
      });
      return Array.from(map.values());
    };

    const mergedGames = mergeById(localGames, remote.games);
    const mergedPlayers = mergeById(localPlayers, remote.players);
    const mergedMatches = mergeById(localMatches, remote.matches.map(m => ({ ...m, synced: true })));

    // Achievements: clave compuesta
    const achKey = (a: PlayerAchievement) => `${a.achievementId}:${a.playerId}`;
    const achMap = new Map<string, PlayerAchievement>();
    localAchievements.forEach(a => achMap.set(achKey(a), a));
    remote.playerAchievements.forEach(a => {
      const existing = achMap.get(achKey(a));
      if (!existing || new Date(a.unlockedAt).getTime() >= new Date(existing.unlockedAt).getTime()) {
        achMap.set(achKey(a), a);
      }
    });
    const mergedAchievements = Array.from(achMap.values());

    set({
      games: mergedGames,
      players: mergedPlayers,
      matches: mergedMatches,
      playerAchievements: mergedAchievements,
    });

    // Guardar todo en IndexedDB
    await Promise.all([
      ...mergedGames.map(g => saveGame(g)),
      ...mergedPlayers.map(p => savePlayer(p)),
      ...mergedMatches.map(m => saveMatch(m)),
      ...mergedAchievements.map(a => saveAchievement(a)),
    ]);

    // Intentar subir cambios locales pendientes y limpiar la cola
    await get().syncPendingItems();
  },

  checkConnection: async () => {
    const status = await checkRemoteConnection();
    set({ dbStatus: status });
  },
}));

// Cargar datos al iniciar la aplicación
useStore.getState().loadFromLocalDb();
