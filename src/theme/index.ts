export const Colors = {
  // Brand — Burgundy
  brand: {
    50:  '#FFFBFC',
    100: '#FFF6F7',
    200: '#F7E6EA',
    300: '#E9A8B3',
    400: '#D97A8A',
    500: '#C4566A',
    600: '#A63A50',
    700: '#7A0320',
    800: '#5C0217',
    900: '#35010C',
    950: '#1A0007',
  },
  // Neutral
  neutral: {
    0:   '#FFFFFF',
    50:  '#F7F7F7',
    100: '#EBEBEB',
    200: '#D0D0D0',
    300: '#ADADAD',
    400: '#8A8A8A',
    500: '#6B6B6B',
    600: '#555555',
    700: '#404040',
    800: '#2E2E2E',
    900: '#1C1C1C',
    950: '#0D0D0D',
  },
  // Semantic status
  success: { 50: '#E8F7F1', 500: '#5DBB8A', 700: '#2E8A5A', 900: '#1A5C3A' },
  warning: { 50: '#FEF5E0', 500: '#F4B740', 700: '#B87000', 900: '#7A4A00' },
  urgent:  { 50: '#FFF2E8', 500: '#F07030', 700: '#B84A10', 900: '#7A3500' },
  danger:  { 50: '#FDEBEB', 500: '#D64545', 700: '#A33030', 900: '#6B1A1A' },
  // Decorative accents (light-mode pastels)
  accent: {
    rose:  { bg: '#FFE0EA', text: '#7A0320', border: '#F0A0B8' },
    peach: { bg: '#FFE8D6', text: '#7A3500', border: '#F0B090' },
    sage:  { bg: '#D8EDD8', text: '#2E5A2E', border: '#90C890' },
    gold:  { bg: '#FEF0C7', text: '#7A5800', border: '#F0C050' },
    sky:   { bg: '#D6EEFF', text: '#1A5A8A', border: '#80C0F0' },
  },
};

export const LightTheme = {
  bg: {
    app:     Colors.brand[100],
    surface: Colors.neutral[0],
    subtle:  Colors.brand[200],
    brand:   Colors.brand[900],
    overlay: 'rgba(53,1,12,0.48)',
  },
  text: {
    primary:   Colors.neutral[900],
    secondary: Colors.neutral[500],
    tertiary:  Colors.neutral[400],
    disabled:  Colors.neutral[300],
    inverse:   Colors.neutral[0],
    brand:     Colors.brand[900],
    link:      Colors.brand[600],
  },
  border: {
    subtle:  Colors.neutral[100],
    default: Colors.neutral[200],
    strong:  Colors.neutral[400],
    brand:   Colors.brand[600],
    focus:   Colors.brand[600],
  },
  interactive: {
    primary:        Colors.brand[900],
    primaryHover:   Colors.brand[800],
    primaryPressed: Colors.brand[950],
    primaryText:    Colors.neutral[0],
    secondary:      Colors.brand[200],
    secondaryText:  Colors.brand[900],
    ghostHover:     Colors.brand[100],
    destructive:    Colors.danger[500],
    destructiveText: Colors.neutral[0],
  },
  triage: {
    monitor:   { bg: Colors.success[50],  border: Colors.success[500], text: Colors.success[900] },
    watch:     { bg: Colors.warning[50],  border: Colors.warning[500], text: Colors.warning[900] },
    urgent:    { bg: Colors.urgent[50],   border: Colors.urgent[500],  text: Colors.urgent[900]  },
    emergency: { bg: Colors.danger[50],   border: Colors.danger[500],  text: Colors.danger[900]  },
  },
  accent: {
    rose:  { bg: '#FFE0EA', text: '#7A0320', border: '#F0A0B8' },
    peach: { bg: '#FFE8D6', text: '#7A3500', border: '#F0B090' },
    sage:  { bg: '#D8EDD8', text: '#2E5A2E', border: '#90C890' },
    gold:  { bg: '#FEF0C7', text: '#7A5800', border: '#F0C050' },
    sky:   { bg: '#D6EEFF', text: '#1A5A8A', border: '#80C0F0' },
  },
};

export const DarkTheme = {
  bg: {
    app:     '#1A0509',
    surface: '#26080F',
    subtle:  '#3D1520',
    brand:   Colors.brand[200],
    overlay: 'rgba(0,0,0,0.64)',
  },
  text: {
    primary:   '#FFF6F7',
    secondary: '#C4A0A8',
    tertiary:  '#8A6070',
    disabled:  '#6B4A50',
    inverse:   Colors.neutral[900],
    brand:     Colors.brand[300],
    link:      Colors.brand[400],
  },
  border: {
    subtle:  '#2E0C14',
    default: '#4A1C28',
    strong:  '#7A3A4A',
    brand:   Colors.brand[400],
    focus:   Colors.brand[300],
  },
  interactive: {
    primary:        Colors.brand[600],
    primaryHover:   Colors.brand[500],
    primaryPressed: Colors.brand[700],
    primaryText:    Colors.neutral[0],
    secondary:      '#3D1520',
    secondaryText:  Colors.brand[300],
    ghostHover:     '#2E0C14',
    destructive:    Colors.danger[500],
    destructiveText: Colors.neutral[0],
  },
  triage: {
    monitor:   { bg: 'rgba(93,187,138,0.12)',  border: Colors.success[700], text: Colors.success[500] },
    watch:     { bg: 'rgba(244,183,64,0.12)',  border: Colors.warning[700], text: Colors.warning[500] },
    urgent:    { bg: 'rgba(240,112,48,0.12)',  border: Colors.urgent[700],  text: Colors.urgent[500]  },
    emergency: { bg: 'rgba(214,69,69,0.12)',   border: Colors.danger[700],  text: Colors.danger[500]  },
  },
  accent: {
    rose:  { bg: '#3D1020', text: '#F0A0B8', border: '#7A2040' },
    peach: { bg: '#3D1E0A', text: '#F0B090', border: '#7A3A1A' },
    sage:  { bg: '#0E2C10', text: '#90C890', border: '#2A5C2A' },
    gold:  { bg: '#2C1E00', text: '#F0C050', border: '#5A3E00' },
    sky:   { bg: '#081C35', text: '#80C0F0', border: '#1A3D70' },
  },
};

export type Theme = typeof LightTheme;

export const Typography = {
  fontFamily: {
    display: 'Sniglet_400Regular',
    displayBold: 'Sniglet_800ExtraBold',
    body: 'Manrope_400Regular',
    bodyMedium: 'Manrope_500Medium',
    bodySemibold: 'Manrope_600SemiBold',
    bodyBold: 'Manrope_700Bold',
    bodyExtrabold: 'Manrope_800ExtraBold',
  },
  size: {
    xs:  10,
    sm:  12,
    base: 14,
    md:  16,
    lg:  18,
    xl:  20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
  },
};

export const Spacing = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
};

export const Radius = {
  none: 0,
  xs:   4,
  sm:   6,
  md:   10,
  lg:   16,
  xl:   20,
  '2xl': 28,
  '3xl': 40,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#35010C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#35010C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#35010C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.11,
    shadowRadius: 24,
    elevation: 8,
  },
};
