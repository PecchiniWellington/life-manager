/**
 * Theme Context
 * Fornisce il tema a tutta l'applicazione con supporto per colore accento dinamico
 */

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { Theme, ThemeMode, getThemeWithAccent } from './theme';

/**
 * Theme context value
 */
interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  accentColor: string | null;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string | null) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

/**
 * Theme Provider
 * Wrapper che fornisce il tema a tutti i componenti figli
 */
export function ThemeProvider({
  children,
  initialMode = 'system',
}: ThemeProviderProps): JSX.Element {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode);
  const [accentColor, setAccentColor] = useState<string | null>(null);

  const systemIsDark = systemColorScheme === 'dark';

  const theme = useMemo(
    () => getThemeWithAccent(themeMode, systemIsDark, accentColor),
    [themeMode, systemIsDark, accentColor]
  );

  const toggleTheme = useCallback(() => {
    setThemeMode((current) => {
      if (current === 'system') {
        return systemIsDark ? 'light' : 'dark';
      }
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemIsDark]);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      accentColor,
      setThemeMode,
      setAccentColor,
      toggleTheme,
    }),
    [theme, themeMode, accentColor, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook per accedere al tema
 */
export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context.theme;
}

/**
 * Hook per accedere al contesto completo del tema
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook per ottenere solo i colori del tema corrente
 */
export function useColors() {
  const { colors } = useTheme();
  return colors;
}
