import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RemigioDefaults {
  defaultPricePerRound: number;
  defaultPricePerGame: number;
  defaultPricePerReentry: number;
  defaultTargetScore: number;
  defaultPlayerNames: string[];
}

interface RemigioDefaultsStore extends RemigioDefaults {
  setDefaults: (settings: Partial<RemigioDefaults>) => void;
  resetDefaults: () => void;
}

const defaults: RemigioDefaults = {
  defaultPricePerRound: 0,
  defaultPricePerGame: 0,
  defaultPricePerReentry: 0,
  defaultTargetScore: 150,
  defaultPlayerNames: [],
};

export const useRemigioDefaults = create<RemigioDefaultsStore>()(
  persist(
    (set) => ({
      ...defaults,
      setDefaults: (newSettings) => set(newSettings),
      resetDefaults: () => set(defaults),
    }),
    {
      name: 'ludotic-remigio-defaults',
    },
  ),
);