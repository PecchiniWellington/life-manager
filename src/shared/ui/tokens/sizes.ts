/**
 * Size Tokens
 * Dimensioni standard per componenti UI
 */

export const sizes = {
  // Input heights
  input: {
    sm: 36,
    md: 44,
    lg: 52,
  },

  // Input font sizes
  inputFontSize: {
    sm: 14,
    md: 16,
    lg: 18,
  },

  // Input padding
  inputPadding: {
    sm: 8,
    md: 12,
    lg: 16,
  },

  // Button heights
  button: {
    sm: 32,
    md: 44,
    lg: 52,
  },

  // Icon container sizes
  iconContainer: {
    xs: 20,
    sm: 32,
    md: 40,
    lg: 56,
  },

  // Badge sizes
  badge: {
    sm: 16,
    md: 20,
    lg: 24,
  },

  // Badge padding horizontal
  badgePaddingX: {
    sm: 4,
    md: 6,
    lg: 8,
  },

  // Badge dot sizes
  badgeDot: {
    sm: 6,
    md: 8,
    lg: 10,
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

  // Modal handle
  modalHandle: {
    width: 36,
    height: 4,
  },

  // Close button
  closeButton: 30,

  // Segmented control heights
  segmentedControl: {
    sm: 28,
    md: 32,
    lg: 40,
  },

  // Toggle switch
  toggle: {
    width: 44,
    height: 26,
    thumb: 22,
  },

  // Color picker dot
  colorPicker: 36,

  // Picker heights
  picker: {
    trigger: 44,
    content: 216,
  },

  // Alert font sizes
  alertFontSize: {
    title: 17,
    message: 13,
    button: 17,
  },
} as const;

export type SizeCategory = keyof typeof sizes;
