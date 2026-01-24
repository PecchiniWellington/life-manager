/**
 * AnimatedBar Atom
 * Barra animata per grafici - Apple-style
 *
 * ATOM: usa tag nativi (View) per rendering
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { SemanticColorKey, RadiusKey, easings } from '../tokens';

export type BarDirection = 'horizontal' | 'vertical';
export type BarSize = 'xs' | 'sm' | 'md' | 'lg';

export interface AnimatedBarProps {
  /** Valore (0-100) */
  value: number;
  /** Direzione della barra */
  direction?: BarDirection;
  /** Dimensione (altezza per horizontal, larghezza per vertical) */
  size?: BarSize;
  /** Colore della barra */
  color?: SemanticColorKey;
  /** Colore sfondo */
  trackColor?: SemanticColorKey;
  /** Border radius */
  radius?: RadiusKey;
  /** Delay animazione in ms */
  delay?: number;
  /** Durata animazione in ms */
  duration?: number;
  /** Usa spring */
  spring?: boolean;
  /** Lunghezza massima (width per horizontal, height per vertical) */
  maxLength?: number;
  /** Test ID */
  testID?: string;
}

const sizeConfig: Record<BarSize, number> = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
};

export function AnimatedBar({
  value,
  direction = 'horizontal',
  size = 'md',
  color = 'primary',
  trackColor = 'border',
  radius = 'full',
  delay = 0,
  duration = 600,
  spring = true,
  maxLength,
  testID,
}: AnimatedBarProps): JSX.Element {
  const theme = useTheme();
  const thickness = sizeConfig[size];
  const animatedValue = useSharedValue(0);

  const clampedValue = Math.min(100, Math.max(0, value));

  useEffect(() => {
    const animation = spring
      ? withSpring(clampedValue, { damping: 15, stiffness: 90 })
      : withTiming(clampedValue, {
          duration,
          easing: easings.standard,
        });

    animatedValue.value = delay > 0 ? withDelay(delay, animation) : animation;
  }, [clampedValue, spring, duration, delay]);

  const animatedBarStyle = useAnimatedStyle(() => {
    if (direction === 'horizontal') {
      return {
        width: `${animatedValue.value}%`,
      };
    }
    return {
      height: `${animatedValue.value}%`,
    };
  });

  const isHorizontal = direction === 'horizontal';

  const trackStyle: ViewStyle = {
    backgroundColor: theme.colors[trackColor],
    borderRadius: theme.radius[radius],
    overflow: 'hidden',
    ...(isHorizontal
      ? {
          height: thickness,
          width: maxLength ?? '100%',
        }
      : {
          width: thickness,
          height: maxLength ?? '100%',
        }),
  };

  const barStyle: ViewStyle = {
    backgroundColor: theme.colors[color],
    borderRadius: theme.radius[radius],
    ...(isHorizontal
      ? {
          height: '100%',
        }
      : {
          width: '100%',
          position: 'absolute',
          bottom: 0,
        }),
  };

  return (
    <View
      style={trackStyle}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: value }}
    >
      <Animated.View style={[barStyle, animatedBarStyle]} />
    </View>
  );
}

/**
 * AnimatedBarGroup
 * Gruppo di barre per grafici comparativi
 */
export interface BarData {
  value: number;
  color?: SemanticColorKey;
  label?: string;
}

export interface AnimatedBarGroupProps {
  /** Dati delle barre */
  data: BarData[];
  /** Direzione */
  direction?: BarDirection;
  /** Dimensione barre */
  size?: BarSize;
  /** Spacing tra barre */
  spacing?: number;
  /** Delay stagger tra barre */
  staggerDelay?: number;
  /** Colore di default */
  defaultColor?: SemanticColorKey;
  /** Colore track */
  trackColor?: SemanticColorKey;
  /** Test ID */
  testID?: string;
}

export function AnimatedBarGroup({
  data,
  direction = 'vertical',
  size = 'md',
  spacing = 8,
  staggerDelay = 50,
  defaultColor = 'primary',
  trackColor = 'border',
  testID,
}: AnimatedBarGroupProps): JSX.Element {
  const isHorizontal = direction === 'horizontal';

  const containerStyle: ViewStyle = {
    flexDirection: isHorizontal ? 'column' : 'row',
    alignItems: isHorizontal ? 'stretch' : 'flex-end',
    justifyContent: 'space-between',
    gap: spacing,
    flex: 1,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {data.map((item, index) => (
        <AnimatedBar
          key={index}
          value={item.value}
          direction={direction}
          size={size}
          color={item.color ?? defaultColor}
          trackColor={trackColor}
          delay={index * staggerDelay}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({});
