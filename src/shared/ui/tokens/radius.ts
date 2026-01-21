/**
 * Border Radius Tokens
 */

export const radius = {
  /** 0px - No radius */
  none: 0,
  /** 2px */
  xs: 2,
  /** 4px */
  sm: 4,
  /** 8px */
  md: 8,
  /** 12px */
  lg: 12,
  /** 16px */
  xl: 16,
  /** 20px */
  '2xl': 20,
  /** 24px */
  '3xl': 24,
  /** 32px */
  '4xl': 32,
  /** 9999px - Full/Pill shape */
  full: 9999,

  // Apple-style semantic radius
  /** 16px - Standard card radius */
  card: 16,
  /** 20px - Bottom sheet top corners */
  sheet: 20,
  /** 12px - Rounded button */
  button: 12,
  /** 10px - Text fields */
  input: 10,
  /** 8px - Segmented control */
  segmented: 8,
} as const;

export type RadiusKey = keyof typeof radius;
export type RadiusValue = (typeof radius)[RadiusKey];
