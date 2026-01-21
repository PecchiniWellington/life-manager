/**
 * Theme Configuration
 * Definisce la struttura del tema e le varianti light/dark
 */

import {
  lightColors,
  darkColors,
  SemanticColors,
  spacing,
  radius,
  typography,
  shadows,
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
 * Converte hex in RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converte RGB in hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Schiarisce un colore
 */
function lightenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    rgb.r + (255 - rgb.r) * amount,
    rgb.g + (255 - rgb.g) * amount,
    rgb.b + (255 - rgb.b) * amount
  );
}

/**
 * Scurisce un colore
 */
function darkenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    rgb.r * (1 - amount),
    rgb.g * (1 - amount),
    rgb.b * (1 - amount)
  );
}

/**
 * Crea colori primari basati su un colore accento
 */
export function createAccentColors(accentColor: string, isDark: boolean) {
  if (isDark) {
    return {
      primary: accentColor,
      primaryHover: lightenColor(accentColor, 0.1),
      primaryPressed: darkenColor(accentColor, 0.1),
      primaryDisabled: darkenColor(accentColor, 0.5),
      primaryLight: darkenColor(accentColor, 0.7),
      borderFocus: accentColor,
      calendarSelected: accentColor,
      calendarEvent: lightenColor(accentColor, 0.1),
      calendarToday: darkenColor(accentColor, 0.6),
      tabBarActive: accentColor,
      accent: accentColor,
    };
  }
  return {
    primary: accentColor,
    primaryHover: darkenColor(accentColor, 0.1),
    primaryPressed: darkenColor(accentColor, 0.2),
    primaryDisabled: lightenColor(accentColor, 0.6),
    primaryLight: lightenColor(accentColor, 0.9),
    borderFocus: accentColor,
    calendarSelected: accentColor,
    calendarEvent: accentColor,
    calendarToday: lightenColor(accentColor, 0.8),
    tabBarActive: accentColor,
    accent: accentColor,
  };
}

/**
 * Get theme by mode
 */
export function getTheme(mode: ThemeMode, systemIsDark: boolean): Theme {
  if (mode === 'system') {
    return systemIsDark ? darkTheme : lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Get theme with custom accent color
 */
export function getThemeWithAccent(
  mode: ThemeMode,
  systemIsDark: boolean,
  accentColor?: string | null
): Theme {
  const baseTheme = getTheme(mode, systemIsDark);

  if (!accentColor) {
    return baseTheme;
  }

  const accentColors = createAccentColors(accentColor, baseTheme.isDark);

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...accentColors,
    },
  };
}
