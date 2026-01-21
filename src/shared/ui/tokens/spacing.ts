/**
 * Spacing Tokens
 * Sistema di spaziatura basato su 4px
 */

export const spacing = {
  /** 0px */
  none: 0,
  /** 2px */
  xxs: 2,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px */
  '2xl': 24,
  /** 32px */
  '3xl': 32,
  /** 40px */
  '4xl': 40,
  /** 48px */
  '5xl': 48,
  /** 64px */
  '6xl': 64,
  /** 80px */
  '7xl': 80,
  /** 96px */
  '8xl': 96,
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[SpacingKey];

/**
 * Helper function to get spacing value
 */
export function getSpacing(key: SpacingKey): number {
  return spacing[key];
}

/**
 * Common layout spacing presets
 */
export const layoutSpacing = {
  /** Screen horizontal padding */
  screenHorizontal: spacing.lg,
  /** Screen vertical padding */
  screenVertical: spacing.lg,
  /** Card internal padding */
  cardPadding: spacing.lg,
  /** Section gap */
  sectionGap: spacing['2xl'],
  /** List item gap */
  listItemGap: spacing.sm,
  /** Input internal padding */
  inputPadding: spacing.md,
  /** Button internal padding horizontal */
  buttonPaddingX: spacing.lg,
  /** Button internal padding vertical */
  buttonPaddingY: spacing.md,
} as const;
