/**
 * TransactionItem Component - Modern Design
 * MOLECULE: Usa solo atoms del design system
 * Features: AnimatedPressable, SwipeableRow, design pulito
 */

import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import {
  Box,
  Text,
  Icon,
  AnimatedPressable,
  SwipeableRow,
  type IconName,
  type SwipeAction,
} from '@shared/ui';
import { Transaction, categoryLabels, categoryIcons } from '../domain/types';
import { formatCurrency } from '@shared/lib/format';
import { formatRelativeDate } from '@shared/lib/date';

// Category colors for background
const categoryBgColors: Record<string, string> = {
  food: 'rgba(251, 146, 60, 0.12)',
  transport: 'rgba(59, 130, 246, 0.12)',
  entertainment: 'rgba(239, 68, 68, 0.12)',
  shopping: 'rgba(168, 85, 247, 0.12)',
  health: 'rgba(34, 197, 94, 0.12)',
  bills: 'rgba(249, 115, 22, 0.12)',
  other: 'rgba(107, 114, 128, 0.12)',
};

const categoryIconColors: Record<string, string> = {
  food: '#fb923c',
  transport: '#3b82f6',
  entertainment: '#ef4444',
  shopping: '#a855f7',
  health: '#22c55e',
  bills: '#f97316',
  other: '#6b7280',
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
          style={styles.itemContainer}
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
                style={{ color: isExpense ? '#ef4444' : '#22c55e' }}
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

const styles = StyleSheet.create({
  itemContainer: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
});
