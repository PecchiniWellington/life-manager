/**
 * AnimatedNumber Atom
 * Numero con animazione count-up Apple-style
 *
 * ATOM: usa tag nativi (Text) per rendering
 */

import React, { useEffect, useCallback } from 'react';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { TextInput, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../theme';
import { SemanticColorKey, TypographyVariant, typography } from '../tokens';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export type NumberFormat = 'integer' | 'decimal' | 'currency' | 'percent';

export interface AnimatedNumberProps {
  /** Valore da mostrare */
  value: number;
  /** Formato */
  format?: NumberFormat;
  /** Decimali (per decimal/currency) */
  decimals?: number;
  /** Prefisso (es. "€") */
  prefix?: string;
  /** Suffisso (es. "%") */
  suffix?: string;
  /** Variante tipografica */
  variant?: TypographyVariant;
  /** Colore */
  color?: SemanticColorKey;
  /** Font weight */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /** Durata animazione */
  duration?: number;
  /** Usa spring */
  spring?: boolean;
  /** Test ID */
  testID?: string;
}

const fontWeights: Record<string, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export function AnimatedNumber({
  value,
  format = 'integer',
  decimals = 2,
  prefix = '',
  suffix = '',
  variant = 'headingLarge',
  color = 'textPrimary',
  weight = 'bold',
  duration = 800,
  spring = false,
  testID,
}: AnimatedNumberProps): JSX.Element {
  const theme = useTheme();
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState('0');

  useEffect(() => {
    if (spring) {
      animatedValue.value = withSpring(value, {
        damping: 15,
        stiffness: 80,
      });
    } else {
      animatedValue.value = withTiming(value, {
        duration,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }
  }, [value, spring, duration]);

  const formatNumber = useCallback((num: number): string => {
    let formatted: string;

    switch (format) {
      case 'decimal':
        formatted = num.toFixed(decimals);
        break;
      case 'currency':
        formatted = num.toLocaleString('it-IT', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
        break;
      case 'percent':
        formatted = num.toFixed(decimals);
        break;
      case 'integer':
      default:
        formatted = Math.round(num).toLocaleString('it-IT');
    }

    return `${prefix}${formatted}${suffix}`;
  }, [format, decimals, prefix, suffix]);

  // Update display value using stable callback
  const updateDisplayValue = useCallback((num: number) => {
    setDisplayValue(formatNumber(num));
  }, [formatNumber]);

  // Update display value on animation frame
  useAnimatedReaction(
    () => animatedValue.value,
    (currentValue) => {
      runOnJS(updateDisplayValue)(currentValue);
    },
    [updateDisplayValue]
  );

  const textStyle: TextStyle = {
    ...typography[variant],
    color: theme.colors[color],
    fontWeight: fontWeights[weight],
  };

  return (
    <AnimatedTextInput
      value={displayValue}
      editable={false}
      style={[styles.text, textStyle]}
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={`Valore: ${displayValue}`}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    padding: 0,
    margin: 0,
  },
});
