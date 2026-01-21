/**
 * Calendar Repository
 * Layer di accesso ai dati per gli eventi del calendario
 */

import { getStorageItem, setStorageItem, StorageKey } from '@shared/lib/storage';
import { generateId } from '@shared/lib/id';
import { CalendarEvent, CreateEventPayload, UpdateEventPayload } from '../domain/types';

/**
 * Get all events from storage
 */
export async function getAllEvents(): Promise<CalendarEvent[]> {
  const events = await getStorageItem<CalendarEvent[]>(StorageKey.CALENDAR_EVENTS);
  return events || [];
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<CalendarEvent | null> {
  const events = await getAllEvents();
  return events.find((e) => e.id === id) || null;
}

/**
 * Create a new event
 */
export async function createEvent(payload: CreateEventPayload): Promise<CalendarEvent> {
  const events = await getAllEvents();
  const now = new Date().toISOString();

  const newEvent: CalendarEvent = {
    id: generateId(),
    title: payload.title,
    description: payload.description || '',
    startAt: payload.startAt,
    endAt: payload.endAt,
    color: payload.color || 'blue',
    allDay: payload.allDay || false,
    createdAt: now,
    updatedAt: now,
  };

  const updatedEvents = [...events, newEvent];
  await setStorageItem(StorageKey.CALENDAR_EVENTS, updatedEvents);

  return newEvent;
}

/**
 * Update an existing event
 */
export async function updateEvent(payload: UpdateEventPayload): Promise<CalendarEvent | null> {
  const events = await getAllEvents();
  const index = events.findIndex((e) => e.id === payload.id);

  if (index === -1) {
    return null;
  }

  const existingEvent = events[index];
  const updatedEvent: CalendarEvent = {
    ...existingEvent,
    ...(payload.title !== undefined && { title: payload.title }),
    ...(payload.description !== undefined && { description: payload.description }),
    ...(payload.startAt !== undefined && { startAt: payload.startAt }),
    ...(payload.endAt !== undefined && { endAt: payload.endAt }),
    ...(payload.color !== undefined && { color: payload.color }),
    ...(payload.allDay !== undefined && { allDay: payload.allDay }),
    updatedAt: new Date().toISOString(),
  };

  events[index] = updatedEvent;
  await setStorageItem(StorageKey.CALENDAR_EVENTS, events);

  return updatedEvent;
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<boolean> {
  const events = await getAllEvents();
  const filteredEvents = events.filter((e) => e.id !== id);

  if (filteredEvents.length === events.length) {
    return false; // Event not found
  }

  await setStorageItem(StorageKey.CALENDAR_EVENTS, filteredEvents);
  return true;
}

/**
 * Get events for a specific date range
 */
export async function getEventsInRange(
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const events = await getAllEvents();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return events.filter((event) => {
    const eventStart = new Date(event.startAt);
    const eventEnd = new Date(event.endAt);

    // Event overlaps with range if it starts before range ends and ends after range starts
    return eventStart <= end && eventEnd >= start;
  });
}
