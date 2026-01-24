/**
 * MonthSummary Component - NO TAG NATIVI
 */

import React from 'react';
import { Box, Text, Card, Pressable, Icon } from '@shared/ui';
import { formatCurrency } from '@shared/lib/format';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface MonthSummaryProps {
  selectedMonth: string;
  totalExpenses: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthSummary({
  selectedMonth,
  totalExpenses,
  onPrevMonth,
  onNextMonth,
}: MonthSummaryProps): JSX.Element {
  const [year, month] = selectedMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const monthName = format(date, 'MMMM yyyy', { locale: it });

  return (
    <Card elevation="md" padding="lg">
      {/* Month navigation */}
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="md">
        <Pressable
          onPress={onPrevMonth}
          accessibilityLabel="Mese precedente"
          padding="sm"
        >
          <Icon name="chevronLeft" size="md" />
        </Pressable>

        <Text variant="headingSmall" weight="semibold" transform="capitalize">
          {monthName}
        </Text>

        <Pressable
          onPress={onNextMonth}
          accessibilityLabel="Mese successivo"
          padding="sm"
        >
          <Icon name="chevronRight" size="md" />
        </Pressable>
      </Box>

      {/* Total */}
      <Box alignItems="center">
        <Text variant="caption" color="textSecondary">
          Spese totali
        </Text>
        <Text variant="displaySmall" weight="bold" color="error">
          {formatCurrency(totalExpenses)}
        </Text>
      </Box>
    </Card>
  );
}
