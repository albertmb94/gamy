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

/** Valores canónicos por defecto (fuente única para reset y validaciones). */
export const REMIGIO_DEFAULTS: Readonly<RemigioDefaults> = defaults;

export const REMIGIO_MAX_PLAYERS = 8;
export const REMIGIO_MIN_PLAYERS = 2;

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