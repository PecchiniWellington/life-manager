/**
 * Date Utilities
 * Funzioni helper per la gestione delle date usando date-fns
 */

import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isToday,
  isBefore,
  isAfter,
  isWithinInterval,
  differenceInDays,
  differenceInMinutes,
  eachDayOfInterval,
  getDay,
  setDay,
} from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Default locale
 */
const defaultLocale = it;

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  formatString: string = 'dd MMM yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString, { locale: defaultLocale });
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm', { locale: defaultLocale });
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd MMM yyyy, HH:mm', { locale: defaultLocale });
}

/**
 * Format relative date (oggi, domani, etc.)
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();

  if (isSameDay(dateObj, today)) {
    return 'Oggi';
  }

  if (isSameDay(dateObj, addDays(today, 1))) {
    return 'Domani';
  }

  if (isSameDay(dateObj, subDays(today, 1))) {
    return 'Ieri';
  }

  // Within this week
  if (isSameWeek(dateObj, today, { locale: defaultLocale })) {
    return format(dateObj, 'EEEE', { locale: defaultLocale });
  }

  // Within this year
  if (dateObj.getFullYear() === today.getFullYear()) {
    return format(dateObj, 'dd MMMM', { locale: defaultLocale });
  }

  return format(dateObj, 'dd MMM yyyy', { locale: defaultLocale });
}

/**
 * Get days of current month for calendar grid
 */
export function getCalendarDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), { locale: defaultLocale });
  const end = endOfWeek(endOfMonth(date), { locale: defaultLocale });

  return eachDayOfInterval({ start, end });
}

/**
 * Get week day names
 */
export function getWeekDayNames(short: boolean = true): string[] {
  const days: string[] = [];
  const baseDate = startOfWeek(new Date(), { locale: defaultLocale });

  for (let i = 0; i < 7; i++) {
    const day = addDays(baseDate, i);
    days.push(format(day, short ? 'EEE' : 'EEEE', { locale: defaultLocale }));
  }

  return days;
}

/**
 * Get month name
 */
export function getMonthName(date: Date, full: boolean = true): string {
  return format(date, full ? 'MMMM yyyy' : 'MMM yyyy', { locale: defaultLocale });
}

/**
 * Check if date is in current month
 */
export function isCurrentMonth(date: Date, referenceDate: Date): boolean {
  return isSameMonth(date, referenceDate);
}

/**
 * Parse ISO string to Date
 */
export function parseDate(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Convert Date to ISO string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Get start of day
 */
export function getDayStart(date: Date): Date {
  return startOfDay(date);
}

/**
 * Get end of day
 */
export function getDayEnd(date: Date): Date {
  return endOfDay(date);
}

/**
 * Navigation helpers
 */
export const navigate = {
  nextDay: (date: Date) => addDays(date, 1),
  prevDay: (date: Date) => subDays(date, 1),
  nextWeek: (date: Date) => addWeeks(date, 1),
  prevWeek: (date: Date) => subWeeks(date, 1),
  nextMonth: (date: Date) => addMonths(date, 1),
  prevMonth: (date: Date) => subMonths(date, 1),
};

/**
 * Check if a date is within a range
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return isWithinInterval(date, { start, end });
}

/**
 * Get duration in minutes
 */
export function getDurationMinutes(start: Date, end: Date): number {
  return Math.abs(differenceInMinutes(end, start));
}

/**
 * Format duration
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}min`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
}

// Re-export useful date-fns functions
export {
  isToday,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isBefore,
  isAfter,
  addDays,
  addMonths,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  differenceInDays,
  parseISO,
};
