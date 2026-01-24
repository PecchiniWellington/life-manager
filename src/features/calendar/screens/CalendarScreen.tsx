/**
 * CalendarScreen - Modern Design
 * Stile coerente con WalletScreen e TodosScreen
 * SCREEN: Usa solo atoms e molecules del design system
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Screen, Box, Icon, Text, AnimatedPressable } from '@shared/ui';
import {
  CalendarHeader,
  CalendarMonthView,
  EventForm,
} from '../components';
import { useCalendar } from '../hooks';
import { CalendarEvent, CreateEventPayload, UpdateEventPayload } from '../domain/types';
import { SpaceSelector, CreateSpaceModal, SpaceSettingsModal, PendingInvitesModal } from '@features/spaces';
import { Space } from '@features/spaces/domain/types';
import { parseISO, isSameDay, format } from 'date-fns';
import { it } from 'date-fns/locale';

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

  // Calculate stats for the current month
  const monthStats = useMemo(() => {
    const currentDate = parseISO(selectedDate);
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthEvents = allEvents.filter(event => {
      const eventDate = parseISO(event.startAt);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });

    const todayEvents = allEvents.filter(event =>
      isSameDay(parseISO(event.startAt), new Date())
    );

    const upcomingEvents = allEvents.filter(event => {
      const eventDate = parseISO(event.startAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today && eventDate <= monthEnd;
    });

    return {
      total: monthEvents.length,
      today: todayEvents.length,
      upcoming: upcomingEvents.length,
    };
  }, [allEvents, selectedDate]);

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
    <Screen paddingHorizontal="lg" paddingVertical="none">
      {/* Space Selector */}
      <SpaceSelector
        onCreateSpace={() => setShowCreateSpace(true)}
        onOpenSettings={handleOpenSpaceSettings}
        onOpenInvites={() => setShowInvites(true)}
      />

      {/* Stats Card with Add Button */}
      <Box
        borderRadius="xl"
        padding="md"
        backgroundColor="surface"
        borderWidth={1}
        borderColor="border"
        style={{ paddingTop: 20, marginTop: 12 }}
      >
        <Box gap="md">
          {/* Header row with date and add button */}
          <Box flexDirection="row" alignItems="flex-start" justifyContent="space-between">
            <Box>
              <Text variant="caption" color="textSecondary">
                Oggi
              </Text>
              <Text variant="headingLarge" weight="bold" color="textPrimary" style={{ fontSize: 28, letterSpacing: -0.5 }}>
                {format(new Date(), 'd MMMM', { locale: it })}
              </Text>
              <Text variant="caption" color="textTertiary">
                {monthStats.today > 0
                  ? `${monthStats.today} event${monthStats.today === 1 ? 'o' : 'i'} oggi`
                  : 'Nessun evento oggi'}
              </Text>
            </Box>
            <AnimatedPressable
              onPress={handleAddEvent}
              haptic="light"
              pressScale={0.95}
              accessibilityLabel="Aggiungi nuovo evento"
            >
              <Box
                width={44}
                height={44}
                borderRadius="lg"
                alignItems="center"
                justifyContent="center"
                style={{ backgroundColor: '#f59e0b' }}
              >
                <Icon name="add" size="md" color="onPrimary" />
              </Box>
            </AnimatedPressable>
          </Box>

          {/* Stats breakdown */}
          <Box flexDirection="row" gap="sm">
            <Box flex={1} padding="sm" borderRadius="lg" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <Box flexDirection="row" alignItems="center" gap="xs" marginBottom="xs">
                <Box width={8} height={8} borderRadius="full" style={{ backgroundColor: '#3b82f6' }} />
                <Text variant="caption" color="textSecondary">Questo mese</Text>
              </Box>
              <Text variant="bodyMedium" weight="bold" color="textPrimary">
                {monthStats.total}
              </Text>
            </Box>
            <Box flex={1} padding="sm" borderRadius="lg" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <Box flexDirection="row" alignItems="center" gap="xs" marginBottom="xs">
                <Box width={8} height={8} borderRadius="full" style={{ backgroundColor: '#f59e0b' }} />
                <Text variant="caption" color="textSecondary">Oggi</Text>
              </Box>
              <Text variant="bodyMedium" weight="bold" color="textPrimary">
                {monthStats.today}
              </Text>
            </Box>
            <Box flex={1} padding="sm" borderRadius="lg" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <Box flexDirection="row" alignItems="center" gap="xs" marginBottom="xs">
                <Box width={8} height={8} borderRadius="full" style={{ backgroundColor: '#22c55e' }} />
                <Text variant="caption" color="textSecondary">In arrivo</Text>
              </Box>
              <Text variant="bodyMedium" weight="bold" color="textPrimary">
                {monthStats.upcoming}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Calendar navigation */}
      <Box marginTop="md">
        <CalendarHeader
          selectedDate={selectedDate}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
        />
      </Box>

      {/* Calendar month view with events - takes all remaining space */}
      <Box flex={1} style={{ marginHorizontal: -16 }}>
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
