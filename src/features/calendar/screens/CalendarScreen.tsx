/**
 * CalendarScreen
 * Schermata principale del calendario - NO TAG NATIVI
 */

import React, { useState, useCallback } from 'react';
import { Screen, Box, Button, Icon } from '@shared/ui';
import { ScreenTitle } from '@shared/ui/molecules';
import {
  CalendarHeader,
  CalendarMonthView,
  EventForm,
} from '../components';
import { useCalendar } from '../hooks';
import { CalendarEvent, CreateEventPayload, UpdateEventPayload } from '../domain/types';
import { SpaceSelector, CreateSpaceModal, SpaceSettingsModal, PendingInvitesModal } from '@features/spaces';
import { Space } from '@features/spaces/domain/types';

export function CalendarScreen(): JSX.Element {
  const {
    allEvents,
    selectedDate,
    selectDate,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useCalendar();

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [showSpaceSettings, setShowSpaceSettings] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showInvites, setShowInvites] = useState(false);

  const handleOpenSpaceSettings = useCallback((space: Space) => {
    setSelectedSpace(space);
    setShowSpaceSettings(true);
  }, []);

  const handleCloseSpaceSettings = useCallback(() => {
    setShowSpaceSettings(false);
    setSelectedSpace(null);
  }, []);

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

  const handleCreateEvent = useCallback(
    async (payload: CreateEventPayload) => {
      const success = await createEvent(payload);
      return success;
    },
    [createEvent]
  );

  const handleUpdateEvent = useCallback(
    async (payload: UpdateEventPayload) => {
      const success = await updateEvent(payload);
      return success;
    },
    [updateEvent]
  );

  const handleDeleteEvent = useCallback(
    async (id: string) => {
      const success = await deleteEvent(id);
      return success;
    },
    [deleteEvent]
  );

  return (
    <Screen paddingHorizontal="none" paddingVertical="none">
      {/* Header with title and add button */}
      <Box paddingX="lg" paddingTop="lg">
        <ScreenTitle
          title="Calendario"
          topContent={
            <SpaceSelector
              onCreateSpace={() => setShowCreateSpace(true)}
              onOpenSettings={handleOpenSpaceSettings}
              onOpenInvites={() => setShowInvites(true)}
            />
          }
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

      {/* Calendar month view with events - takes all remaining space */}
      <Box flex={1} paddingX="md" paddingBottom="md">
        <CalendarMonthView
          selectedDate={selectedDate}
          events={allEvents}
          onSelectDate={handleDateSelect}
          onEventPress={handleEventPress}
        />
      </Box>

      {/* Event form modal */}
      <EventForm
        visible={showEventForm}
        onClose={handleCloseForm}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        initialData={editingEvent}
        selectedDate={selectedDate}
      />

      {/* Create space modal */}
      <CreateSpaceModal
        visible={showCreateSpace}
        onClose={() => setShowCreateSpace(false)}
      />

      {/* Space settings modal */}
      <SpaceSettingsModal
        visible={showSpaceSettings}
        space={selectedSpace}
        onClose={handleCloseSpaceSettings}
      />

      {/* Pending invites modal */}
      <PendingInvitesModal
        visible={showInvites}
        onClose={() => setShowInvites(false)}
      />
    </Screen>
  );
}
