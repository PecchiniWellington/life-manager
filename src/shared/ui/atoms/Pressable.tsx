/**
 * Pressable Atom
 * Componente base per tutti gli elementi interattivi
 */

import React, { useCallback } from 'react';
import {
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
  ViewStyle,
  Animated,
  AccessibilityRole,
} from 'react-native';
import { useTheme } from '../theme';
import { SpacingKey, RadiusKey, SemanticColorKey } from '../tokens';

/**
 * Pressable Props
 */
export interface PressableProps extends Omit<RNPressableProps, 'style'> {
  // Spacing
  padding?: SpacingKey;
  paddingX?: SpacingKey;
  paddingY?: SpacingKey;

  // Layout
  flex?: number;
  flexDirection?: ViewStyle['flexDirection'];
  alignItems?: ViewStyle['alignItems'];
  justifyContent?: ViewStyle['justifyContent'];

  // Sizing
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  minHeight?: number;

  // Appearance
  backgroundColor?: SemanticColorKey;
  borderRadius?: RadiusKey;
  borderWidth?: number;
  borderColor?: SemanticColorKey;
  opacity?: number;

  // Feedback
  activeOpacity?: number;
  activeScale?: number;

  // Accessibility
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;

  // Style override
  style?: ViewStyle;

  children?: React.ReactNode;
}

/**
 * Pressable Component
 * Atom base per tutti gli elementi touch
 */
export function Pressable({
  // Spacing
  padding,
  paddingX,
  paddingY,

  // Layout
  flex,
  flexDirection,
  alignItems,
  justifyContent,

  // Sizing
  width,
  height,
  minHeight,

  // Appearance
  backgroundColor,
  borderRadius,
  borderWidth,
  borderColor,
  opacity = 1,

  // Feedback
  activeOpacity = 0.7,
  activeScale,

  // Accessibility
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',

  // Other
  style,
  disabled,
  children,
  ...rest
}: PressableProps): JSX.Element {
  const theme = useTheme();

  const baseStyle: ViewStyle = {
    ...(padding !== undefined && { padding: theme.spacing[padding] }),
    ...(paddingX !== undefined && { paddingHorizontal: theme.spacing[paddingX] }),
    ...(paddingY !== undefined && { paddingVertical: theme.spacing[paddingY] }),
    ...(flex !== undefined && { flex }),
    ...(flexDirection !== undefined && { flexDirection }),
    ...(alignItems !== undefined && { alignItems }),
    ...(justifyContent !== undefined && { justifyContent }),
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    ...(minHeight !== undefined && { minHeight }),
    ...(backgroundColor !== undefined && {
      backgroundColor: theme.colors[backgroundColor],
    }),
    ...(borderRadius !== undefined && { borderRadius: theme.radius[borderRadius] }),
    ...(borderWidth !== undefined && { borderWidth }),
    ...(borderColor !== undefined && { borderColor: theme.colors[borderColor] }),
    opacity: disabled ? 0.5 : opacity,
  };

  const getPressedStyle = useCallback(
    (pressed: boolean): ViewStyle => {
      if (!pressed) return {};
      return {
        opacity: activeOpacity,
        ...(activeScale !== undefined && { transform: [{ scale: activeScale }] }),
      };
    },
    [activeOpacity, activeScale]
  );

  return (
    <RNPressable
      style={({ pressed }) => [baseStyle, getPressedStyle(pressed), style]}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: disabled ?? false }}
      {...rest}
    >
      {children}
    </RNPressable>
  );
}
