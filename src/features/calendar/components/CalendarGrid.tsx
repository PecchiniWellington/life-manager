/**
 * CalendarGrid Component
 * Griglia mensile del calendario - NO TAG NATIVI
 */

import React, { useMemo } from 'react';
import {
  Box,
  Text,
  Pressable,
  Badge,
} from '@shared/ui';
import { useTheme } from '@shared/ui/theme';
import { getCalendarDays, getWeekDayNames, isCurrentMonth, isToday, isSameDay, parseISO } from '@shared/lib/date';

interface CalendarGridProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  eventCountsByDay: Record<string, number>;
}

export function CalendarGrid({
  selectedDate,
  onSelectDate,
  eventCountsByDay,
}: CalendarGridProps): JSX.Element {
  const theme = useTheme();
  const currentDate = parseISO(selectedDate);
  const weekDays = useMemo(() => getWeekDayNames(true), []);
  const calendarDays = useMemo(() => getCalendarDays(currentDate), [selectedDate]);

  return (
    <Box>
      {/* Week day headers */}
      <Box flexDirection="row" marginBottom="sm">
        {weekDays.map((day) => (
          <Box key={day} flex={1} alignItems="center" paddingY="xs">
            <Text variant="labelSmall" color="textSecondary">
              {day}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box flexDirection="row" flexWrap="wrap">
        {calendarDays.map((day, index) => {
          const dateKey = day.toISOString().split('T')[0];
          const isSelected = isSameDay(day, currentDate);
          const isTodayDate = isToday(day);
          const isInCurrentMonth = isCurrentMonth(day, currentDate);
          const eventCount = eventCountsByDay[dateKey] || 0;

          return (
            <Box key={index} width="14.28%" alignItems="center" paddingY="xs">
              <Pressable
                onPress={() => onSelectDate(day.toISOString())}
                accessibilityLabel={`${day.getDate()} ${day.toLocaleDateString()}`}
                accessibilityHint={eventCount > 0 ? `${eventCount} eventi` : undefined}
                width={40}
                height={40}
                borderRadius="full"
                alignItems="center"
                justifyContent="center"
                backgroundColor={
                  isSelected
                    ? 'calendarSelected'
                    : isTodayDate
                    ? 'calendarToday'
                    : undefined
                }
              >
                <Text
                  variant="bodyMedium"
                  color={
                    isSelected
                      ? 'onPrimary'
                      : isInCurrentMonth
                      ? 'textPrimary'
                      : 'textTertiary'
                  }
                  weight={isTodayDate ? 'semibold' : 'regular'}
                >
                  {day.getDate()}
                </Text>
              </Pressable>

              {/* Event indicator */}
              {eventCount > 0 && (
                <Box position="absolute" bottom={2}>
                  <Badge
                    dot
                    variant={isSelected ? 'default' : 'primary'}
                    size="sm"
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
