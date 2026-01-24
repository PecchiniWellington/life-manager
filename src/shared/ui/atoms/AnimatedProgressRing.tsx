/**
 * AnimatedProgressRing Atom
 * Cerchio di progresso animato Apple-style
 *
 * ATOM: usa solo View native - implementazione semplificata e stabile
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { SemanticColorKey, easings, overlay } from '../tokens';

export type ProgressRingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AnimatedProgressRingProps {
  /** Valore progresso (0-100) */
  progress: number;
  /** Dimensione del ring */
  size?: ProgressRingSize;
  /** Spessore del ring */
  strokeWidth?: number;
  /** Colore del progresso */
  color?: SemanticColorKey;
  /** Colore sfondo ring */
  trackColor?: SemanticColorKey;
  /** Durata animazione in ms */
  duration?: number;
  /** Usa spring animation */
  spring?: boolean;
  /** Contenuto centrale */
  children?: React.ReactNode;
  /** Test ID */
  testID?: string;
}

const sizeConfig: Record<ProgressRingSize, { diameter: number; stroke: number }> = {
  sm: { diameter: 48, stroke: 4 },
  md: { diameter: 80, stroke: 6 },
  lg: { diameter: 120, stroke: 8 },
  xl: { diameter: 160, stroke: 10 },
};

/**
 * Progress ring implementato come barra circolare
 * Usa una singola View animata con borderWidth per simulare il progress
 */
export function AnimatedProgressRing({
  progress,
  size = 'md',
  strokeWidth,
  color = 'primary',
  trackColor = 'border',
  duration = 800,
  spring = true,
  children,
  testID,
}: AnimatedProgressRingProps): JSX.Element {
  const theme = useTheme();
  const config = sizeConfig[size];
  const stroke = strokeWidth ?? config.stroke;
  const diameter = config.diameter;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    if (spring) {
      animatedProgress.value = withSpring(clampedProgress, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      animatedProgress.value = withTiming(clampedProgress, {
        duration,
        easing: easings.standard,
      });
    }
  }, [progress, spring, duration]);

  // Animated rotation for the progress indicator
  const progressStyle = useAnimatedStyle(() => {
    // Map progress to rotation (0-100 -> 0-360)
    const rotation = (animatedProgress.value / 100) * 360;
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  // Opacity animation based on progress
  const opacityStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedProgress.value > 0 ? 1 : 0,
    };
  });

  const progressColor = theme.colors[color];
  const bgColor = theme.colors[trackColor];

  return (
    <View
      style={[styles.container, { width: diameter, height: diameter }]}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: progress }}
    >
      {/* Background track circle */}
      <View
        style={[
          styles.track,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            borderWidth: stroke,
            borderColor: bgColor,
          },
        ]}
      />

      {/* Progress indicator - simplified approach using conic style simulation */}
      <Animated.View
        style={[
          styles.progressContainer,
          {
            width: diameter,
            height: diameter,
          },
          progressStyle,
          opacityStyle,
        ]}
      >
        {/* Top indicator dot that rotates */}
        <View
          style={[
            styles.indicator,
            {
              width: stroke * 2.5,
              height: stroke * 2.5,
              borderRadius: stroke * 1.25,
              backgroundColor: progressColor,
              top: 0,
              left: diameter / 2 - stroke * 1.25,
            },
          ]}
        />
      </Animated.View>

      {/* Progress arc - multiple segments */}
      <View style={[styles.arcContainer, { width: diameter, height: diameter }]}>
        <ProgressArc
          progress={progress}
          diameter={diameter}
          stroke={stroke}
          color={progressColor}
          animatedValue={animatedProgress}
        />
      </View>

      {/* Center content */}
      {children && (
        <View style={styles.centerContent}>
          {children}
        </View>
      )}
    </View>
  );
}

// Simplified progress arc using animated width
interface ProgressArcProps {
  progress: number;
  diameter: number;
  stroke: number;
  color: string;
  animatedValue: Animated.SharedValue<number>;
}

function ProgressArc({ diameter, stroke, color, animatedValue }: ProgressArcProps) {
  const animatedStyle = useAnimatedStyle(() => {
    // Simple linear bar to show progress (fallback visual)
    const width = (animatedValue.value / 100) * (diameter - stroke * 2);
    return {
      width: Math.max(0, width),
    };
  });

  return (
    <View style={[styles.linearTrack, {
      width: diameter - stroke * 2,
      height: stroke,
      borderRadius: stroke / 2,
      backgroundColor: overlay.medium,
    }]}>
      <Animated.View
        style={[
          styles.linearProgress,
          {
            height: stroke,
            borderRadius: stroke / 2,
            backgroundColor: color,
          },
          animatedStyle
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    opacity: 0.2,
  },
  progressContainer: {
    position: 'absolute',
  },
  indicator: {
    position: 'absolute',
  },
  arcContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linearTrack: {
    overflow: 'hidden',
  },
  linearProgress: {
    position: 'absolute',
    left: 0,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
