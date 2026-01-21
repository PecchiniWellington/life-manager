/**
 * CalendarScreen
 * Schermata principale del calendario - NO TAG NATIVI
 */

import React, { useState, useCallback } from 'react';
import { Screen, Box, Divider, Button, Icon } from '@shared/ui';
import { ScreenTitle } from '@shared/ui/molecules';
import {
  CalendarHeader,
  CalendarGrid,
  EventList,
  EventForm,
} from '../components';
import { useCalendar } from '../hooks';
import { CalendarEvent, CreateEventPayload } from '../domain/types';

export function CalendarScreen(): JSX.Element {
  const {
    selectedDayEvents,
    selectedDate,
    eventCountsByDay,
    selectDate,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    createEvent,
  } = useCalendar();

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const handleDateSelect = useCallback(
    (date: string) => {
      selectDate(date);
    },
    [selectDate]
  );

  const handleEventPress = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  }, []);

  const handleAddEvent = useCallback(() => {
    setEditingEvent(null);
    setShowEventForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowEventForm(false);
    setEditingEvent(null);
  }, []);

  const handleSubmitEvent = useCallback(
    async (payload: CreateEventPayload) => {
      const success = await createEvent(payload);
      return success;
    },
    [createEvent]
  );

  return (
    <Screen scroll paddingHorizontal="none" paddingVertical="none">
      {/* Header with title and add button */}
      <Box paddingX="lg" paddingTop="lg">
        <ScreenTitle
          title="Calendario"
          rightAction={
            <Button
              title="Nuovo"
              size="sm"
              onPress={handleAddEvent}
              accessibilityLabel="Aggiungi nuovo evento"
              leftIcon={<Icon name="add" size="sm" color="onPrimary" />}
            />
          }
        />
      </Box>

      {/* Calendar navigation */}
      <Box paddingX="lg">
        <CalendarHeader
          selectedDate={selectedDate}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
        />
      </Box>

      {/* Calendar grid */}
      <Box paddingX="lg">
        <CalendarGrid
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
          eventCountsByDay={eventCountsByDay}
        />
      </Box>

      <Divider spacing="lg" />

      {/* Events list */}
      <EventList
        events={selectedDayEvents}
        selectedDate={selectedDate}
        onEventPress={handleEventPress}
        onAddEvent={handleAddEvent}
      />

      {/* Event form modal */}
      <EventForm
        visible={showEventForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitEvent}
        initialData={editingEvent}
        selectedDate={selectedDate}
      />
    </Screen>
  );
}
