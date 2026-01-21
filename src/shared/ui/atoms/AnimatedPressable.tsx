/**
 * AnimatedPressable
 * Pressable con animazioni spring e haptic feedback Apple-style
 */

import React, { useCallback } from 'react';
import {
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { springs, pressScale as pressScaleTokens, SpringConfig, PressScale } from '../tokens';

const AnimatedRNPressable = Animated.createAnimatedComponent(RNPressable);

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' | 'none';

export interface AnimatedPressableProps extends Omit<RNPressableProps, 'style'> {
  /** Scale quando premuto (default: 'normal' = 0.97) */
  pressScale?: PressScale | number;
  /** Tipo di haptic feedback */
  haptic?: HapticType;
  /** Configurazione spring */
  spring?: SpringConfig;
  /** Stile del contenitore */
  style?: StyleProp<ViewStyle>;
  /** Children */
  children?: React.ReactNode;
}

/**
 * Trigger haptic feedback
 */
function triggerHaptic(type: HapticType): void {
  switch (type) {
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'selection':
      Haptics.selectionAsync();
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'warning':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case 'none':
    default:
      break;
  }
}

/**
 * AnimatedPressable Component
 * Pressable con spring animation su press e haptic feedback integrato
 */
export function AnimatedPressable({
  pressScale = 'normal',
  haptic = 'light',
  spring = 'stiff',
  onPressIn,
  onPressOut,
  onPress,
  style,
  disabled,
  children,
  ...rest
}: AnimatedPressableProps): JSX.Element {
  const scale = useSharedValue(1);

  // Get scale value from tokens or use number directly
  const scaleValue = typeof pressScale === 'number'
    ? pressScale
    : pressScaleTokens[pressScale];

  // Get spring config
  const springConfig: WithSpringConfig = springs[spring];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(scaleValue, springConfig);

      if (haptic !== 'none' && !disabled) {
        triggerHaptic(haptic);
      }

      onPressIn?.(event);
    },
    [scaleValue, springConfig, haptic, disabled, onPressIn, scale]
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(1, springConfig);
      onPressOut?.(event);
    },
    [springConfig, onPressOut, scale]
  );

  return (
    <AnimatedRNPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedRNPressable>
  );
}

/**
 * Hook per usare le animazioni press in componenti custom
 */
export function usePressAnimation(
  pressScale: PressScale | number = 'normal',
  spring: SpringConfig = 'stiff'
) {
  const scale = useSharedValue(1);

  const scaleValue = typeof pressScale === 'number'
    ? pressScale
    : pressScaleTokens[pressScale];

  const springConfig = springs[spring];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleValue, springConfig);
  }, [scaleValue, springConfig, scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, springConfig);
  }, [springConfig, scale]);

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
  };
}
