/**
 * ID Generation Utilities
 */

/**
 * Generate a unique ID (UUID v4 compatible with React Native)
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a short ID (first 8 characters of UUID)
 */
export function generateShortId(): string {
  return generateId().slice(0, 8);
}
