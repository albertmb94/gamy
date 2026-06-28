import { create } from 'zustand';
import { Game, Player, MatchRecord, PlayerAchievement, DbStatus, ViewTab } from '../types';
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
  getSyncQueue,
  clearSyncItem,
  importGamesSeedOnce,
  migrateDuelPadObsoleteCategories,
} from '../db/localDb';
import { syncItemToRemote, checkRemoteConnection, fetchRemoteState } from '../db/turso';
import { gamesSeed } from '../utils/gamesSeed';

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
  toggleFavorite: (id: string) => void;
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
  loadFromLocalDb: () => Promise<void>;
  refreshPendingSync: () => Promise<void>;
  syncPendingItems: () => Promise<void>;
  checkConnection: () => Promise<void>;
}

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'
];

// Normaliza un nombre para deduplicar: trim + lowercase + colapsa espacios.
function normName(s: string): string {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// Deduplica por nombre (case-insensitive). Si hay varios con el mismo nombre,
// se queda con el de createdAt más reciente. Devuelve { kept, removedIds }.
function deduplicateByName<T extends { id: string; name: string; createdAt: string }>(
  items: T[]
): { kept: T[]; removedIds: string[] } {
  const byKey = new Map<string, T>();
  const removedIds: string[] = [];
  for (const item of items) {
    const key = normName(item.name);
    if (!key) {
      // Sin nombre normalizable: conservar pero no deduplicar contra otros vacíos
      byKey.set(`__noid_${item.id}`, item);
      continue;
    }
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, item);
    } else {
      const existingTime = new Date(existing.createdAt).getTime();
      const itemTime = new Date(item.createdAt).getTime();
      if (itemTime > existingTime) {
        removedIds.push(existing.id);
        byKey.set(key, item);
      } else {
        removedIds.push(item.id);
      }
    }
  }
  return { kept: Array.from(byKey.values()), removedIds };
}

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
    const incomingName = normName(gameData.name);
    if (incomingName) {
      const existing = get().games.find(g => normName(g.name) === incomingName);
      if (existing) return existing.id;
    }
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

  toggleFavorite: (id) => {
    set((s) => {
      const games = s.games.map(g => g.id === id ? { ...g, isFavorite: !g.isFavorite } : g);
      const updated = games.find(g => g.id === id);
      if (updated) saveGame(updated).catch(e => console.error('Error saving game:', e));
      return { games };
    });
  },

  addPlayer: (name, color) => {
    const incomingName = normName(name);
    if (incomingName) {
      const existing = get().players.find(p => normName(p.name) === incomingName);
      if (existing) return existing.id;
    }
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
        const militaryCat = game.scoringTemplate.categories.find(c => c.metadata === 'militar' || c.metadata === 'wonder_derrota');
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

  loadFromLocalDb: async () => {
    // La BD es la única fuente de verdad. Nunca inyectamos datos en ella.
    // Al cargar, deduplicamos por nombre para limpiar registros duplicados
    // de runs anteriores (la BD local puede contener varios juegos con el
    // mismo name y distinto id debido a errores previos).

    // Importar juegos predefinidos (7 Wonders Duel y futuros) una sola vez.
    // Idempotente: si el usuario ya tenía un 7 Wonders Duel creado
    // manualmente, no se duplica ni se sobreescribe.
    await importGamesSeedOnce(gamesSeed).catch((e) => console.error('Error importing games seed:', e));

    // Migración: limpia categorías obsoletas (Derrota, supremacías) del
    // scorepad de 7 Wonders Duel en registros ya guardados localmente.
    // Idempotente: marcada con una bandera en meta, solo corre una vez.
    await migrateDuelPadObsoleteCategories().catch((e) => console.error('Error migrating duel-pad categories:', e));

    const loaded = await loadLocalState();
    const originalQueue = await getSyncQueue();
    const queuedIds = new Set(originalQueue.map(q => q.id));

    const { kept: cleanGames, removedIds: removedGameIds } = deduplicateByName(loaded.games);
    const { kept: cleanPlayers, removedIds: removedPlayerIds } = deduplicateByName(loaded.players);

    // Partidas y logros que referencian registros eliminados también se purgan
    const cleanMatches = loaded.matches.filter(m =>
      !removedGameIds.includes(m.gameId) &&
      !m.playerIds.some(pid => removedPlayerIds.includes(pid))
    );
    const removedMatchIds = loaded.matches
      .filter(m => !cleanMatches.find(c => c.id === m.id))
      .map(m => m.id);
    const cleanAchievements = loaded.playerAchievements.filter(
      a => !removedPlayerIds.includes(a.playerId)
    );

    // Persistir la limpieza en IndexedDB. deleteGameDb/deletePlayerDb/
    // deleteMatchDb añaden entradas de borrado a la cola de sync, que
    // posteriormente se subirán al remoto para limpiar duplicados allí.
    await Promise.all([
      ...removedGameIds.map(id => deleteGameDb(id)),
      ...removedPlayerIds.map(id => deletePlayerDb(id)),
      ...removedMatchIds.map(id => deleteMatchDb(id)),
    ]);

    // Si había duplicados, los registros conservados podrían no estar en la
    // cola. Los reencolamos para asegurar que el remoto termina consistente
    // (al menos uno por nombre). Si ya estaban en cola, save* hace put y no
    // duplica la entrada.
    const hadDupes = removedGameIds.length > 0 || removedPlayerIds.length > 0;
    if (hadDupes) {
      const toQueue: Promise<void>[] = [];
      for (const g of cleanGames) {
        if (!queuedIds.has(`game:${g.id}`)) toQueue.push(saveGame(g));
      }
      for (const p of cleanPlayers) {
        if (!queuedIds.has(`player:${p.id}`)) toQueue.push(savePlayer(p));
      }
      await Promise.all(toQueue);
    }

    set({
      games: cleanGames,
      players: cleanPlayers,
      matches: cleanMatches,
      playerAchievements: cleanAchievements,
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
      try {
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
          if (updatedMatch) await saveMatch(updatedMatch, true);
          }
        }
      } catch (e) {
        console.error('[syncPendingItems] item failed:', { id: item.id }, e);
      }
    }
    const remaining = await getSyncQueue();
    console.log('[syncPendingItems] remaining after sync:', remaining.map(q => q.id));
    get().refreshPendingSync();
  },

  syncFromRemote: async () => {
    const remote = await fetchRemoteState();

    // Deduplicar el remoto por nombre para no reintroducir duplicados en
    // el local (el remoto también puede contener duplicados de runs previos).
    const { kept: remoteGames } = deduplicateByName(remote.games);
    const { kept: remotePlayers } = deduplicateByName(remote.players);

    if (remoteGames.length === 0 && remote.players.length === 0 && remote.matches.length === 0) {
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

    let mergedGames = mergeById(localGames, remoteGames);
    let mergedPlayers = mergeById(localPlayers, remotePlayers);
    const mergedMatches = mergeById(localMatches, remote.matches.map(m => ({ ...m, synced: true })));

    // Deduplicar el resultado del merge por nombre: local y remoto pueden
    // tener el mismo juego con IDs distintos. Priorizar el de createdAt más
    // reciente.
    const { kept: finalGames, removedIds: removedGameIds } = deduplicateByName(mergedGames);
    const { kept: finalPlayers, removedIds: removedPlayerIds } = deduplicateByName(mergedPlayers);
    mergedGames = finalGames;
    mergedPlayers = finalPlayers;

    // Eliminar del local los IDs que el dedup descartó para no perpetuarlos
    if (removedGameIds.length > 0) {
      await Promise.all(removedGameIds.map(id => deleteGameDb(id)));
    }
    if (removedPlayerIds.length > 0) {
      await Promise.all(removedPlayerIds.map(id => deletePlayerDb(id)));
    }

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

    // Persistir el resultado del merge en la BD local SIN re-encolarlo para
    // sincronización.
    await Promise.all([
      ...mergedGames.map(g => saveGame(g, true)),
      ...mergedPlayers.map(p => savePlayer(p, true)),
      ...mergedMatches.map(m => saveMatch(m, true)),
      ...mergedAchievements.map(a => saveAchievement(a, true)),
    ]);

    // Subir únicamente los cambios locales que estaban realmente pendientes
    // antes de la sincronización.
    await get().syncPendingItems();
  },

  checkConnection: async () => {
    const status = await checkRemoteConnection();
    set({ dbStatus: status });
  },
}));
