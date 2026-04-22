import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game, Player, MatchRecord, PlayerAchievement, DbStatus, ViewTab } from '../types';
import { defaultGames } from '../data/defaultGames';
import { v4 as uuid } from 'uuid';

interface AppState {
  // Data
  games: Game[];
  players: Player[];
  matches: MatchRecord[];
  playerAchievements: PlayerAchievement[];
  initialized: boolean;

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

  // Init
  initializeDefaults: () => void;
}

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      games: [],
      players: [],
      matches: [],
      playerAchievements: [],
      initialized: false,
      currentTab: 'library',
      dbStatus: 'disconnected',
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
        return id;
      },

      updateGame: (id, updates) => set((s) => ({
        games: s.games.map(g => g.id === id ? { ...g, ...updates } : g)
      })),

      deleteGame: (id) => set((s) => {
        const game = s.games.find(g => g.id === id);
        let games = s.games.filter(g => g.id !== id);
        // Remove from base game's expansionIds
        if (game?.isExpansion && game.baseGameId) {
          games = games.map(g => g.id === game.baseGameId
            ? { ...g, expansionIds: g.expansionIds.filter(eid => eid !== id) }
            : g
          );
        }
        // Also remove child expansions
        if (!game?.isExpansion) {
          games = games.filter(g => g.baseGameId !== id);
        }
        return { games, matches: s.matches.filter(m => m.gameId !== id) };
      }),

      setSelectedGameId: (id) => set({ selectedGameId: id }),
      setEditingGameId: (id) => set({ editingGameId: id }),
      setShowGameForm: (v) => set({ showGameForm: v, editingGameId: v ? get().editingGameId : null }),

      addPlayer: (name, color) => {
        const id = uuid();
        set((s) => ({
          players: [...s.players, { id, name, color: color || PLAYER_COLORS[s.players.length % PLAYER_COLORS.length], createdAt: new Date().toISOString() }]
        }));
        return id;
      },

      updatePlayer: (id, updates) => set((s) => ({
        players: s.players.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      deletePlayer: (id) => set((s) => ({
        players: s.players.filter(p => p.id !== id),
        matches: s.matches.filter(m => !m.playerIds.includes(id))
      })),

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
          pendingSyncQueue: [...s.pendingSyncQueue, id]
        }));
        // Check achievements after adding
        setTimeout(() => get().checkAchievements(id), 100);
        return id;
      },

      updateMatch: (id, updates) => set((s) => ({
        matches: s.matches.map(m => m.id === id ? { ...m, ...updates, synced: false } : m)
      })),

      deleteMatch: (id) => set((s) => ({
        matches: s.matches.filter(m => m.id !== id)
      })),

      setShowPlaySetup: (v) => set({ showPlaySetup: v }),
      setShowMatchDetail: (id) => set({ showMatchDetail: id }),

      addAchievement: (a) => set((s) => {
        const exists = s.playerAchievements.find(
          pa => pa.achievementId === a.achievementId && pa.playerId === a.playerId
        );
        if (exists) return {};
        return { playerAchievements: [...s.playerAchievements, a] };
      }),

      checkAchievements: (matchId) => {
        const state = get();
        const match = state.matches.find(m => m.id === matchId);
        if (!match) return;

        const game = state.games.find(g => g.id === match.gameId);
        if (!match.winnerId) return;

        // Check each player
        match.playerIds.forEach(playerId => {
          const playerMatches = state.matches.filter(m => m.playerIds.includes(playerId));
          const isWinner = match.winnerId === playerId;

          // Racha de 3 - Win streak of 3
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

          // Club de los 100
          const playerScore = match.playerScores.find(ps => ps.playerId === playerId);
          if (playerScore && playerScore.total >= 100) {
            state.addAchievement({
              achievementId: 'club_100',
              playerId,
              unlockedAt: new Date().toISOString(),
              matchId
            });
          }

          // El Pacificador - Win 7 Wonders / 7WD with 0 military
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

      initializeDefaults: () => {
        const state = get();
        if (!state.initialized) {
          set({ games: defaultGames, initialized: true });
        }
      },
    }),
    {
      name: 'gamy-storage',
    }
  )
);
