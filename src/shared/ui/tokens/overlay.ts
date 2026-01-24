/**
 * Overlay Tokens
 * Colori per overlay, backdrop e trasparenze
 */

export const overlay = {
  /** Light overlay - 10% opacity */
  light: 'rgba(0, 0, 0, 0.1)',
  /** Medium overlay - 30% opacity */
  medium: 'rgba(0, 0, 0, 0.3)',
  /** Backdrop for modals - 40% opacity */
  backdrop: 'rgba(0, 0, 0, 0.4)',
  /** Heavy overlay - 50% opacity */
  heavy: 'rgba(0, 0, 0, 0.5)',
  /** Dark overlay - 70% opacity */
  dark: 'rgba(0, 0, 0, 0.7)',
} as const;

export type OverlayType = keyof typeof overlay;

/**
 * Transparent backgrounds for cards/sections
 */
export const transparentBg = {
  /** Very subtle background */
  subtle: 'rgba(0, 0, 0, 0.03)',
  /** Light background */
  light: 'rgba(0, 0, 0, 0.04)',
  /** Medium background */
  medium: 'rgba(0, 0, 0, 0.06)',
  /** Primary tint light */
  primaryLight: 'rgba(59, 130, 246, 0.1)',
  /** Primary tint medium */
  primaryMedium: 'rgba(59, 130, 246, 0.15)',
} as const;

export type TransparentBgType = keyof typeof transparentBg;
