// src/theme/index.ts
// Design System do CamisFIT — dark premium + neon green

export const Colors = {
  // ── Backgrounds ───────────────────────
  bg:    '#0d1624',
  bg2:   '#111c2e',
  bg3:   '#162338',
  bg4:   '#1b2a42',
  card:  '#111e2e',
  card2: '#162538',
  card3: '#1b2c42',

  // ── Neon green (primary brand) ────────
  neon:       '#00ff87',
  neonDim:    '#00ff8718',
  neonBorder: '#00ff8445',

  // ── Text ─────────────────────────────
  text:      '#ffffff',
  textMid:   '#e0e0e0',
  textSub:   '#b0b0b0',
  textFaint: '#606060',

  // ── Border ───────────────────────────
  border:  '#253a52',
  border2: '#1e3048',

  // ── Semantic ─────────────────────────
  red:       '#ff4560',
  redDim:    '#ff456018',
  amber:     '#ffb84e',
  amberDim:  '#ffb84e18',
  blue:      '#4e9eff',
  blueDim:   '#4e9eff18',
  purple:    '#a855f7',
  purpleDim: '#a855f718',
  pink:      '#ff4ecd',
  pinkDim:   '#ff4ecd18',
  teal:      '#2dd4bf',
  tealDim:   '#2dd4bf18',

  // ── Status ───────────────────────────
  pago:        '#00ff87',
  pagoDim:     '#00ff8718',
  pendente:    '#ffb84e',
  pendenteDim: '#ffb84e18',
  vencido:     '#ff4560',
  vencidoDim:  '#ff456018',

  // ── Payment (preparação para integração) ──
  stripe:    '#635bff',
  stripeDim: '#635bff18',
  pix:       '#32bcad',
  pixDim:    '#32bcad18',
} as const;

export type ColorKey = keyof typeof Colors;

export const Typography = {
  fontFamily: 'Inter',
  sizes: {
    xs:   10,
    sm:   11,
    base: 13,
    md:   14,
    lg:   16,
    xl:   18,
    xxl:  22,
    hero: 28,
  },
  weights: {
    regular:   '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
    black:     '900' as const,
  },
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  xxxl: 40,
} as const;

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 999,
} as const;

export const Shadows = {
  neon: {
    shadowColor: Colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  neonSm: {
    shadowColor: Colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  purple: {
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
} as const;

// ── Gradients (para uso com LinearGradient) ───────────────────────────────
// Expo Linear Gradient: import { LinearGradient } from 'expo-linear-gradient'
export const Gradients = {
  neon:   ['#00ff87', '#00cc6a'] as [string, string],
  dark:   ['#0d1624', '#111e2e'] as [string, string],
  card:   ['#162538', '#111e2e'] as [string, string],
  purple: ['#a855f7', '#7c3aed'] as [string, string],
  amber:  ['#ffb84e', '#f59e0b'] as [string, string],
} as const;
