/**
 * Calendar Domain Types
 */

import { EventColor } from '@shared/ui/tokens';

/**
 * Calendar Event entity
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startAt: string; // ISO date string
  endAt: string; // ISO date string
  color: EventColor;
  allDay: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Event creation payload (without generated fields)
 */
export interface CreateEventPayload {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  color?: EventColor;
  allDay?: boolean;
}

/**
 * Event update payload
 */
export interface UpdateEventPayload {
  id: string;
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  color?: EventColor;
  allDay?: boolean;
}

/**
 * Calendar view modes
 */
export type CalendarViewMode = 'day' | 'week' | 'month';

/**
 * Calendar filter state
 */
export interface CalendarFilter {
  viewMode: CalendarViewMode;
  selectedDate: string; // ISO date string
  colors?: EventColor[];
}

/**
 * Event validation errors
 */
export interface EventValidationErrors {
  title?: string;
  startAt?: string;
  endAt?: string;
  general?: string;
}
