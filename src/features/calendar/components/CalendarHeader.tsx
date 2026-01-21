/**
 * CalendarHeader Component
 * Header con navigazione mese - NO TAG NATIVI
 */

import React from 'react';
import { Box, Text, Pressable, Icon, Button } from '@shared/ui';
import { getMonthName, parseISO } from '@shared/lib/date';

interface CalendarHeaderProps {
  selectedDate: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps): JSX.Element {
  const currentDate = parseISO(selectedDate);
  const monthName = getMonthName(currentDate);

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingY="md"
    >
      {/* Navigation arrows */}
      <Box flexDirection="row" alignItems="center" gap="xs">
        <Pressable
          onPress={onPrevMonth}
          accessibilityLabel="Mese precedente"
          padding="sm"
          borderRadius="full"
        >
          <Icon name="chevronLeft" size="md" />
        </Pressable>

        <Pressable
          onPress={onNextMonth}
          accessibilityLabel="Mese successivo"
          padding="sm"
          borderRadius="full"
        >
          <Icon name="chevronRight" size="md" />
        </Pressable>
      </Box>

      {/* Month/Year display */}
      <Text variant="headingMedium" weight="semibold">
        {monthName}
      </Text>

      {/* Today button */}
      <Pressable
        onPress={onToday}
        accessibilityLabel="Vai a oggi"
        paddingX="md"
        paddingY="xs"
        borderRadius="md"
        backgroundColor="secondary"
      >
        <Text variant="labelMedium">Oggi</Text>
      </Pressable>
    </Box>
  );
}
