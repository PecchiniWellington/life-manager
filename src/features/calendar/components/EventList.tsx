/**
 * EventList Component
 * Lista eventi del giorno selezionato - NO TAG NATIVI
 */

import React from 'react';
import { Box, Text, VStack, Divider } from '@shared/ui';
import { EmptyState } from '@shared/ui/molecules';
import { CalendarEvent } from '../domain/types';
import { EventItem } from './EventItem';
import { formatRelativeDate, parseISO } from '@shared/lib/date';

interface EventListProps {
  events: CalendarEvent[];
  selectedDate: string;
  onEventPress: (event: CalendarEvent) => void;
  onAddEvent: () => void;
}

export function EventList({
  events,
  selectedDate,
  onEventPress,
  onAddEvent,
}: EventListProps): JSX.Element {
  const dateLabel = formatRelativeDate(selectedDate);

  return (
    <Box flex={1}>
      {/* Date header */}
      <Box paddingX="lg" paddingY="md">
        <Text variant="headingSmall" weight="semibold">
          {dateLabel}
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          {events.length === 0
            ? 'Nessun evento'
            : events.length === 1
            ? '1 evento'
            : `${events.length} eventi`}
        </Text>
      </Box>

      <Divider />

      {/* Events */}
      {events.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Nessun evento"
          description="Non ci sono eventi per questo giorno"
          actionLabel="Aggiungi evento"
          onAction={onAddEvent}
        />
      ) : (
        <VStack spacing="sm" padding="lg">
          {events.map((event) => (
            <EventItem key={event.id} event={event} onPress={onEventPress} />
          ))}
        </VStack>
      )}
    </Box>
  );
}
