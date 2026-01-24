/**
 * CalendarHeader Component - Modern Design
 * Header con navigazione mese - Stile coerente con Wallet
 */

import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Box, Text, Icon, GlassCard } from '@shared/ui';
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
    <GlassCard variant="solid" padding="sm">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        {/* Month/Year display */}
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Box
            width={40}
            height={40}
            borderRadius="lg"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
          >
            <Icon name="calendar" size="sm" color="primary" />
          </Box>
          <Box>
            <Text variant="bodyMedium" weight="semibold" color="textPrimary">
              {monthName}
            </Text>
            <Text variant="caption" color="textSecondary">
              {currentDate.getFullYear()}
            </Text>
          </Box>
        </Box>

        {/* Navigation */}
        <Box flexDirection="row" alignItems="center" gap="xs">
          {/* Today button */}
          <Pressable onPress={onToday} style={styles.todayButton}>
            <Text variant="caption" weight="semibold" color="primary">
              Oggi
            </Text>
          </Pressable>

          {/* Month navigation */}
          <Box flexDirection="row" alignItems="center" style={styles.navContainer}>
            <Pressable onPress={onPrevMonth} style={styles.navButton}>
              <Icon name="chevronLeft" size="sm" color="textSecondary" />
            </Pressable>
            <Pressable onPress={onNextMonth} style={styles.navButton}>
              <Icon name="chevronRight" size="sm" color="textSecondary" />
            </Pressable>
          </Box>
        </Box>
      </Box>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  navContainer: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
  },
  navButton: {
    padding: 8,
  },
});
