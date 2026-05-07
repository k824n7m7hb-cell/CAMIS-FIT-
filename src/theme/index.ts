// src/theme/index.ts
// ─────────────────────────────────────────
// Camis FIT — Design System
// Dark premium + neon green
// ─────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bg:       '#07090d',
  bg2:      '#0c1017',
  bg3:      '#111820',
  bg4:      '#16202c',
  card:     '#0f161e',
  card2:    '#141d28',
  card3:    '#192230',

  // Neon green (primary brand)
  neon:     '#00ff87',
  neonDim:  '#00ff8722',
  neonBorder:'#00ff8450',

  // Text
  text:     '#eef2f7',
  textMid:  '#aabccc',
  textSub:  '#7a8fa8',
  textFaint:'#364556',

  // Border
  border:   '#1c2a3a',

  // Semantic
  red:      '#ff4560',
  redDim:   '#ff456025',
  amber:    '#ffb84e',
  amberDim: '#ffb84e25',
  blue:     '#4e9eff',
  blueDim:  '#4e9eff25',
  purple:   '#a855f7',
  purpleDim:'#a855f725',
  pink:     '#ff4ecd',
  pinkDim:  '#ff4ecd25',

  // Status
  pago:     '#00ff87',
  pagoDim:  '#00ff8722',
  pendente: '#ffb84e',
  pendenteDim:'#ffb84e22',
  vencido:  '#ff4560',
  vencidoDim:'#ff456022',
};

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
    regular: '400' as const,
    medium:  '500' as const,
    semibold:'600' as const,
    bold:    '700' as const,
    extrabold:'800' as const,
    black:   '900' as const,
  },
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 999,
};

export const Shadows = {
  neon: {
    shadowColor: Colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  neonSm: {
    shadowColor: Colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
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
};
