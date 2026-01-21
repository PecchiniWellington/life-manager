/**
 * Calendar Event Validation
 */

import { isBefore, parseISO } from 'date-fns';
import { CreateEventPayload, UpdateEventPayload, EventValidationErrors } from './types';

/**
 * Validate event creation payload
 */
export function validateCreateEvent(
  payload: CreateEventPayload
): EventValidationErrors | null {
  const errors: EventValidationErrors = {};

  // Title is required
  if (!payload.title || payload.title.trim().length === 0) {
    errors.title = 'Il titolo è obbligatorio';
  } else if (payload.title.length > 100) {
    errors.title = 'Il titolo non può superare 100 caratteri';
  }

  // Start date is required
  if (!payload.startAt) {
    errors.startAt = 'La data di inizio è obbligatoria';
  }

  // End date is required
  if (!payload.endAt) {
    errors.endAt = 'La data di fine è obbligatoria';
  }

  // End must be after start
  if (payload.startAt && payload.endAt) {
    const start = parseISO(payload.startAt);
    const end = parseISO(payload.endAt);

    if (isBefore(end, start)) {
      errors.endAt = 'La data di fine deve essere successiva alla data di inizio';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validate event update payload
 */
export function validateUpdateEvent(
  payload: UpdateEventPayload,
  existingEvent: { startAt: string; endAt: string }
): EventValidationErrors | null {
  const errors: EventValidationErrors = {};

  // Title validation (if provided)
  if (payload.title !== undefined) {
    if (payload.title.trim().length === 0) {
      errors.title = 'Il titolo è obbligatorio';
    } else if (payload.title.length > 100) {
      errors.title = 'Il titolo non può superare 100 caratteri';
    }
  }

  // Check date consistency
  const startAt = payload.startAt || existingEvent.startAt;
  const endAt = payload.endAt || existingEvent.endAt;

  const start = parseISO(startAt);
  const end = parseISO(endAt);

  if (isBefore(end, start)) {
    errors.endAt = 'La data di fine deve essere successiva alla data di inizio';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Check if event overlaps with existing events
 */
export function checkEventOverlap(
  newStart: string,
  newEnd: string,
  existingEvents: Array<{ startAt: string; endAt: string; id: string }>,
  excludeId?: string
): boolean {
  const start = parseISO(newStart);
  const end = parseISO(newEnd);

  return existingEvents.some((event) => {
    if (excludeId && event.id === excludeId) {
      return false;
    }

    const eventStart = parseISO(event.startAt);
    const eventEnd = parseISO(event.endAt);

    // Check if ranges overlap
    return start < eventEnd && end > eventStart;
  });
}
