/**
 * Calendar Selectors
 * Selectors memoizzati per lo stato del calendario
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@app/store';
import { CalendarEvent } from '../domain/types';
import {
  isSameDay,
  isSameMonth,
  isSameWeek,
  parseISO,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Base selectors
 */
const selectCalendarState = (state: RootState) => state.calendar;

export const selectAllEventIds = (state: RootState) => state.calendar.ids;
export const selectEventEntities = (state: RootState) => state.calendar.entities;
export const selectSelectedDate = (state: RootState) => state.calendar.selectedDate;
export const selectViewMode = (state: RootState) => state.calendar.viewMode;
export const selectSelectedEventId = (state: RootState) => state.calendar.selectedEventId;
export const selectCalendarStatus = (state: RootState) => state.calendar.status;
export const selectCalendarError = (state: RootState) => state.calendar.error;

/**
 * Select all events as array
 */
export const selectAllEvents = createSelector(
  [selectAllEventIds, selectEventEntities],
  (ids, entities): CalendarEvent[] => ids.map((id) => entities[id])
);

/**
 * Select event by ID
 */
export const selectEventById = (id: string) =>
  createSelector([selectEventEntities], (entities) => entities[id] || null);

/**
 * Select selected event
 */
export const selectSelectedEvent = createSelector(
  [selectSelectedEventId, selectEventEntities],
  (selectedId, entities): CalendarEvent | null =>
    selectedId ? entities[selectedId] || null : null
);

/**
 * Select events for a specific day
 */
export const selectEventsForDay = (dateString: string) =>
  createSelector([selectAllEvents], (events): CalendarEvent[] => {
    const date = parseISO(dateString);
    return events
      .filter((event) => {
        const eventStart = parseISO(event.startAt);
        const eventEnd = parseISO(event.endAt);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        // Event overlaps with day
        return eventStart <= dayEnd && eventEnd >= dayStart;
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  });

/**
 * Select events for selected day
 */
export const selectEventsForSelectedDay = createSelector(
  [selectAllEvents, selectSelectedDate],
  (events, selectedDate): CalendarEvent[] => {
    const date = parseISO(selectedDate);
    return events
      .filter((event) => {
        const eventStart = parseISO(event.startAt);
        const eventEnd = parseISO(event.endAt);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        return eventStart <= dayEnd && eventEnd >= dayStart;
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }
);

/**
 * Select events for a specific month
 */
export const selectEventsForMonth = (dateString: string) =>
  createSelector([selectAllEvents], (events): CalendarEvent[] => {
    const date = parseISO(dateString);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    return events.filter((event) => {
      const eventStart = parseISO(event.startAt);
      const eventEnd = parseISO(event.endAt);

      return eventStart <= monthEnd && eventEnd >= monthStart;
    });
  });

/**
 * Select events for selected month
 */
export const selectEventsForSelectedMonth = createSelector(
  [selectAllEvents, selectSelectedDate],
  (events, selectedDate): CalendarEvent[] => {
    const date = parseISO(selectedDate);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    return events.filter((event) => {
      const eventStart = parseISO(event.startAt);
      const eventEnd = parseISO(event.endAt);

      return eventStart <= monthEnd && eventEnd >= monthStart;
    });
  }
);

/**
 * Select event counts by day for current month
 * Returns a map of date string (YYYY-MM-DD) to event count
 */
export const selectEventCountsByDay = createSelector(
  [selectEventsForSelectedMonth, selectSelectedDate],
  (events, selectedDate): Record<string, number> => {
    const counts: Record<string, number> = {};

    events.forEach((event) => {
      const eventDate = parseISO(event.startAt);
      const dateKey = eventDate.toISOString().split('T')[0];

      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });

    return counts;
  }
);

/**
 * Check if calendar is loading
 */
export const selectIsCalendarLoading = createSelector(
  [selectCalendarStatus],
  (status) => status === 'loading'
);

/**
 * Check if calendar has loaded successfully
 */
export const selectIsCalendarLoaded = createSelector(
  [selectCalendarStatus],
  (status) => status === 'succeeded'
);
