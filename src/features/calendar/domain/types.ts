/**
 * Calendar Domain Types
 */

import { EventColor } from '@shared/ui/tokens';

/**
 * Reminder time options
 */
export type ReminderTime =
  | 'at_time'        // Al momento dell'evento
  | '5_min'          // 5 minuti prima
  | '10_min'         // 10 minuti prima
  | '15_min'         // 15 minuti prima
  | '30_min'         // 30 minuti prima
  | '1_hour'         // 1 ora prima
  | '2_hours'        // 2 ore prima
  | '1_day'          // 1 giorno prima
  | '2_days'         // 2 giorni prima
  | '1_week';        // 1 settimana prima

export const reminderTimeLabels: Record<ReminderTime, string> = {
  at_time: "All'ora dell'evento",
  '5_min': '5 minuti prima',
  '10_min': '10 minuti prima',
  '15_min': '15 minuti prima',
  '30_min': '30 minuti prima',
  '1_hour': '1 ora prima',
  '2_hours': '2 ore prima',
  '1_day': '1 giorno prima',
  '2_days': '2 giorni prima',
  '1_week': '1 settimana prima',
};

/**
 * Recurrence frequency
 */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const recurrenceFrequencyLabels: Record<RecurrenceFrequency, string> = {
  daily: 'Ogni giorno',
  weekly: 'Ogni settimana',
  monthly: 'Ogni mese',
  yearly: 'Ogni anno',
};

/**
 * Recurrence rule
 */
export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // es. ogni 2 settimane
  endDate?: string; // ISO date string - quando finisce la ricorrenza
  count?: number; // numero di occorrenze
  daysOfWeek?: number[]; // 0-6 (domenica-sabato) per ricorrenze settimanali
}

/**
 * Checklist item for event
 */
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

/**
 * Calendar Event entity
 */
export interface CalendarEvent {
  id: string;
  spaceId: string; // Space a cui appartiene l'evento
  title: string;
  description: string;
  startAt: string; // ISO date string
  endAt: string; // ISO date string
  color: EventColor;
  allDay: boolean;
  // Nuovi campi TimeTree-style
  isFloating?: boolean; // Evento senza data specifica
  location?: string;
  url?: string;
  notes?: string;
  checklist?: ChecklistItem[];
  reminders?: ReminderTime[];
  recurrence?: RecurrenceRule;
  // Metadata
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
  isFloating?: boolean;
  location?: string;
  url?: string;
  notes?: string;
  checklist?: ChecklistItem[];
  reminders?: ReminderTime[];
  recurrence?: RecurrenceRule;
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
  isFloating?: boolean;
  location?: string;
  url?: string;
  notes?: string;
  checklist?: ChecklistItem[];
  reminders?: ReminderTime[];
  recurrence?: RecurrenceRule;
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
