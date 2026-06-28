import type { ReactNode } from 'react';
import { Building2, Hexagon, Pyramid, XCircle, Sigma, Award, Landmark } from 'lucide-react';
import type { ScoreCategory, ScoreCategoryMetadata } from '../types';

// Tipos de fila del scorepad Duel. Incluyen la cabecera decorativa
// (wonder_header) y cada uno de los metadatos disponibles como categoría.
export type DuelPadRowKind = 'wonder_header' | ScoreCategoryMetadata;

export interface DuelPadRowStyle {
  bg: string;
  iconBg: string;
  icon: ReactNode;
  iconClassName?: string;
}

const CARD_BLUE = '#3B82F6';
const CARD_GREEN = '#16A34A';
const CARD_YELLOW = '#EAB308';
const CARD_PURPLE = '#7C3AED';
const SCIENCE_GREY = '#9CA3AF';
const WONDER_GOLD = '#F59E0B';
const COIN_GREEN = '#15803D';
const COIN_GOLD = '#CA8A04';
const DEFEAT_RED = '#B91C1C';
const PROGRESS_GREY = '#94A3B8';
const SUPREMACY_MILITARY = '#B91C1C';
const SUPREMACY_SCIENCE = '#15803D';
const SUPREMACY_CIVIL = '#475569';

function ColoredRect({ color }: { color: string }) {
  return (
    <span
      className="block rounded-sm border border-black/30"
      style={{ width: 18, height: 26, backgroundColor: color }}
    />
  );
}

function ColoredCoin({ color }: { color: string }) {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-full border border-black/30"
      style={{ width: 26, height: 26, backgroundColor: color, color: 'rgba(0,0,0,0.55)' }}
    >
      <span className="font-bold text-[10px]">¢</span>
    </span>
  );
}

function ProgressToken() {
  return (
    <span
      className="relative inline-flex items-end justify-center overflow-hidden rounded-t-full border border-black/30"
      style={{ width: 26, height: 14, backgroundColor: PROGRESS_GREY }}
      aria-hidden
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-white/60" />
    </span>
  );
}

function PurpleCard() {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-md border border-black/40"
      style={{ width: 22, height: 30, backgroundColor: CARD_PURPLE }}
    >
      <span className="absolute inset-x-1 top-1 h-2 rounded-sm bg-white/40" />
      <span className="absolute inset-x-1 bottom-1 h-2 rounded-sm bg-white/40" />
      <span className="h-2 w-2 rounded-full bg-white/70" />
    </span>
  );
}

function Wreath({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
      <path
        d="M14 4 C 8 6, 5 11, 5 16 C 5 21, 9 24, 14 25 C 19 24, 23 21, 23 16 C 23 11, 20 6, 14 4 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M9 9 C 8 11, 8 13, 9 14 M19 9 C 20 11, 20 13, 19 14"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="14" cy="15" r="2.2" fill={color} />
    </svg>
  );
}

