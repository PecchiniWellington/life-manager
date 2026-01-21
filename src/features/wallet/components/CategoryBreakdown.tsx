/**
 * CategoryBreakdown Component - NO TAG NATIVI
 */

import React from 'react';
import { Box, Text, Card, Icon, IconName } from '@shared/ui';
import { ExpenseCategory, categoryLabels, categoryIcons } from '../domain/types';
import { formatCurrency } from '@shared/lib/format';

interface CategoryBreakdownProps {
  topCategories: Array<{ category: ExpenseCategory; amount: number }>;
  totalExpenses: number;
}

export function CategoryBreakdown({
  topCategories,
  totalExpenses,
}: CategoryBreakdownProps): JSX.Element {
  if (topCategories.length === 0) {
    return (
      <Card elevation="sm" padding="lg">
        <Text color="textSecondary" align="center">
          Nessuna spesa questo mese
        </Text>
      </Card>
    );
  }

  return (
    <Card elevation="sm" padding="lg">
      <Text variant="headingSmall" weight="semibold" style={{ marginBottom: 16 }}>
        Per categoria
      </Text>

      <Box gap="md">
        {topCategories.map(({ category, amount }) => {
          const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

          return (
            <Box key={category} gap="xs">
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Box flexDirection="row" alignItems="center" gap="sm">
                  <Icon name={categoryIcons[category] as IconName} size="sm" />
                  <Text variant="bodyMedium">{categoryLabels[category]}</Text>
                </Box>
                <Text variant="bodyMedium" weight="medium">
                  {formatCurrency(amount)}
                </Text>
              </Box>

              {/* Progress bar */}
              <Box
                height={8}
                backgroundColor="backgroundTertiary"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  height={8}
                  width={`${percentage}%`}
                  backgroundColor="primary"
                  borderRadius="full"
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
