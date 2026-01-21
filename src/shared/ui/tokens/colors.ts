/**
 * Color Tokens
 * Definisce la palette colori dell'applicazione
 */

/**
 * iOS System Colors
 */
export const appleColors = {
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemIndigo: '#5856D6',
  systemOrange: '#FF9500',
  systemPink: '#FF2D55',
  systemPurple: '#AF52DE',
  systemRed: '#FF3B30',
  systemTeal: '#5AC8FA',
  systemYellow: '#FFCC00',
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',
} as const;

export const palette = {
  // Primary
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  blue800: '#1E40AF',
  blue900: '#1E3A8A',

  // Success / Green
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green300: '#86EFAC',
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',
  green800: '#166534',
  green900: '#14532D',

  // Warning / Yellow
  yellow50: '#FEFCE8',
  yellow100: '#FEF9C3',
  yellow200: '#FEF08A',
  yellow300: '#FDE047',
  yellow400: '#FACC15',
  yellow500: '#EAB308',
  yellow600: '#CA8A04',
  yellow700: '#A16207',
  yellow800: '#854D0E',
  yellow900: '#713F12',

  // Error / Red
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red200: '#FECACA',
  red300: '#FCA5A5',
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',
  red700: '#B91C1C',
  red800: '#991B1B',
  red900: '#7F1D1D',

  // Purple
  purple50: '#FAF5FF',
  purple100: '#F3E8FF',
  purple200: '#E9D5FF',
  purple300: '#D8B4FE',
  purple400: '#C084FC',
  purple500: '#A855F7',
  purple600: '#9333EA',
  purple700: '#7C3AED',
  purple800: '#6B21A8',
  purple900: '#581C87',

  // Orange
  orange50: '#FFF7ED',
  orange100: '#FFEDD5',
  orange200: '#FED7AA',
  orange300: '#FDBA74',
  orange400: '#FB923C',
  orange500: '#F97316',
  orange600: '#EA580C',
  orange700: '#C2410C',
  orange800: '#9A3412',
  orange900: '#7C2D12',

  // Neutral / Gray
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type PaletteColor = keyof typeof palette;

/**
 * Semantic colors for light theme
 */
export const lightColors = {
  // Background
  background: palette.white,
  backgroundSecondary: palette.gray50,
  backgroundTertiary: palette.gray100,

  // Surface (cards, modals)
  surface: palette.white,
  surfaceSecondary: palette.gray50,
  surfaceElevated: palette.white,

  // Text
  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray400,
  textInverse: palette.white,
  textDisabled: palette.gray300,

  // Border
  border: palette.gray200,
  borderSecondary: palette.gray100,
  borderFocus: palette.blue500,

  // Primary action
  primary: palette.blue600,
  primaryHover: palette.blue700,
  primaryPressed: palette.blue800,
  primaryDisabled: palette.blue200,
  primaryLight: palette.blue50,
  onPrimary: palette.white,

  // Secondary action
  secondary: palette.gray100,
  secondaryHover: palette.gray200,
  secondaryPressed: palette.gray300,
  onSecondary: palette.gray900,

  // Status colors
  success: palette.green600,
  successBackground: palette.green50,
  successLight: palette.green100,
  onSuccess: palette.white,

  warning: palette.yellow500,
  warningBackground: palette.yellow50,
  warningLight: palette.yellow100,
  onWarning: palette.gray900,

  error: palette.red600,
  errorBackground: palette.red50,
  errorLight: palette.red100,
  onError: palette.white,

  info: palette.blue500,
  infoBackground: palette.blue50,
  infoLight: palette.blue100,
  onInfo: palette.white,

  // Transparent
  transparent: 'transparent',

  // Calendar specific colors
  calendarToday: palette.blue100,
  calendarSelected: palette.blue600,
  calendarEvent: palette.blue500,

  // Navigation
  tabBarBackground: palette.white,
  tabBarActive: palette.blue600,
  tabBarInactive: palette.gray400,

  // Shadows
  shadowColor: palette.black,

  // Glass/Blur effects (Apple-style)
  glassBackground: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',

  // Grouped backgrounds (iOS style)
  groupedBackground: appleColors.systemGray6,
  groupedSecondary: palette.white,

  // Separator
  separator: 'rgba(60, 60, 67, 0.29)',
  separatorOpaque: '#C6C6C8',

  // iOS accent colors
  accent: appleColors.systemBlue,
  accentSecondary: appleColors.systemIndigo,
} as const;

/**
 * Semantic colors for dark theme
 */
export const darkColors = {
  // Background
  background: palette.gray900,
  backgroundSecondary: palette.gray800,
  backgroundTertiary: palette.gray700,

  // Surface (cards, modals)
  surface: palette.gray800,
  surfaceSecondary: palette.gray700,
  surfaceElevated: palette.gray800,

  // Text
  textPrimary: palette.gray50,
  textSecondary: palette.gray300,
  textTertiary: palette.gray500,
  textInverse: palette.gray900,
  textDisabled: palette.gray600,

  // Border
  border: palette.gray700,
  borderSecondary: palette.gray600,
  borderFocus: palette.blue400,

  // Primary action
  primary: palette.blue500,
  primaryHover: palette.blue400,
  primaryPressed: palette.blue600,
  primaryDisabled: palette.blue900,
  primaryLight: palette.blue900,
  onPrimary: palette.white,

  // Secondary action
  secondary: palette.gray700,
  secondaryHover: palette.gray600,
  secondaryPressed: palette.gray500,
  onSecondary: palette.gray50,

  // Status colors
  success: palette.green500,
  successBackground: palette.green900,
  successLight: palette.green900,
  onSuccess: palette.white,

  warning: palette.yellow400,
  warningBackground: palette.yellow900,
  warningLight: palette.yellow900,
  onWarning: palette.gray900,

  error: palette.red500,
  errorBackground: palette.red900,
  errorLight: palette.red900,
  onError: palette.white,

  info: palette.blue400,
  infoBackground: palette.blue900,
  infoLight: palette.blue900,
  onInfo: palette.white,

  // Transparent
  transparent: 'transparent',

  // Calendar specific colors
  calendarToday: palette.blue900,
  calendarSelected: palette.blue500,
  calendarEvent: palette.blue400,

  // Navigation
  tabBarBackground: palette.gray900,
  tabBarActive: palette.blue400,
  tabBarInactive: palette.gray500,

  // Shadows
  shadowColor: palette.black,

  // Glass/Blur effects (Apple-style)
  glassBackground: 'rgba(30, 30, 30, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Grouped backgrounds (iOS style)
  groupedBackground: palette.black,
  groupedSecondary: '#1C1C1E',

  // Separator
  separator: 'rgba(84, 84, 88, 0.65)',
  separatorOpaque: '#38383A',

  // iOS accent colors
  accent: appleColors.systemBlue,
  accentSecondary: appleColors.systemIndigo,
} as const;

export type SemanticColors = {
  [K in keyof typeof lightColors]: string;
};
export type SemanticColorKey = keyof typeof lightColors;

/**
 * Event colors for calendar
 */
export const eventColors = {
  blue: palette.blue500,
  green: palette.green500,
  red: palette.red500,
  yellow: palette.yellow500,
  purple: palette.purple500,
  orange: palette.orange500,
} as const;

export type EventColor = keyof typeof eventColors;