export const DUEL_PAD_ROW_STYLES: Record<DuelPadRowKind, DuelPadRowStyle> = {
  wonder_header: {
    bg: '#0F172A',
    iconBg: '#0F172A',
    icon: <Landmark className="h-5 w-5" style={{ color: '#FFFFFF' }} />,
  },
  wonder_civil: {
    bg: '#DBEAFE',
    iconBg: '#EFF6FF',
    icon: <ColoredRect color={CARD_BLUE} />,
  },
  wonder_comercio: {
    bg: '#DCFCE7',
    iconBg: '#F0FDF4',
    icon: <ColoredRect color={CARD_GREEN} />,
  },
  wonder_recurso: {
    bg: '#FEF9C3',
    iconBg: '#FEFCE8',
    icon: <ColoredRect color={CARD_YELLOW} />,
  },
  wonder_gremio: {
    bg: '#EDE9FE',
    iconBg: '#F5F3FF',
    icon: <PurpleCard />,
  },
  ciencia: {
    bg: '#F8FAFC',
    iconBg: '#F1F5F9',
    icon: <Hexagon className="h-5 w-5" style={{ color: SCIENCE_GREY }} />,
  },
  maravilla: {
    bg: '#F1F5F9',
    iconBg: '#F8FAFC',
    icon: <Pyramid className="h-5 w-5" style={{ color: WONDER_GOLD }} />,
  },
  wonder_moneda: {
    bg: '#DCFCE7',
    iconBg: '#F0FDF4',
    icon: <ColoredCoin color={COIN_GREEN} />,
  },
  moneda: {
    bg: '#FEF9C3',
    iconBg: '#FEFCE8',
    icon: <ColoredCoin color={COIN_GOLD} />,
  },
  wonder_derrota: {
    bg: '#FFE4E6',
    iconBg: '#FFF1F2',
    icon: (
      <span className="relative inline-flex items-center justify-center rounded-full" style={{ width: 26, height: 26 }}>
        <XCircle className="absolute inset-0 h-full w-full" style={{ color: DEFEAT_RED }} />
        <span className="relative h-3 w-3 rounded-full" style={{ backgroundColor: DEFEAT_RED }} />
      </span>
    ),
  },
  militar: {
    bg: '#FFE4E6',
    iconBg: '#FFF1F2',
    icon: <XCircle className="h-5 w-5" style={{ color: DEFEAT_RED }} />,
  },
  wonder_progreso: {
    bg: '#F1F5F9',
    iconBg: '#F8FAFC',
    icon: <ProgressToken />,
  },
  progreso: {
    bg: '#F1F5F9',
    iconBg: '#F8FAFC',
    icon: <ProgressToken />,
  },
  wonder_total: {
    bg: '#0F172A',
    iconBg: '#1E293B',
    icon: <Sigma className="h-5 w-5" style={{ color: '#FFFFFF' }} />,
  },
  wonder_supremacia_militar: {
    bg: '#7F1D1D',
    iconBg: '#991B1B',
    icon: <Wreath color={SUPREMACY_MILITARY} />,
  },
  wonder_supremacia_cientifica: {
    bg: '#14532D',
    iconBg: '#166534',
    icon: <Wreath color={SUPREMACY_SCIENCE} />,
  },
  wonder_supremacia_civil: {
    bg: '#334155',
    iconBg: '#475569',
    icon: <Wreath color={SUPREMACY_CIVIL} />,
  },
  // Categorías legacy no presentes en el scorepad Duel pero definidas para
  // evitar huecos si un usuario reutiliza una categoría existente.
  civil: {
    bg: '#DBEAFE',
    iconBg: '#EFF6FF',
    icon: <ColoredRect color={CARD_BLUE} />,
  },
  comercio: {
    bg: '#DCFCE7',
    iconBg: '#F0FDF4',
    icon: <ColoredRect color={CARD_GREEN} />,
  },
  gremio: {
    bg: '#EDE9FE',
    iconBg: '#F5F3FF',
    icon: <PurpleCard />,
  },
  politica: {
    bg: '#F1F5F9',
    iconBg: '#F8FAFC',
    icon: <Building2 className="h-5 w-5" style={{ color: '#0F172A' }} />,
  },
  general: {
    bg: '#F8FAFC',
    iconBg: '#F1F5F9',
    icon: <Award className="h-5 w-5" style={{ color: '#475569' }} />,
  },
};

export const DUEL_PAD_ROW_ORDER: DuelPadRowKind[] = [
  'wonder_header',
  'wonder_civil',
  'wonder_comercio',
  'wonder_recurso',
  'wonder_gremio',
  'ciencia',
  'maravilla',
  'wonder_moneda',
  'moneda',
  'wonder_progreso',
  'wonder_total',
  'wonder_supremacia_militar',
  'wonder_supremacia_cientifica',
  'wonder_supremacia_civil',
];

export function getDuelPadRowStyle(kind: DuelPadRowKind): DuelPadRowStyle {
  return DUEL_PAD_ROW_STYLES[kind];
}

