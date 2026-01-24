/**
 * Animation Tokens
 * Configurazioni per animazioni Apple-style
 */

import { WithSpringConfig, WithTimingConfig, Easing } from 'react-native-reanimated';

/**
 * Spring configurations for react-native-reanimated
 */
export const springs = {
  /** Standard iOS spring - balanced and smooth */
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  /** Bouncy spring - for playful feedback */
  bouncy: {
    damping: 10,
    stiffness: 180,
    mass: 0.8,
  },
  /** Gentle spring - for slow transitions */
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
  /** Stiff spring - for quick feedback */
  stiff: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
  /** Sheet spring - for bottom sheets */
  sheet: {
    damping: 50,
    stiffness: 500,
    mass: 1,
  },
  /** Snappy - very responsive */
  snappy: {
    damping: 15,
    stiffness: 400,
    mass: 0.6,
  },
} as const satisfies Record<string, WithSpringConfig>;

export type SpringConfig = keyof typeof springs;

/**
 * Timing durations in milliseconds
 */
export const timings = {
  /** 100ms - Very fast micro-interactions */
  instant: 100,
  /** 150ms - Fast feedback */
  fast: 150,
  /** 250ms - Normal transitions */
  normal: 250,
  /** 350ms - Deliberate transitions */
  medium: 350,
  /** 500ms - Slow, emphasized transitions */
  slow: 500,
} as const;

export type TimingDuration = keyof typeof timings;

/**
 * Stagger delays for list animations
 */
export const stagger = {
  /** 30ms - Fast stagger */
  fast: 30,
  /** 50ms - Normal stagger */
  normal: 50,
  /** 80ms - Slow stagger */
  slow: 80,
} as const;

export type StaggerDelay = keyof typeof stagger;

/**
 * Scale values for press animations
 */
export const pressScale = {
  /** 0.99 - Subtle press */
  subtle: 0.99,
  /** 0.97 - Normal press (default) */
  normal: 0.97,
  /** 0.95 - Pronounced press */
  pronounced: 0.95,
  /** 0.92 - Heavy press */
  heavy: 0.92,
} as const;

export type PressScale = keyof typeof pressScale;

/**
 * Common animation presets
 */
export const animationPresets = {
  /** Fade in from bottom - for list items */
  fadeInUp: {
    from: { opacity: 0, translateY: 20 },
    to: { opacity: 1, translateY: 0 },
  },
  /** Fade in from top - for dropdowns */
  fadeInDown: {
    from: { opacity: 0, translateY: -20 },
    to: { opacity: 1, translateY: 0 },
  },
  /** Scale in - for modals/popovers */
  scaleIn: {
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
  },
  /** Slide in from right - for navigation */
  slideInRight: {
    from: { translateX: 100, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
  },
  /** Slide in from bottom - for sheets */
  slideInBottom: {
    from: { translateY: 100 },
    to: { translateY: 0 },
  },
} as const;

export type AnimationPreset = keyof typeof animationPresets;

/**
 * Easing curves for timing animations
 */
export const easings = {
  /** Standard easing - for most transitions */
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  /** Decelerate - for entering elements */
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  /** Accelerate - for exiting elements */
  accelerate: Easing.bezier(0.4, 0, 1, 1),
  /** Sharp - for quick transitions */
  sharp: Easing.bezier(0.4, 0, 0.6, 1),
  /** Linear */
  linear: Easing.linear,
} as const;

export type EasingType = keyof typeof easings;
