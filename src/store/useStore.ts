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
  deleteAchievement as deleteAchievementDb,
  getSyncQueue,
  clearSyncItem,
  importGamesSeedOnce,
  migrateDuelPadObsoleteCategories,
  migrateDuelPadMilitar,
  migrateDuelPadCategoriesV4,
  SyncQueueItem,
} from '../db/localDb';
import { syncItemToRemote, checkRemoteConnection, fetchRemoteState } from '../db/turso';
import { gamesSeed } from '../utils/gamesSeed';
import { isDuelPadGame } from '../utils/duelPad';

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
  /** Devuelve false si el rename colisiona con otro juego existente. */
  updateGame: (id: string, updates: Partial<Game>) => boolean;
  deleteGame: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setSelectedGameId: (id: string | null) => void;
  setEditingGameId: (id: string | null) => void;
  setShowGameForm: (v: boolean) => void;

  // Players
  addPlayer: (name: string, color: string) => string;
  /** Devuelve false si el rename colisiona con otro jugador existente. */
  updatePlayer: (id: string, updates: Partial<Player>) => boolean;
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
  syncFromRemote: () => Promise<void>;
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

interface DedupResult<T> {
  kept: T[];
  /** Mapa id eliminado → id conservado, para reasignar referencias (partidas). */
  reassignments: Map<string, string>;
}

// Deduplica por nombre (case-insensitive). Si hay varios con el mismo nombre,
// se queda con el de createdAt más reciente y devuelve el mapa de
// reasignación para que las partidas/logros del duplicado eliminado pasen a
// apuntar al conservado en vez de perderse.
function deduplicateByName<T extends { id: string; name: string; createdAt: string }>(
  items: T[]
): DedupResult<T> {
  const byKey = new Map<string, T>();
  const reassignments = new Map<string, string>();
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
        reassignments.set(existing.id, item.id);
        byKey.set(key, item);
      } else {
        reassignments.set(item.id, existing.id);
      }
    }
  }
  return { kept: Array.from(byKey.values()), reassignments };
}

/**
 * Reasigna partidas y logros de los duplicados eliminados hacia los
 * conservados. Mutación en memoria; el llamador decide cómo persistir.
 */
function remapReferences(
  matches: MatchRecord[],
  achievements: PlayerAchievement[],
  gameRemaps: Map<string, string>,
  playerRemaps: Map<string, string>
): { matches: MatchRecord[]; achievements: PlayerAchievement[] } {
  const remappedMatches = matches.map(m => {
    const gameId = gameRemaps.get(m.gameId) ?? m.gameId;
    let changed = gameRemaps.has(m.gameId);
    const playerIds = m.playerIds.map(pid => {
      const npid = playerRemaps.get(pid) ?? pid;
      if (npid !== pid) changed = true;
      return npid;
    });
    // Tras fusionar jugadores puede haber ids duplicados en la partida.
    const uniquePlayerIds = Array.from(new Set(playerIds));
    if (!changed && uniquePlayerIds.length === playerIds.length) return m;
    return { ...m, gameId, playerIds: uniquePlayerIds };
  });
  const remappedAchievements = achievements.map(a => {
    const playerId = playerRemaps.get(a.playerId) ?? a.playerId;
    if (playerId === a.playerId) return a;
    return { ...a, playerId };
  });
  return { matches: remappedMatches, achievements: remappedAchievements };
}

/** Marca el instante de la última modificación para la resolución LWW. */
function touch(): string {
  return new Date().toISOString();
}

