/**
 * Size Tokens
 * Dimensioni standard per componenti UI
 */

export const sizes = {
  // Input heights
  input: {
    sm: 36,
    md: 48,
    lg: 56,
  },

  // Button heights
  button: {
    sm: 32,
    md: 44,
    lg: 52,
  },

  // Icon container sizes
  iconContainer: {
    sm: 32,
    md: 44,
    lg: 56,
  },

  // Badge sizes
  badge: {
    sm: 16,
    md: 18,
    lg: 24,
  },

  // Touch targets (minimum 44pt for accessibility)
  touchTarget: {
    min: 44,
    comfortable: 48,
  },

  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },

  // Day number in calendar
  dayNumber: 26,

  // Swipe action width
  swipeAction: 80,

  // Progress indicators
  progressBar: 8,
  progressRing: {
    sm: 40,
    md: 60,
    lg: 80,
  },
} as const;

export type SizeCategory = keyof typeof sizes;
