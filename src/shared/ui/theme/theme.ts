/**
 * Theme Configuration
 * Definisce la struttura del tema e le varianti light/dark
 */

import {
  lightColors,
  darkColors,
  SemanticColors,
  spacing,
  SpacingKey,
  radius,
  RadiusKey,
  typography,
  TypographyVariant,
  shadows,
  ShadowKey,
} from '../tokens';

/**
 * Theme structure
 */
export interface Theme {
  colors: SemanticColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  isDark: boolean;
}

/**
 * Light theme
 */
export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  radius,
  typography,
  shadows,
  isDark: false,
};

/**
 * Dark theme
 */
export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  radius,
  typography,
  shadows,
  isDark: true,
};

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Get theme by mode
 */
export function getTheme(mode: ThemeMode, systemIsDark: boolean): Theme {
  if (mode === 'system') {
    return systemIsDark ? darkTheme : lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
}
