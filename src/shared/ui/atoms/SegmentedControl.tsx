/**
 * SegmentedControl
 * Controllo segmentato Apple-style
 */

import React, { useCallback, useEffect } from 'react';
import { View, LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from './AnimatedPressable';
import { Text } from './Text';
import { useTheme } from '../theme';
import { springs, radius as radiusTokens, shadows } from '../tokens';

export interface SegmentedControlOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export type SegmentedControlSize = 'sm' | 'md' | 'lg';

export interface SegmentedControlProps<T = string> {
  /** Opzioni disponibili */
  options: SegmentedControlOption<T>[];
  /** Valore selezionato */
  value: T;
  /** Callback cambio valore */
  onChange: (value: T) => void;
  /** Dimensione */
  size?: SegmentedControlSize;
  /** Disabilitato */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

const heights: Record<SegmentedControlSize, number> = {
  sm: 28,
  md: 32,
  lg: 40,
};

/**
 * SegmentedControl Component
 * Selezione singola con indicatore animato
 */
export function SegmentedControl<T = string>({
  options,
  value,
  onChange,
  size = 'md',
  disabled = false,
  fullWidth = true,
}: SegmentedControlProps<T>): JSX.Element {
  const theme = useTheme();
  const height = heights[size];
  const selectedIndex = options.findIndex((o) => o.value === value);

  // Animated values
  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const segmentWidths = useSharedValue<number[]>([]);
  const segmentPositions = useSharedValue<number[]>([]);

  // Update indicator position when selection changes
  useEffect(() => {
    if (segmentPositions.value.length > selectedIndex && selectedIndex >= 0) {
      translateX.value = withSpring(
        segmentPositions.value[selectedIndex] || 0,
        springs.stiff
      );
      indicatorWidth.value = withSpring(
        segmentWidths.value[selectedIndex] || 0,
        springs.stiff
      );
    }
  }, [selectedIndex, segmentPositions, segmentWidths, translateX, indicatorWidth]);

  // Handle segment layout
  const handleLayout = useCallback(
    (event: LayoutChangeEvent, index: number) => {
      const { width, x } = event.nativeEvent.layout;

      // Update arrays
      const newWidths = [...segmentWidths.value];
      const newPositions = [...segmentPositions.value];
      newWidths[index] = width;
      newPositions[index] = x;
      segmentWidths.value = newWidths;
      segmentPositions.value = newPositions;

      // Set initial position for selected item
      if (index === selectedIndex) {
        translateX.value = x;
        indicatorWidth.value = width;
      }
    },
    [selectedIndex, segmentWidths, segmentPositions, translateX, indicatorWidth]
  );

  // Handle press
  const handlePress = useCallback(
    (option: SegmentedControlOption<T>) => {
      if (disabled || option.disabled) return;

      Haptics.selectionAsync();
      onChange(option.value);
    },
    [disabled, onChange]
  );

  // Animated indicator style
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: theme.colors.backgroundTertiary,
          borderRadius: radiusTokens.segmented,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
      ]}
    >
      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: radiusTokens.segmented - 2,
            ...shadows.xs,
          },
          indicatorStyle,
        ]}
      />

      {/* Segments */}
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isDisabled = disabled || option.disabled;

        return (
          <AnimatedPressable
            key={String(option.value)}
            onPress={() => handlePress(option)}
            disabled={isDisabled}
            haptic="none" // We handle haptic manually
            pressScale={isDisabled ? 1 : 0.98}
            onLayout={(e) => handleLayout(e, index)}
            style={[styles.segment, fullWidth && styles.segmentFullWidth]}
          >
            <Text
              variant={size === 'sm' ? 'labelSmall' : 'labelMedium'}
              weight={isSelected ? 'semibold' : 'medium'}
              color={
                isDisabled
                  ? 'textDisabled'
                  : isSelected
                  ? 'textPrimary'
                  : 'textSecondary'
              }
            >
              {option.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 2,
    position: 'relative',
  },
  fullWidth: {
    width: '100%',
  },
  indicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
  },
  segment: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  segmentFullWidth: {
    flex: 1,
  },
});

export default SegmentedControl;
