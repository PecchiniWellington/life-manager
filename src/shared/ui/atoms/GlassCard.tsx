/**
 * GlassCard
 * Card con effetto glassmorphism Apple-style
 */

import React from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Box, BoxProps } from './Box';
import { useTheme } from '../theme';
import { shadows, radius as radiusTokens } from '../tokens';

export type GlassVariant = 'glass' | 'frosted' | 'solid';

export interface GlassCardProps extends Omit<BoxProps, 'backgroundColor'> {
  /** Intensita del blur (0-100) */
  intensity?: number;
  /** Variante dello stile */
  variant?: GlassVariant;
  /** Abilita animazione entry */
  animate?: boolean;
  /** Durata animazione in ms */
  animationDuration?: number;
  children?: React.ReactNode;
}

/**
 * GlassCard Component
 * Card con effetto glassmorphism per UI Apple-style
 */
export function GlassCard({
  intensity = 50,
  variant = 'frosted',
  animate = true,
  animationDuration = 300,
  padding = 'lg',
  borderRadius = 'card',
  children,
  style,
  ...rest
}: GlassCardProps): JSX.Element {
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    borderRadius: typeof borderRadius === 'string'
      ? radiusTokens[borderRadius]
      : borderRadius,
    overflow: 'hidden',
    ...(variant !== 'solid' ? {} : { backgroundColor: theme.colors.surface }),
    ...shadows.card,
  };

  const borderStyle: ViewStyle = {
    borderWidth: variant === 'glass' ? 1 : 0,
    borderColor: theme.colors.glassBorder,
  };

  const combinedStyle: ViewStyle = {
    ...containerStyle,
    ...borderStyle,
    ...(style as ViewStyle),
  };

  const content = (
    <Box
      padding={padding}
      borderRadius={borderRadius}
      style={combinedStyle}
      {...rest}
    >
      {variant !== 'solid' && (
        <BlurView
          intensity={intensity}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Box style={styles.content}>
        {children}
      </Box>
    </Box>
  );

  if (animate) {
    return (
      <Animated.View
        entering={FadeIn.duration(animationDuration)}
        exiting={FadeOut.duration(animationDuration)}
        layout={Layout.springify()}
      >
        {content}
      </Animated.View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

/**
 * PressableGlassCard
 * GlassCard interattiva con animazioni press
 */
export { GlassCard as default };