/** Categorías por defecto para el scorepad de 7 Wonders Duel. */
export function buildDuelPadCategories(): ScoreCategory[] {
  return [
    { id: 'civil', name: 'Azules', metadata: 'wonder_civil' },
    { id: 'comercio', name: 'Verdes', metadata: 'wonder_comercio' },
    { id: 'recurso', name: 'Amarillas', metadata: 'wonder_recurso' },
    { id: 'gremio', name: 'Moradas', metadata: 'wonder_gremio' },
    { id: 'ciencia', name: 'Ciencia', metadata: 'ciencia' },
    { id: 'etapa', name: 'Etapas', metadata: 'maravilla' },
    { id: 'moneda_v', name: 'Monedas V', metadata: 'wonder_moneda' },
    { id: 'moneda_a', name: 'Monedas A', metadata: 'moneda' },
    { id: 'progreso', name: 'Progreso', metadata: 'wonder_progreso' },
    { id: 'total', name: 'Total', metadata: 'wonder_total' },
    { id: 'sup_mil', name: 'Supremacía M.', metadata: 'wonder_supremacia_militar' },
    { id: 'sup_cie', name: 'Supremacía C.', metadata: 'wonder_supremacia_cientifica' },
    { id: 'sup_civ', name: 'Supremacía V.', metadata: 'wonder_supremacia_civil' },
  ];
}

export function isDuelPadCategoryKind(metadata: ScoreCategoryMetadata | undefined): metadata is ScoreCategoryMetadata & DuelPadRowKind {
  if (!metadata) return false;
  return metadata in DUEL_PAD_ROW_STYLES;
}

/** Etiquetas legibles para mostrar junto al icono en filas sin nombre. */
export const DUEL_PAD_ROW_LABELS: Record<DuelPadRowKind, string> = {
  wonder_header: 'Maravilla',
  wonder_civil: 'Azules',
  wonder_comercio: 'Verdes',
  wonder_recurso: 'Amarillas',
  wonder_gremio: 'Moradas',
  ciencia: 'Ciencia',
  maravilla: 'Etapas',
  wonder_moneda: 'Monedas V',
  moneda: 'Monedas A',
  wonder_derrota: 'Derrota',
  militar: 'Derrota',
  wonder_progreso: 'Progreso',
  progreso: 'Progreso',
  wonder_total: 'Total',
  wonder_supremacia_militar: 'Supremacía militar',
  wonder_supremacia_cientifica: 'Supremacía científica',
  wonder_supremacia_civil: 'Supremacía civil',
  civil: 'Azules',
  comercio: 'Verdes',
  gremio: 'Moradas',
  politica: 'Política',
  general: 'General',
};

/**
 * Tipos de supremacía reconocidas como condición de victoria del scorepad.
 * Se mantienen sincronizados con `specialVictoryTypes` del juego semilla.
 */
export const SUPREMACY_TYPES = [
  'Supremacía Militar',
  'Supremacía Científica',
  'Supremacía Civil',
] as const;
export type SupremacyType = typeof SUPREMACY_TYPES[number];

/** Categorías del scorepad Duel en el orden visual de la imagen. */
export const DUEL_PAD_METADATA_ORDER: ScoreCategoryMetadata[] = [
  'wonder_civil',
  'wonder_comercio',
  'wonder_recurso',
  'wonder_gremio',
  'ciencia',
  'maravilla',
  'wonder_moneda',
  'moneda',
  'wonder_progreso',
  'wonder_total',
  'wonder_supremacia_militar',
  'wonder_supremacia_cientifica',
  'wonder_supremacia_civil',
];

/** Etiquetas mostradas en las supremacy cards de la sección inferior. */
export const SUPREMACY_OPTIONS: { type: string; label: string; meta: ScoreCategoryMetadata }[] = [
  { type: 'Supremacía Militar', label: 'Supremacía Militar', meta: 'wonder_supremacia_militar' },
  { type: 'Supremacía Científica', label: 'Supremacía Científica', meta: 'wonder_supremacia_cientifica' },
  { type: 'Supremacía Civil', label: 'Supremacía Civil', meta: 'wonder_supremacia_civil' },
];

export function supremacyMetaFor(type: string): ScoreCategoryMetadata | undefined {
  return SUPREMACY_OPTIONS.find(s => s.type === type)?.meta;
}