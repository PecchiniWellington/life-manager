/**
 * EventItem Component - Modern Design
 * Singolo evento nella lista - Stile coerente con TransactionItem
 * FEATURE COMPONENT: Usa solo atoms e molecules del design system
 */

import React, { useCallback } from 'react';
import {
  Box,
  Text,
  Icon,
  AnimatedPressable,
  SwipeableRow,
  type SwipeAction,
} from '@shared/ui';
import { eventColors } from '@shared/ui/tokens';
import { CalendarEvent } from '../domain/types';
import { formatTime } from '@shared/lib/date';

interface EventItemProps {
  /** Evento da visualizzare */
  event: CalendarEvent;
  /** Callback pressione */
  onPress: (event: CalendarEvent) => void;
  /** Callback eliminazione */
  onDelete?: (id: string) => void;
}

export function EventItem({
  event,
  onPress,
  onDelete,
}: EventItemProps): JSX.Element {
  const eventColor = eventColors[event.color] || eventColors.blue;

  const handlePress = useCallback(() => {
    onPress(event);
  }, [onPress, event]);

  // Swipe actions
  const rightActions: SwipeAction[] = onDelete
    ? [
        {
          icon: 'delete',
          label: 'Elimina',
          color: 'error',
          onPress: () => onDelete(event.id),
        },
      ]
    : [];

  return (
    <SwipeableRow rightActions={rightActions}>
      <AnimatedPressable
        onPress={handlePress}
        haptic="light"
        pressScale={0.98}
        accessibilityLabel={event.title}
        accessibilityHint={`Evento dalle ${formatTime(event.startAt)} alle ${formatTime(event.endAt)}`}
        accessibilityRole="button"
      >
        <Box
          flexDirection="row"
          alignItems="center"
          gap="md"
          padding="md"
          borderRadius="lg"
          backgroundColor="surface"
          borderWidth={1}
          borderColor="border"
          style={{ borderColor: 'rgba(0,0,0,0.04)' }}
        >
          {/* Color indicator with icon */}
          <Box
            width={44}
            height={44}
            borderRadius="lg"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: `${eventColor}15` }}
          >
            <Icon
              name={event.allDay ? 'calendar' : 'time'}
              size="md"
              color="textPrimary"
            />
          </Box>

          {/* Event info */}
          <Box flex={1}>
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text variant="bodyMedium" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
                {event.title}
              </Text>
              {event.allDay && (
                <Box
                  borderRadius="sm"
                  paddingHorizontal="sm"
                  paddingVertical="xxs"
                  style={{ backgroundColor: `${eventColor}15` }}
                >
                  <Text variant="caption" style={{ color: eventColor, fontSize: 10 }}>
                    Tutto il giorno
                  </Text>
                </Box>
              )}
            </Box>

            <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginTop="xxs">
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Box
                  width={6}
                  height={6}
                  borderRadius="full"
                  style={{ backgroundColor: eventColor }}
                />
                {!event.allDay && (
                  <Text variant="caption" color="textSecondary">
                    {formatTime(event.startAt)} - {formatTime(event.endAt)}
                  </Text>
                )}
                {event.allDay && (
                  <Text variant="caption" color="textSecondary">
                    Evento
                  </Text>
                )}
              </Box>
              {event.description && (
                <Text variant="caption" color="textTertiary" numberOfLines={1} style={{ maxWidth: 100 }}>
                  {event.description}
                </Text>
              )}
            </Box>
          </Box>
        </Box>
      </AnimatedPressable>
    </SwipeableRow>
  );
}
