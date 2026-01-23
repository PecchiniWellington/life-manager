/**
 * Calendar Events Firestore Service
 * Persiste gli eventi nella subcollection spaces/{spaceId}/events
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { CalendarEvent, CreateEventPayload, UpdateEventPayload } from '../domain/types';

/**
 * Get the events collection for a specific space
 */
function getEventsCollection(spaceId: string) {
  return firestore().collection('spaces').doc(spaceId).collection('events');
}

/**
 * Get all events for a space
 */
export async function getEvents(spaceId: string): Promise<CalendarEvent[]> {
  const snapshot = await getEventsCollection(spaceId).orderBy('startAt', 'asc').get();

  const events: CalendarEvent[] = [];
  snapshot.forEach(doc => {
    events.push({
      id: doc.id,
      ...doc.data(),
    } as CalendarEvent);
  });

  return events;
}

/**
 * Get a single event by ID
 */
export async function getEventById(spaceId: string, eventId: string): Promise<CalendarEvent | null> {
  const doc = await getEventsCollection(spaceId).doc(eventId).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as CalendarEvent;
}

/**
 * Create a new event
 */
export async function createEvent(spaceId: string, payload: CreateEventPayload): Promise<CalendarEvent> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const now = new Date().toISOString();

  // Firestore non accetta undefined, quindi usiamo solo i campi definiti
  const eventData: Record<string, unknown> = {
    spaceId,
    title: payload.title,
    description: payload.description || '',
    startAt: payload.startAt,
    endAt: payload.endAt,
    color: payload.color || 'blue',
    allDay: payload.allDay || false,
    createdBy: currentUser.uid,
    createdAt: now,
    updatedAt: now,
  };

  // Aggiungi solo i campi opzionali se definiti
  if (payload.isFloating !== undefined) eventData.isFloating = payload.isFloating;
  if (payload.location !== undefined) eventData.location = payload.location;
  if (payload.url !== undefined) eventData.url = payload.url;
  if (payload.notes !== undefined) eventData.notes = payload.notes;
  if (payload.checklist !== undefined) eventData.checklist = payload.checklist;
  if (payload.reminders !== undefined) eventData.reminders = payload.reminders;
  if (payload.recurrence !== undefined) eventData.recurrence = payload.recurrence;

  const docRef = await getEventsCollection(spaceId).add(eventData);

  return {
    id: docRef.id,
    ...eventData,
  } as CalendarEvent;
}

/**
 * Update an event
 */
export async function updateEvent(spaceId: string, payload: UpdateEventPayload): Promise<CalendarEvent | null> {
  const eventRef = getEventsCollection(spaceId).doc(payload.id);
  const doc = await eventRef.get();

  if (!doc.exists) return null;

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.startAt !== undefined) updates.startAt = payload.startAt;
  if (payload.endAt !== undefined) updates.endAt = payload.endAt;
  if (payload.color !== undefined) updates.color = payload.color;
  if (payload.allDay !== undefined) updates.allDay = payload.allDay;
  if (payload.isFloating !== undefined) updates.isFloating = payload.isFloating;
  if (payload.location !== undefined) updates.location = payload.location;
  if (payload.url !== undefined) updates.url = payload.url;
  if (payload.notes !== undefined) updates.notes = payload.notes;
  if (payload.checklist !== undefined) updates.checklist = payload.checklist;
  if (payload.reminders !== undefined) updates.reminders = payload.reminders;
  if (payload.recurrence !== undefined) updates.recurrence = payload.recurrence;

  await eventRef.update(updates);

  const updatedDoc = await eventRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as CalendarEvent;
}

/**
 * Delete an event
 */
export async function deleteEvent(spaceId: string, eventId: string): Promise<boolean> {
  const eventRef = getEventsCollection(spaceId).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists) return false;

  await eventRef.delete();
  return true;
}

/**
 * Get events for a specific date range
 */
export async function getEventsInRange(
  spaceId: string,
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  // Firestore query con compound filter
  const snapshot = await getEventsCollection(spaceId)
    .where('startAt', '<=', endDate)
    .orderBy('startAt', 'asc')
    .get();

  const events: CalendarEvent[] = [];
  const start = new Date(startDate);

  snapshot.forEach(doc => {
    const data = doc.data();
    const eventEnd = new Date(data.endAt);
    // Filter client-side for events that end after start date
    if (eventEnd >= start) {
      events.push({
        id: doc.id,
        ...data,
      } as CalendarEvent);
    }
  });

  return events;
}

/**
 * Real-time listener for events in a space
 */
export function onEventsChanged(
  spaceId: string,
  callback: (events: CalendarEvent[]) => void
): () => void {
  return getEventsCollection(spaceId)
    .orderBy('startAt', 'asc')
    .onSnapshot(snapshot => {
      const events: CalendarEvent[] = [];
      snapshot.forEach(doc => {
        events.push({
          id: doc.id,
          ...doc.data(),
        } as CalendarEvent);
      });
      callback(events);
    }, error => {
      console.error('Error listening to events:', error);
      callback([]);
    });
}

/**
 * Batch delete all events in a space (used when deleting a space)
 */
export async function deleteAllEventsInSpace(spaceId: string): Promise<void> {
  const snapshot = await getEventsCollection(spaceId).get();

  if (snapshot.empty) return;

  const batch = firestore().batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
