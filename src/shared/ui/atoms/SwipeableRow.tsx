/**
 * SwipeableRow
 * Riga con swipe actions Apple-style
 */

import React, { useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon, IconName } from './Icon';
import { Text } from './Text';
import { Box } from './Box';
import { useTheme } from '../theme';
import { springs } from '../tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTION_WIDTH = 72;
const SWIPE_THRESHOLD = ACTION_WIDTH * 0.6;
const FULL_SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;

export type SwipeActionColor = 'error' | 'warning' | 'success' | 'primary' | 'secondary';

export interface SwipeAction {
  /** Icona azione */
  icon: IconName;
  /** Label opzionale */
  label?: string;
  /** Colore sfondo */
  color: SwipeActionColor;
  /** Callback azione */
  onPress: () => void;
  /** Abilita full swipe per eseguire automaticamente */
  fullSwipe?: boolean;
}

export interface SwipeableRowProps {
  /** Azioni a sinistra (swipe verso destra) */
  leftActions?: SwipeAction[];
  /** Azioni a destra (swipe verso sinistra) */
  rightActions?: SwipeAction[];
  /** Abilita swipe completo per prima azione */
  enableFullSwipe?: boolean;
  /** Callback quando lo swipe e' aperto */
  onSwipeOpen?: (direction: 'left' | 'right') => void;
  /** Callback quando lo swipe e' chiuso */
  onSwipeClose?: () => void;
  children: React.ReactNode;
}

/**
 * SwipeableRow Component
 * Riga con azioni reveal su swipe
 */
export function SwipeableRow({
  leftActions = [],
  rightActions = [],
  enableFullSwipe = true,
  onSwipeOpen,
  onSwipeClose,
  children,
}: SwipeableRowProps): JSX.Element {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const isOpen = useSharedValue(false);

  const maxLeftSwipe = leftActions.length * ACTION_WIDTH;
  const maxRightSwipe = rightActions.length * ACTION_WIDTH;

  // Get background color for action
  const getActionColor = (color: SwipeActionColor): string => {
    const colorMap: Record<SwipeActionColor, string> = {
      error: theme.colors.error,
      warning: theme.colors.warning,
      success: theme.colors.success,
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
    };
    return colorMap[color];
  };

  // Handle action press
  const handleActionPress = useCallback(
    (action: SwipeAction) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      translateX.value = withSpring(0, springs.stiff);
      isOpen.value = false;
      action.onPress();
    },
    [translateX, isOpen]
  );

  // Handle full swipe
  const handleFullSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const actions = direction === 'left' ? rightActions : leftActions;
      const fullSwipeAction = actions.find((a) => a.fullSwipe);

      if (fullSwipeAction && enableFullSwipe) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        fullSwipeAction.onPress();
        translateX.value = withSpring(0, springs.stiff);
        isOpen.value = false;
      }
    },
    [leftActions, rightActions, enableFullSwipe, translateX, isOpen]
  );

  // Pan gesture
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      const newValue = event.translationX + (isOpen.value ? translateX.value : 0);
      translateX.value = Math.max(
        -maxRightSwipe - 20, // Allow slight overshoot
        Math.min(maxLeftSwipe + 20, newValue)
      );
    })
    .onEnd((event) => {
      const velocity = event.velocityX;

      // Check for full swipe
      if (enableFullSwipe) {
        if (translateX.value > FULL_SWIPE_THRESHOLD && leftActions[0]?.fullSwipe) {
          translateX.value = withSpring(SCREEN_WIDTH, springs.stiff);
          runOnJS(handleFullSwipe)('right');
          return;
        }
        if (translateX.value < -FULL_SWIPE_THRESHOLD && rightActions[0]?.fullSwipe) {
          translateX.value = withSpring(-SCREEN_WIDTH, springs.stiff);
          runOnJS(handleFullSwipe)('left');
          return;
        }
      }

      // Snap to open or closed
      if (translateX.value > SWIPE_THRESHOLD || velocity > 500) {
        if (leftActions.length > 0) {
          translateX.value = withSpring(maxLeftSwipe, springs.stiff);
          isOpen.value = true;
          if (onSwipeOpen) runOnJS(onSwipeOpen)('left');
        } else {
          translateX.value = withSpring(0, springs.stiff);
        }
      } else if (translateX.value < -SWIPE_THRESHOLD || velocity < -500) {
        if (rightActions.length > 0) {
          translateX.value = withSpring(-maxRightSwipe, springs.stiff);
          isOpen.value = true;
          if (onSwipeOpen) runOnJS(onSwipeOpen)('right');
        } else {
          translateX.value = withSpring(0, springs.stiff);
        }
      } else {
        translateX.value = withSpring(0, springs.stiff);
        if (isOpen.value) {
          isOpen.value = false;
          if (onSwipeClose) runOnJS(onSwipeClose)();
        }
      }

      // Haptic on threshold
      if (
        Math.abs(translateX.value) > SWIPE_THRESHOLD &&
        Math.abs(event.translationX) > SWIPE_THRESHOLD
      ) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    });

  // Row animation style
  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Render action button
  const renderAction = (action: SwipeAction, index: number, side: 'left' | 'right') => {
    const actionStyle = useAnimatedStyle(() => {
      const progress = side === 'left'
        ? interpolate(translateX.value, [0, maxLeftSwipe], [0, 1], Extrapolate.CLAMP)
        : interpolate(translateX.value, [-maxRightSwipe, 0], [1, 0], Extrapolate.CLAMP);

      return {
        opacity: progress,
        transform: [{ scale: interpolate(progress, [0, 1], [0.8, 1]) }],
      };
    });

    return (
      <AnimatedPressable
        key={`${side}-${index}`}
        onPress={() => handleActionPress(action)}
        haptic="medium"
        style={[
          styles.action,
          { backgroundColor: getActionColor(action.color), width: ACTION_WIDTH },
        ]}
      >
        <Animated.View style={[styles.actionContent, actionStyle]}>
          <Icon name={action.icon} color="onPrimary" size="md" />
          {action.label && (
            <Text variant="caption" color="onPrimary" style={styles.actionLabel}>
              {action.label}
            </Text>
          )}
        </Animated.View>
      </AnimatedPressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Left actions (revealed on right swipe) */}
      {leftActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.leftActions]}>
          {leftActions.map((action, index) => renderAction(action, index, 'left'))}
        </View>
      )}

      {/* Right actions (revealed on left swipe) */}
      {rightActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.rightActions]}>
          {rightActions.map((action, index) => renderAction(action, index, 'right'))}
        </View>
      )}

      {/* Main content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, rowStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    backgroundColor: 'transparent',
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  leftActions: {
    left: 0,
  },
  rightActions: {
    right: 0,
  },
  action: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    alignItems: 'center',
  },
  actionLabel: {
    marginTop: 4,
  },
});

export default SwipeableRow;
