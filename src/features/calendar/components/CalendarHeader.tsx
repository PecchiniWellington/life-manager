/**
 * CalendarHeader Component - Modern Design
 * Header con navigazione mese - Stile coerente con Wallet
 * FEATURE COMPONENT: Usa solo atoms e molecules del design system
 */

import React from 'react';
import { Box, Text, Icon, GlassCard, AnimatedPressable } from '@shared/ui';
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
          <AnimatedPressable onPress={onToday} haptic="light" pressScale={0.95}>
            <Box
              paddingHorizontal="lg"
              paddingVertical="sm"
              borderRadius="lg"
              backgroundColor="surfaceSecondary"
            >
              <Text variant="bodySmall" weight="semibold" color="primary">
                Oggi
              </Text>
            </Box>
          </AnimatedPressable>

          {/* Month navigation */}
          <Box
            flexDirection="row"
            alignItems="center"
            borderRadius="md"
            style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
          >
            <AnimatedPressable onPress={onPrevMonth} haptic="light" pressScale={0.9}>
              <Box padding="sm">
                <Icon name="chevronLeft" size="sm" color="textSecondary" />
              </Box>
            </AnimatedPressable>
            <AnimatedPressable onPress={onNextMonth} haptic="light" pressScale={0.9}>
              <Box padding="sm">
                <Icon name="chevronRight" size="sm" color="textSecondary" />
              </Box>
            </AnimatedPressable>
          </Box>
        </Box>
      </Box>
    </GlassCard>
  );
}
