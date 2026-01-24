/**
 * BudgetProgress Component
 * Mostra il progresso del budget con barra
 * FEATURE COMPONENT: Usa solo atoms e molecules del design system
 */

import React from 'react';
import { Box, Text, GlassCard, AnimatedPressable } from '@shared/ui';
import { Budget } from '../domain/types';

interface BudgetProgressProps {
  budget: Budget | null | undefined;
  spent: number;
  onPress?: () => void;
  compact?: boolean;
}

export function BudgetProgress({
  budget,
  spent,
  onPress,
  compact = false,
}: BudgetProgressProps): JSX.Element {
  if (!budget) {
    const content = (
      <GlassCard variant="solid" padding={compact ? 'sm' : 'md'}>
        <Box alignItems="center" gap="xs">
          <Text variant="bodySmall" color="textSecondary">
            Nessun budget impostato
          </Text>
          {onPress && (
            <Text variant="caption" color="primary" weight="semibold">
              Imposta budget
            </Text>
          )}
        </Box>
      </GlassCard>
    );

    return onPress ? (
      <AnimatedPressable onPress={onPress} haptic="light" pressScale={0.98}>
        {content}
      </AnimatedPressable>
    ) : content;
  }

  const limit = budget.globalLimit;
  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const remaining = limit - spent;
  const isOverBudget = spent > limit;

  // Determine color based on percentage
  const getBarColor = () => {
    if (isOverBudget) return '#FF3B30'; // Red
    if (percentage > 80) return '#FF9500'; // Orange
    if (percentage > 60) return '#FFCC00'; // Yellow
    return '#34C759'; // Green
  };

  if (compact) {
    const compactContent = (
      <GlassCard variant="solid" padding="sm">
        <Box gap="xs">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text variant="caption" color="textSecondary">
              Budget
            </Text>
            <Text
              variant="caption"
              weight="semibold"
              color={isOverBudget ? 'error' : 'textPrimary'}
            >
              €{spent.toFixed(0)} / €{limit.toFixed(0)}
            </Text>
          </Box>
          <Box
            height={4}
            borderRadius="full"
            backgroundColor="border"
            overflow="hidden"
          >
            <Box
              height={4}
              borderRadius="full"
              style={{
                width: `${percentage}%`,
                backgroundColor: getBarColor(),
              }}
            />
          </Box>
        </Box>
      </GlassCard>
    );

    return onPress ? (
      <AnimatedPressable onPress={onPress} haptic="light" pressScale={0.98}>
        {compactContent}
      </AnimatedPressable>
    ) : compactContent;
  }

  const fullContent = (
    <GlassCard variant="solid" padding="md">
      <Box gap="md">
        <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Text variant="caption" color="textSecondary">
              Budget mensile
            </Text>
            <Text variant="headingSmall" weight="bold">
              €{limit.toFixed(2)}
            </Text>
          </Box>
          <Box alignItems="flex-end">
            <Text variant="caption" color="textSecondary">
              Speso
            </Text>
            <Text
              variant="bodyMedium"
              weight="semibold"
              color={isOverBudget ? 'error' : 'textPrimary'}
            >
              €{spent.toFixed(2)}
            </Text>
          </Box>
        </Box>

        {/* Progress bar */}
        <Box gap="xs">
          <Box
            height={8}
            borderRadius="full"
            backgroundColor="border"
            overflow="hidden"
          >
            <Box
              height={8}
              borderRadius="full"
              style={{
                width: `${percentage}%`,
                backgroundColor: getBarColor(),
              }}
            />
          </Box>
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="caption" color="textSecondary">
              {percentage.toFixed(0)}% utilizzato
            </Text>
            <Text
              variant="caption"
              weight="semibold"
              color={isOverBudget ? 'error' : 'success'}
            >
              {isOverBudget ? 'Sforato di ' : 'Rimangono '}
              €{Math.abs(remaining).toFixed(2)}
            </Text>
          </Box>
        </Box>
      </Box>
    </GlassCard>
  );

  return onPress ? (
    <AnimatedPressable onPress={onPress} haptic="light" pressScale={0.98}>
      {fullContent}
    </AnimatedPressable>
  ) : fullContent;
}

interface CategoryBudgetProgressProps {
  categoryName: string;
  categoryColor: string;
  limit: number;
  spent: number;
}

export function CategoryBudgetProgress({
  categoryName,
  categoryColor,
  limit,
  spent,
}: CategoryBudgetProgressProps): JSX.Element {
  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isOverBudget = spent > limit;

  return (
    <Box gap="xs">
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box flexDirection="row" alignItems="center" gap="xs">
          <Box
            width={8}
            height={8}
            borderRadius="full"
            style={{ backgroundColor: categoryColor }}
          />
          <Text variant="bodySmall">{categoryName}</Text>
        </Box>
        <Text
          variant="caption"
          weight="semibold"
          color={isOverBudget ? 'error' : 'textSecondary'}
        >
          €{spent.toFixed(0)} / €{limit.toFixed(0)}
        </Text>
      </Box>
      <Box
        height={4}
        borderRadius="full"
        backgroundColor="border"
        overflow="hidden"
      >
        <Box
          height={4}
          borderRadius="full"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOverBudget ? '#FF3B30' : categoryColor,
          }}
        />
      </Box>
    </Box>
  );
}
