/**
 * TransactionItem Component - Modern Design
 * FEATURE COMPONENT: Usa solo atoms e molecules del design system
 * Features: AnimatedPressable, SwipeableRow, design pulito
 */

import React, { useCallback } from 'react';
import {
  Box,
  Text,
  Icon,
  AnimatedPressable,
  SwipeableRow,
  type IconName,
  type SwipeAction,
  categoryColors,
  transactionColors,
} from '@shared/ui';
import { Transaction, categoryLabels, categoryIcons } from '../domain/types';
import { formatCurrency } from '@shared/lib/format';
import { formatRelativeDate } from '@shared/lib/date';

// Category colors for background (derived from tokens)
const categoryBgColors: Record<string, string> = {
  food: `${categoryColors.food}1F`,
  transport: `${categoryColors.transport}1F`,
  entertainment: `${categoryColors.entertainment}1F`,
  shopping: `${categoryColors.shopping}1F`,
  health: `${categoryColors.health}1F`,
  bills: `${categoryColors.bills}1F`,
  other: `${categoryColors.other}1F`,
};

const categoryIconColors: Record<string, string> = {
  food: categoryColors.food,
  transport: categoryColors.transport,
  entertainment: categoryColors.entertainment,
  shopping: categoryColors.shopping,
  health: categoryColors.health,
  bills: categoryColors.bills,
  other: categoryColors.other,
};

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
  const bgColor = categoryBgColors[transaction.category] || categoryBgColors.other;
  const iconColor = categoryIconColors[transaction.category] || categoryIconColors.other;

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
          {/* Category icon */}
          <Box
            width={44}
            height={44}
            borderRadius="lg"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: bgColor }}
          >
            <Icon
              name={categoryIcons[transaction.category] as IconName}
              size="md"
              color="textPrimary"
            />
          </Box>

          {/* Info */}
          <Box flex={1}>
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text variant="bodyMedium" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
                {transaction.note || categoryLabels[transaction.category]}
              </Text>
              <Text
                variant="bodyMedium"
                weight="bold"
                style={{ color: isExpense ? transactionColors.expense : transactionColors.income }}
              >
                {isExpense ? '-' : '+'}€{formatCurrency(transaction.amount)}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginTop="xxs">
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Box
                  width={6}
                  height={6}
                  borderRadius="full"
                  style={{ backgroundColor: iconColor }}
                />
                <Text variant="caption" color="textSecondary">
                  {categoryLabels[transaction.category]}
                </Text>
              </Box>
              <Text variant="caption" color="textTertiary">
                {formatRelativeDate(transaction.date)}
              </Text>
            </Box>
          </Box>
        </Box>
      </AnimatedPressable>
    </SwipeableRow>
  );
}