/** Type guard: entradas de cola nuevas incluyen snapshot del recurso. */
function isSyncQueueWithPayload(item: SyncQueueItem): boolean {
  return typeof item.payload !== 'undefined' && item.payload !== null;
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
    // Validación: no permitir renombrar a un nombre ya ocupado por otro juego.
    if (typeof updates.name === 'string') {
      const incoming = normName(updates.name);
      const collides = incoming && get().games.some(g => g.id !== id && normName(g.name) === incoming);
      if (collides) return false;
    }
    set((s) => {
      const games = s.games.map(g => g.id === id ? { ...g, ...updates, updatedAt: touch() } : g);
      const updated = games.find(g => g.id === id);
      if (updated) saveGame(updated).catch(e => console.error('Error saving game:', e));
      return { games };
    });
    return true;
  },

  deleteGame: (id) => {
    set((s) => {
      const game = s.games.find(g => g.id === id);
      // Expansiones que cuelgan del juego base eliminado.
      const expansionIds = !game?.isExpansion
        ? s.games.filter(g => g.baseGameId === id).map(g => g.id)
        : [];
      const affectedGameIds = new Set([id, ...expansionIds]);

      // Cascada de partidas: se eliminan Y encolan para borrarlas también
      // del remoto (si no, syncFromRemote las resucitaría).
      const removedMatches = s.matches.filter(m => affectedGameIds.has(m.gameId));

      let games = s.games.filter(g => !affectedGameIds.has(g.id));
      // Si borrábamos una expansión, quitar su id de la lista del juego base
      // (única fila que cambia; no re-persistir todo el catálogo).
      let changedBase: Game | undefined;
      if (game?.isExpansion && game.baseGameId) {
        games = games.map(g => {
          if (g.id !== game.baseGameId) return g;
          changedBase = { ...g, expansionIds: g.expansionIds.filter(eid => eid !== id), updatedAt: touch() };
          return changedBase;
        });
      }

      // Persistencia + encolado de TODA la cascada.
      affectedGameIds.forEach(gid => deleteGameDb(gid).catch(e => console.error('Error deleting game:', e)));
      removedMatches.forEach(m => deleteMatchDb(m.id).catch(e => console.error('Error deleting match:', e)));
      if (changedBase) saveGame(changedBase).catch(e => console.error('Error saving game:', e));
      return {
        games,
        matches: s.matches.filter(m => !affectedGameIds.has(m.gameId)),
      };
    });
  },

  setSelectedGameId: (id) => set({ selectedGameId: id }),
  setEditingGameId: (id) => set({ editingGameId: id }),
  setShowGameForm: (v) => set({ showGameForm: v, editingGameId: v ? get().editingGameId : null }),

  toggleFavorite: (id) => {
    set((s) => {
      const games = s.games.map(g => g.id === id ? { ...g, isFavorite: !g.isFavorite, updatedAt: touch() } : g);
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
    // Validación: no permitir renombrar a un nombre ya ocupado por otro jugador.
    if (typeof updates.name === 'string') {
      const incoming = normName(updates.name);
      const collides = incoming && get().players.some(p => p.id !== id && normName(p.name) === incoming);
      if (collides) return false;
    }
    set((s) => {
      const players = s.players.map(p => p.id === id ? { ...p, ...updates, updatedAt: touch() } : p);
      const updated = players.find(p => p.id === id);
      if (updated) savePlayer(updated).catch(e => console.error('Error saving player:', e));
      return { players };
    });
    return true;
  },

  deletePlayer: (id) => {
    set((s) => {
      // Cascada: partidas del jugador y sus logros. Todo se encola para
      // propagar los borrados al remoto y evitar resurrecciones.
      const removedMatches = s.matches.filter(m => m.playerIds.includes(id));
      const removedAchievements = s.playerAchievements.filter(a => a.playerId === id);

      deletePlayerDb(id).catch(e => console.error('Error deleting player:', e));
      removedMatches.forEach(m => deleteMatchDb(m.id).catch(e => console.error('Error deleting match:', e)));
      removedAchievements.forEach(a =>
        deleteAchievementDb(a.achievementId, a.playerId).catch(e => console.error('Error deleting achievement:', e))
      );

      return {
        players: s.players.filter(p => p.id !== id),
        matches: s.matches.filter(m => !m.playerIds.includes(id)),
        playerAchievements: s.playerAchievements.filter(a => a.playerId !== id),
      };
    });
  },

  addMatch: (matchData) => {
    const id = uuid();
    const now = new Date().toISOString();
    const match: MatchRecord = {
      ...matchData,
      id,
      synced: false,
      createdAt: now,
      updatedAt: now,
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
      const matches = s.matches.map(m => m.id === id ? { ...m, ...updates, synced: false, updatedAt: touch() } : m);
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
      // club_100 solo tiene sentido en juegos de puntuación alta; en
      // 7 Wonders Duel (~60-80 puntos máx.) sería inalcanzable.
      if (playerScore && playerScore.total >= 100 && !(game && isDuelPadGame(game))) {
        state.addAchievement({
          achievementId: 'club_100',
          playerId,
          unlockedAt: new Date().toISOString(),
          matchId
        });
      }

      if (isWinner && game && (game.name.includes('7 Wonders'))) {
        const militaryCat = game.scoringTemplate.categories.find(c =>
          c.metadata === 'militar' || c.metadata === 'wonder_derrota' || c.metadata === 'wonder_militar'
        );
        if (militaryCat && playerScore) {
          // Solo si la categoría militar existe REALMENTE en las puntuaciones:
          // su ausencia (partidas antiguas/plantillas cambiadas) no es un 0.
          const milScore = playerScore.scores[militaryCat.id];
          if (typeof milScore === 'number' && milScore === 0) {
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

    // Migración: añade la fila "Militar" a los registros de 7 Wonders Duel
    // existentes que no la tengan. Idempotente.
    await migrateDuelPadMilitar().catch((e) => console.error('Error migrating duel-pad militar:', e));

    // Migración: normaliza el scorepad de 7 Wonders Duel al set canónico
    // (Azules, Verdes, Amarillas, Moradas, Dioses, Maravillas, Fichas
    // Progreso, Monedas, Militar, Senado, Total). Idempotente.
    await migrateDuelPadCategoriesV4().catch((e) => console.error('Error migrating duel-pad categories v4:', e));

    const loaded = await loadLocalState();
    const originalQueue = await getSyncQueue();
    const queuedIds = new Set(originalQueue.map(q => q.id));

    // Deduplicación por nombre conservando el registro más reciente. Las
    // partidas/logros del duplicado eliminado se REASIGNAN al conservado
    // (no se pierden).
    const { kept: cleanGames, reassignments: gameRemaps } = deduplicateByName(loaded.games);
    const { kept: cleanPlayers, reassignments: playerRemaps } = deduplicateByName(loaded.players);
    const removedGameIds = Array.from(gameRemaps.keys());
    const removedPlayerIds = Array.from(playerRemaps.keys());

    const { matches: cleanMatches, achievements: cleanAchievements } = remapReferences(
      loaded.matches,
      loaded.playerAchievements,
      gameRemaps,
      playerRemaps,
    );

    // Persistir la limpieza en IndexedDB. deleteGameDb/deletePlayerDb
    // añaden entradas de borrado a la cola de sync que se subirán al remoto.
    await Promise.all([
      ...removedGameIds.map(id => deleteGameDb(id)),
      ...removedPlayerIds.map(id => deletePlayerDb(id)),
    ]);

    const hadDupes = removedGameIds.length > 0 || removedPlayerIds.length > 0;
    if (hadDupes) {
      // Reencolar los registros conservados y las referencias reasignadas
      // para que el remoto termine consistente (un registro por nombre y
      // partidas apuntando al id conservado).
      const toQueue: Promise<void>[] = [];
      for (const g of cleanGames) {
        if (!queuedIds.has(`game:${g.id}`)) toQueue.push(saveGame(g));
      }
      for (const p of cleanPlayers) {
        if (!queuedIds.has(`player:${p.id}`)) toQueue.push(savePlayer(p));
      }
      for (let i = 0; i < cleanMatches.length; i++) {
        // Solo re-encolar las partidas cuya referencia cambió.
        if (cleanMatches[i] !== loaded.matches[i]) toQueue.push(saveMatch(cleanMatches[i]));
      }
      for (let i = 0; i < cleanAchievements.length; i++) {
        if (cleanAchievements[i] !== loaded.playerAchievements[i]) {
          toQueue.push(saveAchievement(cleanAchievements[i]));
        }
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

    // Ordenar por fecha de encolado para reproducir el orden real de cambios
    // (deletes incluidos; la cascada encola en orden).
    const sortedQueue = [...queue].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));

    for (const item of sortedQueue) {
      try {
        let payload: unknown = null;
        let type: 'game' | 'player' | 'match' | 'achievement' = item.type;
        let isDelete = false;
        let matchId: string | undefined;

        // Formato de id: tipo:id (insert/update), tipo-del:id (delete)
        // o ach:[achievementId]:[playerId] / ach-del:[achievementId]:[playerId].
        const idParts = item.id.split(':');
        const baseType = idParts[0]; // ej: 'match' o 'match-del'
        const realId = idParts.slice(1).join(':'); // por si el UUID contuviera ':'
        isDelete = baseType.endsWith('-del');

        if (item.type === 'match') {
          matchId = realId;
          if (isDelete) {
            payload = { id: matchId };
          } else {
            // Prioridad absoluta al SNAPSHOT encolado: si un merge remoto ya
            // actualizó el estado en memoria, el snapshot sigue siendo la
            // versión local pendiente de subir y debe ganar al subirse.
            payload = isSyncQueueWithPayload(item) ? item.payload : matches.find(m => m.id === matchId);
            // Si el recurso ya no existe localmente, la operación neta es un
            // delete (evita recrear filas zombi en el remoto).
            if (!payload) {
              isDelete = true;
              payload = { id: matchId };
            }
          }
        } else if (item.type === 'player') {
          if (isDelete) {
            payload = { id: realId };
          } else {
            payload = isSyncQueueWithPayload(item) ? item.payload : players.find(p => p.id === realId);
            if (!payload) {
              isDelete = true;
              payload = { id: realId };
            }
          }
        } else if (item.type === 'game') {
          if (isDelete) {
            payload = { id: realId };
          } else {
            payload = isSyncQueueWithPayload(item) ? item.payload : games.find(g => g.id === realId);
            if (!payload) {
              isDelete = true;
              payload = { id: realId };
            }
          }
        } else if (item.type === 'achievement') {
          const [, achievementId, playerId] = item.id.split(':');
          if (isDelete) {
            payload = { achievementId, playerId };
          } else {
            payload = playerAchievements.find(a => a.achievementId === achievementId && a.playerId === playerId);
            if (!payload) {
              isDelete = true;
              payload = { achievementId, playerId };
            }
          }
        }

        const ok = await syncItemToRemote(type, payload, isDelete);
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
    get().refreshPendingSync();
  },

  syncFromRemote: async () => {
    const remote = await fetchRemoteState();
    if (!remote) {
      // Error de red/credenciales: NO confundir con remoto vacío. La cola
      // local permanece intacta para reintentarlo más tarde.
      console.error('[syncFromRemote] descarga remota fallida; se conserva la cola pendiente');
      set({ dbStatus: 'disconnected' });
      return;
    }

    // Deduplicar el remoto por nombre para no reintroducir duplicados en
    // el local (el remoto también puede contener duplicados de runs previos).
    const { kept: remoteGames, reassignments: remoteGameRemaps } = deduplicateByName(remote.games);
    const { kept: remotePlayers, reassignments: remotePlayerRemaps } = deduplicateByName(remote.players);
    const { matches: remoteMatches, achievements: remoteAchievements } = remapReferences(
      remote.matches,
      remote.playerAchievements,
      remoteGameRemaps,
      remotePlayerRemaps,
    );

    // Fusionar datos remotos con locales por ID con Last-Write-Wins basado
    // en updatedAt (fallback createdAt). En empate gana el LOCAL: protege
    // ediciones offline cuyo updatedAt coincide con la copia remota vieja.
    const { games: localGames, players: localPlayers, matches: localMatches, playerAchievements: localAchievements } = get();

    const mergeById = <T extends { id: string; createdAt: string; updatedAt?: string }>(local: T[], remoteArr: T[]): T[] => {
      const map = new Map<string, T>();
      local.forEach(item => map.set(item.id, item));
      remoteArr.forEach(item => {
        const existing = map.get(item.id);
        if (!existing) {
          map.set(item.id, item);
          return;
        }
        const versionOf = (x: T) => new Date(x.updatedAt ?? x.createdAt).getTime();
        if (versionOf(item) > versionOf(existing)) map.set(item.id, item);
      });
      return Array.from(map.values());
    };

    let mergedGames = mergeById(localGames, remoteGames);
    let mergedPlayers = mergeById(localPlayers, remotePlayers);
    const mergedMatches = mergeById(localMatches, remoteMatches.map(m => ({ ...m, synced: true })));

    // Deduplicar el resultado del merge por nombre: local y remoto pueden
    // tener el mismo juego con IDs distintos. Las referencias del duplicado
    // eliminado se reasignan al conservado.
    const { kept: finalGames, reassignments: finalGameRemaps } = deduplicateByName(mergedGames);
    const { kept: finalPlayers, reassignments: finalPlayerRemaps } = deduplicateByName(mergedPlayers);
    const finalRefs = remapReferences(mergedMatches, [], finalGameRemaps, finalPlayerRemaps);
    mergedGames = finalGames;
    mergedPlayers = finalPlayers;

    // Achievements: clave compuesta
    const achKey = (a: PlayerAchievement) => `${a.achievementId}:${a.playerId}`;
    const achMap = new Map<string, PlayerAchievement>();
    localAchievements.forEach(a => achMap.set(achKey(a), a));
    remoteAchievements.forEach(a => {
      const existing = achMap.get(achKey(a));
      if (!existing || new Date(a.unlockedAt).getTime() > new Date(existing.unlockedAt).getTime()) {
        achMap.set(achKey(a), a);
      }
    });

    const mergedAchievements = Array.from(achMap.values()).map(a => ({
      ...a,
      playerId: finalPlayerRemaps.get(a.playerId) ?? a.playerId,
    }));

    set({
      games: mergedGames,
      players: mergedPlayers,
      matches: finalRefs.matches,
      playerAchievements: mergedAchievements,
    });

    // Persistir el resultado del merge en la BD local SIN re-encolarlo para
    // sincronización (los snapshots ya encolados conservan las versiones
    // locales pendientes).
    await Promise.all([
      ...mergedGames.map(g => saveGame(g, true)),
      ...mergedPlayers.map(p => savePlayer(p, true)),
      ...finalRefs.matches.map(m => saveMatch(m, true)),
      ...mergedAchievements.map(a => saveAchievement(a, true)),
    ]);

    // Subir los cambios locales pendientes DESPUÉS del merge: los snapshots
    // garantizan que se sube la versión local editada, no la mezclada.
    await get().syncPendingItems();
  },

  checkConnection: async () => {
    const status = await checkRemoteConnection();
    set({ dbStatus: status });
  },
}));
