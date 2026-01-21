/**
 * Formatting Utilities
 */

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'it-IT'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format number
 */
export function formatNumber(
  value: number,
  locale: string = 'it-IT',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize each word
 */
export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(capitalize)
    .join(' ');
}
