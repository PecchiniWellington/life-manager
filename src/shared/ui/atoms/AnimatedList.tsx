/**
 * AnimatedList
 * Lista con stagger animations Apple-style
 */

import React, { useCallback } from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  Layout,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { stagger } from '../tokens';

export type ListAnimationPreset = 'fadeUp' | 'fadeDown' | 'slideRight' | 'none';

export interface AnimatedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  /** Funzione di render item */
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement;
  /** Preset animazione entry */
  animation?: ListAnimationPreset;
  /** Ritardo stagger tra items */
  staggerDelay?: keyof typeof stagger | number;
  /** Max items con stagger (dopo usa delay fisso) */
  maxStaggerItems?: number;
  /** Abilita layout animations */
  enableLayoutAnimation?: boolean;
  /** Pull to refresh */
  onRefresh?: () => void;
  /** Refreshing state */
  refreshing?: boolean;
}

/**
 * Get entering animation based on preset
 */
function getEnteringAnimation(preset: ListAnimationPreset, delay: number) {
  switch (preset) {
    case 'fadeUp':
      return FadeInDown.delay(delay).springify().damping(15);
    case 'fadeDown':
      return FadeInUp.delay(delay).springify().damping(15);
    case 'slideRight':
      return SlideInRight.delay(delay).springify().damping(15);
    case 'none':
    default:
      return undefined;
  }
}

/**
 * Get exiting animation based on preset
 */
function getExitingAnimation(preset: ListAnimationPreset) {
  switch (preset) {
    case 'fadeUp':
      return FadeOutUp.springify();
    case 'fadeDown':
      return FadeOutDown.springify();
    case 'slideRight':
      return SlideOutLeft.springify();
    case 'none':
    default:
      return undefined;
  }
}

/**
 * AnimatedList Component
 * FlatList con animazioni stagger per gli items
 */
export function AnimatedList<T>({
  renderItem,
  animation = 'fadeUp',
  staggerDelay = 'normal',
  maxStaggerItems = 10,
  enableLayoutAnimation = true,
  onRefresh,
  refreshing = false,
  ...rest
}: AnimatedListProps<T>): React.ReactElement {
  const theme = useTheme();

  // Get stagger delay value
  const delayValue = typeof staggerDelay === 'number'
    ? staggerDelay
    : stagger[staggerDelay];

  // Animated item wrapper
  const AnimatedItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      // Calculate delay (cap at maxStaggerItems to avoid long waits)
      const itemDelay = index < maxStaggerItems
        ? index * delayValue
        : maxStaggerItems * delayValue;

      const entering = getEnteringAnimation(animation, itemDelay);
      const exiting = getExitingAnimation(animation);

      return (
        <Animated.View
          entering={entering}
          exiting={exiting}
          layout={enableLayoutAnimation ? Layout.springify().damping(15) : undefined}
        >
          {renderItem({ item, index } as ListRenderItemInfo<T>)}
        </Animated.View>
      );
    },
    [animation, delayValue, maxStaggerItems, enableLayoutAnimation, renderItem]
  );

  // Refresh control
  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.primary}
      colors={[theme.colors.primary]}
    />
  ) : undefined;

  return (
    <FlatList
      {...rest}
      renderItem={({ item, index }) => (
        <AnimatedItem item={item} index={index} />
      )}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    />
  );
}

/**
 * AnimatedSectionList helper for sections
 * (Can be expanded to full SectionList support)
 */
export function useStaggerAnimation(
  index: number,
  preset: ListAnimationPreset = 'fadeUp',
  delayMs: number = stagger.normal,
  maxItems: number = 10
) {
  const delay = index < maxItems ? index * delayMs : maxItems * delayMs;

  return {
    entering: getEnteringAnimation(preset, delay),
    exiting: getExitingAnimation(preset),
    layout: Layout.springify().damping(15),
  };
}

export default AnimatedList;
