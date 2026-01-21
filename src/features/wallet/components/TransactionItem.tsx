/**
 * TransactionItem Component - NO TAG NATIVI
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
  type IconName,
  type SwipeAction,
} from '@shared/ui';
import { Transaction, categoryLabels, categoryIcons } from '../domain/types';
import { formatCurrency } from '@shared/lib/format';
import { formatRelativeDate } from '@shared/lib/date';

interface TransactionItemProps {
  /** Transazione da visualizzare */
  transaction: Transaction;
  /** Callback pressione */
  onPress: (transaction: Transaction) => void;
  /** Callback eliminazione */
  onDelete?: (id: string) => void;
}

export function TransactionItem({
  transaction,
  onPress,
  onDelete,
}: TransactionItemProps): JSX.Element {
  const isExpense = transaction.type === 'expense';

  const handlePress = useCallback(() => {
    onPress(transaction);
  }, [onPress, transaction]);

  // Swipe actions
  const rightActions: SwipeAction[] = onDelete
    ? [
        {
          icon: 'delete',
          label: 'Elimina',
          color: 'error',
          onPress: () => onDelete(transaction.id),
        },
      ]
    : [];

  return (
    <SwipeableRow rightActions={rightActions}>
      <AnimatedPressable
        onPress={handlePress}
        haptic="light"
        pressScale={0.98}
        accessibilityLabel={`${categoryLabels[transaction.category]}: ${formatCurrency(transaction.amount)}`}
        accessibilityRole="button"
      >
        <GlassCard variant="solid" padding="md">
          <Box flexDirection="row" alignItems="center" gap="md">
            {/* Category icon */}
            <Box
              width={48}
              height={48}
              borderRadius="full"
              backgroundColor={isExpense ? 'errorLight' : 'successLight'}
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                name={categoryIcons[transaction.category] as IconName}
                size="md"
                color={isExpense ? 'error' : 'success'}
              />
            </Box>

            {/* Info */}
            <Box flex={1} gap="xs">
              <Text variant="bodyMedium" weight="semibold">
                {categoryLabels[transaction.category]}
              </Text>
              {transaction.note && (
                <Text variant="bodySmall" color="textSecondary" numberOfLines={1}>
                  {transaction.note}
                </Text>
              )}
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Icon name="calendar" size="xs" color="textTertiary" />
                <Text variant="caption" color="textTertiary">
                  {formatRelativeDate(transaction.date)}
                </Text>
              </Box>
            </Box>

            {/* Amount */}
            <Box alignItems="flex-end">
              <Text
                variant="bodyLarge"
                weight="bold"
                color={isExpense ? 'error' : 'success'}
              >
                {isExpense ? '-' : '+'}€{formatCurrency(transaction.amount)}
              </Text>
            </Box>
          </Box>
        </GlassCard>
      </AnimatedPressable>
    </SwipeableRow>
  );
}
