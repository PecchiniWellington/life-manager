/**
 * SpendingChart Component
 * Grafici per visualizzare le spese (placeholder senza libreria esterna)
 */

import React from 'react';
import { Box, Text, GlassCard, AnimatedPressable, appleColors, palette } from '@shared/ui';
import { Category } from '../domain/types';

interface CategorySpending {
  category: Category;
  amount: number;
  percentage: number;
}

interface SpendingChartProps {
  data: CategorySpending[];
  totalSpent: number;
  onCategoryPress?: (categoryId: string) => void;
}

/**
 * Bar chart per spese per categoria
 */
export function SpendingBarChart({
  data,
  totalSpent,
}: SpendingChartProps): JSX.Element {
  // Sort by amount descending
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  if (sortedData.length === 0) {
    return (
      <GlassCard variant="solid" padding="md">
        <Box alignItems="center" padding="lg">
          <Text variant="bodyMedium" color="textSecondary">
            Nessuna spesa da visualizzare
          </Text>
        </Box>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="solid" padding="md">
      <Box gap="md">
        <Text variant="bodyMedium" weight="semibold">
          Spese per categoria
        </Text>

        <Box gap="sm">
          {sortedData.map((item) => (
            <Box key={item.category.id} gap="xs">
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <Text style={{ fontSize: 14 }}>{item.category.icon}</Text>
                  <Text variant="bodySmall">{item.category.name}</Text>
                </Box>
                <Text variant="bodySmall" weight="semibold">
                  €{item.amount.toFixed(2)}
                </Text>
              </Box>
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
                    width: `${item.percentage}%`,
                    backgroundColor: item.category.color,
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>

        {/* Total */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          paddingTop="sm"
          borderTopWidth={1}
          borderColor="border"
        >
          <Text variant="bodyMedium" weight="semibold">
            Totale
          </Text>
          <Text variant="bodyMedium" weight="bold">
            €{totalSpent.toFixed(2)}
          </Text>
        </Box>
      </Box>
    </GlassCard>
  );
}

/**
 * Donut chart placeholder (visual representation without external library)
 */
export function SpendingDonutChart({
  data,
  totalSpent,
}: SpendingChartProps): JSX.Element {
  // Sort by percentage descending and take top 5
  const sortedData = [...data]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  const othersPercentage = sortedData.length < data.length
    ? data
        .filter(d => !sortedData.includes(d))
        .reduce((sum, d) => sum + d.percentage, 0)
    : 0;

  if (sortedData.length === 0) {
    return (
      <GlassCard variant="solid" padding="md">
        <Box alignItems="center" padding="lg">
          <Text variant="bodyMedium" color="textSecondary">
            Nessuna spesa da visualizzare
          </Text>
        </Box>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="solid" padding="md">
      <Box gap="md">
        <Text variant="bodyMedium" weight="semibold">
          Distribuzione spese
        </Text>

        {/* Pseudo donut using stacked bars */}
        <Box flexDirection="row" height={24} borderRadius="full" overflow="hidden">
          {sortedData.map((item) => (
            <Box
              key={item.category.id}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.category.color,
              }}
            />
          ))}
          {othersPercentage > 0 && (
            <Box
              style={{
                width: `${othersPercentage}%`,
                backgroundColor: appleColors.systemGray,
              }}
            />
          )}
        </Box>

        {/* Legend */}
        <Box gap="xs">
          {sortedData.map((item) => (
            <Box
              key={item.category.id}
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Box
                  width={12}
                  height={12}
                  borderRadius="sm"
                  style={{ backgroundColor: item.category.color }}
                />
                <Text variant="caption">{item.category.name}</Text>
              </Box>
              <Text variant="caption" weight="semibold">
                {item.percentage.toFixed(0)}%
              </Text>
            </Box>
          ))}
          {othersPercentage > 0 && (
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Box
                  width={12}
                  height={12}
                  borderRadius="sm"
                  style={{ backgroundColor: appleColors.systemGray }}
                />
                <Text variant="caption">Altro</Text>
              </Box>
              <Text variant="caption" weight="semibold">
                {othersPercentage.toFixed(0)}%
              </Text>
            </Box>
          )}
        </Box>

        {/* Center total */}
        <Box alignItems="center">
          <Text variant="caption" color="textSecondary">
            Spesa totale
          </Text>
          <Text variant="headingSmall" weight="bold">
            €{totalSpent.toFixed(2)}
          </Text>
        </Box>
      </Box>
    </GlassCard>
  );
}

/**
 * Mini spending overview for dashboard
 */
interface MiniSpendingOverviewProps {
  data: CategorySpending[];
  totalSpent: number;
  onPress?: () => void;
}

export function MiniSpendingOverview({
  data,
  totalSpent,
  onPress,
}: MiniSpendingOverviewProps): JSX.Element {
  const topCategories = [...data]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const content = (
    <GlassCard variant="solid" padding="sm">
      <Box gap="sm">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text variant="caption" color="textSecondary">
            Top spese
          </Text>
          <Text variant="caption" weight="semibold">
            €{totalSpent.toFixed(0)}
          </Text>
        </Box>

        {/* Mini stacked bar */}
        <Box flexDirection="row" height={8} borderRadius="full" overflow="hidden">
          {topCategories.map((item) => (
            <Box
              key={item.category.id}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.category.color,
              }}
            />
          ))}
          {topCategories.length < data.length && (
            <Box
              flex={1}
              style={{ backgroundColor: palette.gray200 }}
            />
          )}
        </Box>

        {/* Top 3 legend */}
        <Box flexDirection="row" justifyContent="space-between">
          {topCategories.map((item) => (
            <Box key={item.category.id} alignItems="center">
              <Text style={{ fontSize: 12 }}>{item.category.icon}</Text>
              <Text variant="caption" color="textSecondary">
                €{item.amount.toFixed(0)}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </GlassCard>
  );

  return onPress ? (
    <AnimatedPressable onPress={onPress} haptic="light" pressScale={0.98}>
      {content}
    </AnimatedPressable>
  ) : content;
}
