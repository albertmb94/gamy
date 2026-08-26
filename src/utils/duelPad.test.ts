import { describe, it, expect } from 'vitest';
import {
  buildDuelPadCategories,
  computeDuelTotal,
  mergeCategoriesById,
  orderedDuelCategories,
  isDuelPadGame,
} from './duelPad';
import { Game } from '../types';

function duelGame(overrides: Partial<Game> = {}): Game {
  return {
    id: 'g1',
    name: '7 Wonders Duel',
    types: ['Duel'],
    isExpansion: false,
    expansionIds: [],
    scoringTemplate: {
      type: 'complex',
      layout: 'duel-pad',
      categories: buildDuelPadCategories(),
    },
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('computeDuelTotal', () => {
  it('suma las categorías visibles excluyendo el Total y los metadatos excluidos', () => {
    const cats = buildDuelPadCategories();
    const scores = {
      civil: 5,
      comercio: 3,
      recurso: 2,
      total: 999, // calculada, no debe contarse
    };
    const total = computeDuelTotal(cats, scores);
    expect(total).toBe(10);
  });

  it('no cuenta categorías con metadatos excluidos (supremacías/legacy)', () => {
    const cats = buildDuelPadCategories();
    // Supremacías no son filas del scorepad; si llegaran como categoría no
    // deben sumarse al total.
    const total = computeDuelTotal([...cats, { id: 'sup', name: 'S', metadata: 'wonder_supremacia_militar' }], {
      civil: 5,
      sup: 100,
    });
    expect(total).toBe(5);
  });
});

describe('mergeCategoriesById', () => {
  it('deduplica por id (base gana a expansión)', () => {
    const base = [{ id: 'total', name: 'Total' }];
    const expansion = [{ id: 'total', name: 'Total' }, { id: 'extra', name: 'Extra' }];
    const merged = mergeCategoriesById(base, expansion);
    expect(merged).toHaveLength(2);
    expect(merged.map((c) => c.id)).toEqual(['total', 'extra']);
  });
});

describe('orderedDuelCategories / isDuelPadGame', () => {
  it('ordena según el set canónico y completa filas ausentes', () => {
    const game = duelGame({
      scoringTemplate: { type: 'complex', layout: 'duel-pad', categories: [{ id: 'civil', name: 'Azules', metadata: 'wonder_civil' }] },
    });
    const ordered = orderedDuelCategories(game);
    expect(ordered[0].id).toBe('civil');
    // Fila Total presente al final
    expect(ordered[ordered.length - 1].metadata).toBe('wonder_total');
  });

  it('detecta juegos Duel por layout o nombre', () => {
    expect(isDuelPadGame(duelGame())).toBe(true);
    expect(isDuelPadGame({ name: '7 wonders duel', scoringTemplate: { type: 'complex', categories: [] } })).toBe(true);
    expect(isDuelPadGame({ name: 'Catan', scoringTemplate: { type: 'simple', categories: [] } })).toBe(false);
  });
});
