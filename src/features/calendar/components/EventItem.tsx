/**
 * EventItem Component
 * Singolo evento nella lista - NO TAG NATIVI
 * MOLECULE: Usa solo atoms del design system
 * Features: AnimatedPressable, SwipeableRow, GlassCard
 */

import React, { useCallback } from 'react';
import {
  Box,
  Text,
  Icon,
  AnimatedPressable,
  SwipeableRow,
  GlassCard,
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
  const eventColor = eventColors[event.color];

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
        <GlassCard variant="solid" padding="md">
          <Box flexDirection="row" alignItems="center" gap="md">
            {/* Color indicator */}
            <Box
              width={4}
              height={44}
              borderRadius="full"
              style={{ backgroundColor: eventColor }}
            />

            {/* Event info */}
            <Box flex={1} gap="xs">
              <Text variant="bodyMedium" weight="semibold" numberOfLines={1}>
                {event.title}
              </Text>

              <Box flexDirection="row" alignItems="center" gap="xs">
                <Icon
                  name={event.allDay ? 'calendar' : 'time'}
                  size="xs"
                  color="textSecondary"
                />
                {event.allDay ? (
                  <Text variant="bodySmall" color="textSecondary">
                    Tutto il giorno
                  </Text>
                ) : (
                  <Text variant="bodySmall" color="textSecondary">
                    {formatTime(event.startAt)} - {formatTime(event.endAt)}
                  </Text>
                )}
              </Box>

              {event.description && (
                <Text
                  variant="caption"
                  color="textTertiary"
                  numberOfLines={1}
                >
                  {event.description}
                </Text>
              )}
            </Box>

            {/* Chevron */}
            <Icon name="chevronRight" size="sm" color="textTertiary" />
          </Box>
        </GlassCard>
      </AnimatedPressable>
    </SwipeableRow>
  );
}
