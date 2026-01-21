/**
 * Calendar Hook
 * Custom hook per la gestione del calendario
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  loadEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  setSelectedDate,
  setViewMode,
  setSelectedEvent,
  clearError,
  selectAllEvents,
  selectEventsForSelectedDay,
  selectSelectedDate,
  selectViewMode,
  selectSelectedEvent,
  selectIsCalendarLoading,
  selectCalendarError,
  selectEventCountsByDay,
} from '../store';
import { CreateEventPayload, UpdateEventPayload, CalendarViewMode } from '../domain/types';
import { addMonths, subMonths, addDays, subDays } from 'date-fns';

/**
 * useCalendar hook
 */
export function useCalendar() {
  const dispatch = useAppDispatch();

  // Selectors
  const allEvents = useAppSelector(selectAllEvents);
  const selectedDayEvents = useAppSelector(selectEventsForSelectedDay);
  const selectedDate = useAppSelector(selectSelectedDate);
  const viewMode = useAppSelector(selectViewMode);
  const selectedEvent = useAppSelector(selectSelectedEvent);
  const isLoading = useAppSelector(selectIsCalendarLoading);
  const error = useAppSelector(selectCalendarError);
  const eventCountsByDay = useAppSelector(selectEventCountsByDay);

  // Load events on mount
  useEffect(() => {
    dispatch(loadEvents());
  }, [dispatch]);

  // Actions
  const handleCreateEvent = useCallback(
    async (payload: CreateEventPayload) => {
      const result = await dispatch(createEvent(payload));
      return createEvent.fulfilled.match(result);
    },
    [dispatch]
  );

  const handleUpdateEvent = useCallback(
    async (payload: UpdateEventPayload) => {
      const result = await dispatch(updateEvent(payload));
      return updateEvent.fulfilled.match(result);
    },
    [dispatch]
  );

  const handleDeleteEvent = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteEvent(id));
      return deleteEvent.fulfilled.match(result);
    },
    [dispatch]
  );

  const handleSelectDate = useCallback(
    (date: string) => {
      dispatch(setSelectedDate(date));
    },
    [dispatch]
  );

  const handleSetViewMode = useCallback(
    (mode: CalendarViewMode) => {
      dispatch(setViewMode(mode));
    },
    [dispatch]
  );

  const handleSelectEvent = useCallback(
    (eventId: string | null) => {
      dispatch(setSelectedEvent(eventId));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigation
  const goToNextMonth = useCallback(() => {
    const current = new Date(selectedDate);
    const next = addMonths(current, 1);
    dispatch(setSelectedDate(next.toISOString()));
  }, [dispatch, selectedDate]);

  const goToPrevMonth = useCallback(() => {
    const current = new Date(selectedDate);
    const prev = subMonths(current, 1);
    dispatch(setSelectedDate(prev.toISOString()));
  }, [dispatch, selectedDate]);

  const goToNextDay = useCallback(() => {
    const current = new Date(selectedDate);
    const next = addDays(current, 1);
    dispatch(setSelectedDate(next.toISOString()));
  }, [dispatch, selectedDate]);

  const goToPrevDay = useCallback(() => {
    const current = new Date(selectedDate);
    const prev = subDays(current, 1);
    dispatch(setSelectedDate(prev.toISOString()));
  }, [dispatch, selectedDate]);

  const goToToday = useCallback(() => {
    dispatch(setSelectedDate(new Date().toISOString()));
  }, [dispatch]);

  return {
    // State
    allEvents,
    selectedDayEvents,
    selectedDate,
    viewMode,
    selectedEvent,
    isLoading,
    error,
    eventCountsByDay,

    // Actions
    createEvent: handleCreateEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
    selectDate: handleSelectDate,
    setViewMode: handleSetViewMode,
    selectEvent: handleSelectEvent,
    clearError: handleClearError,

    // Navigation
    goToNextMonth,
    goToPrevMonth,
    goToNextDay,
    goToPrevDay,
    goToToday,
  };
}
