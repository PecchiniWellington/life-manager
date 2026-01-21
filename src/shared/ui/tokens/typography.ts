/**
 * Typography Tokens
 * Sistema tipografico dell'applicazione
 */

import { Platform, TextStyle } from 'react-native';

/**
 * Font families
 */
export const fontFamilies = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
} as const;

/**
 * Font sizes
 */
export const fontSizes = {
  /** 10px */
  xxs: 10,
  /** 12px */
  xs: 12,
  /** 14px */
  sm: 14,
  /** 16px - body default */
  md: 16,
  /** 18px */
  lg: 18,
  /** 20px */
  xl: 20,
  /** 24px */
  '2xl': 24,
  /** 30px */
  '3xl': 30,
  /** 36px */
  '4xl': 36,
  /** 48px */
  '5xl': 48,
} as const;

export type FontSizeKey = keyof typeof fontSizes;

/**
 * Line heights
 */
export const lineHeights = {
  /** Tight - 1.25 */
  tight: 1.25,
  /** Normal - 1.5 */
  normal: 1.5,
  /** Relaxed - 1.625 */
  relaxed: 1.625,
  /** Loose - 2 */
  loose: 2,
} as const;

export type LineHeightKey = keyof typeof lineHeights;

/**
 * Font weights
 */
export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
} as const;

export type FontWeightKey = keyof typeof fontWeights;

/**
 * Letter spacing
 */
export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
} as const;

/**
 * Typography presets
 */
export const typography = {
  // Display
  displayLarge: {
    fontSize: fontSizes['5xl'],
    lineHeight: fontSizes['5xl'] * lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tighter,
  },
  displayMedium: {
    fontSize: fontSizes['4xl'],
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  displaySmall: {
    fontSize: fontSizes['3xl'],
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },

  // Headings
  headingLarge: {
    fontSize: fontSizes['2xl'],
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.tight,
  },
  headingMedium: {
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.tight,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },
  headingSmall: {
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.tight,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },

  // Body
  bodyLarge: {
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.normal,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },
  bodyMedium: {
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },

  // Labels
  labelLarge: {
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wide,
  },
  labelMedium: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wide,
  },
  labelSmall: {
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wider,
  },

  // Caption
  caption: {
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
