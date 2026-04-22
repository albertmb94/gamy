import { Game } from '../types';
import { v4 as uuid } from 'uuid';

const makeId = () => uuid();

// Pre-generate IDs for linking
const id7WD = makeId();
const idPantheon = makeId();
const idAgora = makeId();
const id7W = makeId();

export const defaultGames: Game[] = [
  {
    id: makeId(), name: 'Ravensburger Pokémon Puzzle (1000 piezas)',
    imageUrl: '',
    types: ['Puzzle'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 2, duration: 120,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Salton Sea',
    imageUrl: '',
    types: ['Estrategia'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 3, duration: 60,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Hanabi',
    imageUrl: '/images/hanabi.jpg',
    types: ['Cooperativo', 'Cartas'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 2, duration: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Dice Forge',
    imageUrl: '',
    types: ['Dados', 'Estrategia'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 3, duration: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Bizarre Bid',
    imageUrl: '',
    types: ['Cartas', 'Filler'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 1, duration: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Zombie Kittens',
    imageUrl: '',
    types: ['Cartas', 'Filler'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 1, duration: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Jaipur',
    imageUrl: '/images/jaipur.jpg',
    types: ['Cartas', 'Duel'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 2, duration: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'La Isla Prohibida',
    imageUrl: '',
    types: ['Cooperativo', 'Familiar'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 2, duration: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Codex: Silorealis',
    imageUrl: '',
    types: ['Estrategia', 'Cartas'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 3, duration: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Sushi Go!',
    imageUrl: '/images/sushi-go.jpg',
    types: ['Cartas', 'Filler', 'Familiar'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 1, duration: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Sushi Go Party!',
    imageUrl: '/images/sushi-go.jpg',
    types: ['Cartas', 'Familiar'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 2, duration: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Megacity: Oceania',
    imageUrl: '',
    types: ['Construcción', 'Estrategia'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 3, duration: 60,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Flamecraft',
    imageUrl: '/images/flamecraft.jpg',
    types: ['Estrategia', 'Familiar'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 2, duration: 60,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Dinosaur World',
    imageUrl: '/images/dinosaur-world.jpg',
    types: ['Estrategia'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 4, duration: 90,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Marrakech',
    imageUrl: '/images/marrakech.jpg',
    types: ['Estrategia', 'Familiar'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 2, duration: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'CATAN: El Duelo',
    imageUrl: '/images/catan-duel.jpg',
    types: ['Cartas', 'Estrategia', 'Duel'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 3, duration: 75,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Bamboo',
    imageUrl: '',
    types: ['Familiar', 'Estrategia'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 2, duration: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Jenga',
    imageUrl: '',
    types: ['Destreza', 'Familiar'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 1, duration: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Carcassonne',
    imageUrl: '/images/carcassonne.jpg',
    types: ['Estrategia', 'Familiar'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 2, duration: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Saboteur',
    imageUrl: '',
    types: ['Cartas', 'Negociación'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 1, duration: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(), name: 'Small World',
    imageUrl: '/images/small-world.jpg',
    types: ['Estrategia'], isExpansion: false, expansionIds: [],
    scoringTemplate: { type: 'simple', categories: [{ id: 'total', name: 'Total' }] },
    difficulty: 3, duration: 75,
    createdAt: new Date().toISOString(),
  },
  {
    id: id7W, name: '7 Wonders',
    imageUrl: '/images/7wonders-duel.jpg',
    types: ['Estrategia', 'Cartas'], isExpansion: false, expansionIds: [],
    scoringTemplate: {
      type: 'complex',
      categories: [
        { id: 'militar', name: 'Militar', metadata: 'militar' },
        { id: 'moneda', name: 'Monedas', metadata: 'moneda' },
        { id: 'maravilla', name: 'Maravilla', metadata: 'maravilla' },
        { id: 'civil', name: 'Civil', metadata: 'civil' },
        { id: 'comercio', name: 'Comercio', metadata: 'comercio' },
        { id: 'gremio', name: 'Gremios', metadata: 'gremio' },
        { id: 'ciencia', name: 'Ciencia', metadata: 'ciencia' },
      ]
    },
    difficulty: 3, duration: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: id7WD, name: '7 Wonders Duel',
    imageUrl: '/images/7wonders-duel.jpg',
    types: ['Estrategia', 'Cartas', 'Duel'], isExpansion: false, expansionIds: [idPantheon, idAgora],
    scoringTemplate: {
      type: 'complex',
      categories: [
        { id: 'militar', name: 'Militar', metadata: 'militar' },
        { id: 'moneda', name: 'Monedas', metadata: 'moneda' },
        { id: 'maravilla', name: 'Maravilla', metadata: 'maravilla' },
        { id: 'civil', name: 'Civil', metadata: 'civil' },
        { id: 'comercio', name: 'Comercio', metadata: 'comercio' },
        { id: 'gremio', name: 'Gremios', metadata: 'gremio' },
        { id: 'ciencia', name: 'Ciencia', metadata: 'ciencia' },
        { id: 'progreso', name: 'Progreso', metadata: 'progreso' },
      ]
    },
    allowSpecialVictory: true,
    specialVictoryTypes: ['Supremacía Militar', 'Supremacía Científica'],
    difficulty: 3, duration: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: idPantheon, name: 'Pantheon',
    types: ['Estrategia'], isExpansion: true, baseGameId: id7WD, expansionIds: [],
    scoringTemplate: {
      type: 'complex',
      categories: [
        { id: 'divinidad', name: 'Divinidades', metadata: 'general' },
        { id: 'gran_templo', name: 'Gran Templo', metadata: 'general' },
      ]
    },
    difficulty: 4, duration: 40,
    createdAt: new Date().toISOString(),
  },
  {
    id: idAgora, name: 'Agora',
    types: ['Estrategia'], isExpansion: true, baseGameId: id7WD, expansionIds: [],
    scoringTemplate: {
      type: 'complex',
      categories: [
        { id: 'politica', name: 'Política', metadata: 'politica' },
        { id: 'senado', name: 'Senado', metadata: 'general' },
      ]
    },
    allowSpecialVictory: true,
    specialVictoryTypes: ['Supremacía Política'],
    difficulty: 4, duration: 40,
    createdAt: new Date().toISOString(),
  },
];
