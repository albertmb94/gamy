import { Game } from '../types';
import { buildDuelPadCategories } from './duelPad';

/**
 * Juegos predefinidos que se importan automáticamente la primera vez que el
 * usuario abre la app. Se identifican por nombre (case-insensitive) para no
 * duplicar entradas si el usuario ya tenía un 7 Wonders Duel creado.
 *
 * El ID se mantiene estable para que las partidas registradas antes/después
 * del seed apunten al mismo registro y se sincronicen correctamente.
 */
export const gamesSeed: Game[] = [
  {
    id: 'seed-7wonders-duel',
    name: '7 Wonders Duel',
    imageUrl: '/images/7wonders-duel.jpg',
    types: ['Duel', 'Cartas'],
    isExpansion: false,
    expansionIds: [],
    scoringTemplate: {
      type: 'complex',
      layout: 'duel-pad',
      categories: buildDuelPadCategories(),
    },
    allowSpecialVictory: true,
    specialVictoryTypes: ['Supremacía Militar', 'Supremacía Científica', 'Supremacía Civil'],
    difficulty: 3,
    duration: 30,
    createdAt: new Date('2025-01-01T00:00:00.000Z').toISOString(),
  },
];