/**
 * SpendingChart Organism
 * Grafico spese con barre animate e breakdown categorie
 *
 * ORGANISM: compone ATOMI + MOLECOLE, zero tag nativi
 * Presentational: riceve dati via props
 */

import React from 'react';
import { Box, Text, Icon, GlassCard, AnimatedPressable, IconName } from '../atoms';
import { AnimatedBar, AnimatedBarGroup, BarData } from '../atoms/AnimatedBar';
import { AnimatedNumber } from '../atoms/AnimatedNumber';
import { AnimatedProgressRing } from '../atoms/AnimatedProgressRing';
import { SemanticColorKey } from '../tokens';

export interface CategorySpending {
  id: string;
  name: string;
  icon: IconName;
  amount: number;
  color: SemanticColorKey;
  percentage: number;
}

export interface DailySpending {
  day: string;
  amount: number;
  label: string;
}

export interface SpendingChartProps {
  /** Spesa totale del periodo */
  totalSpent: number;
  /** Budget del periodo */
  budget?: number;
  /** Spese per categoria */
  categories: CategorySpending[];
  /** Spese giornaliere (ultimi 7 giorni) */
  dailySpending?: DailySpending[];
  /** Callback selezione categoria */
  onCategoryPress?: (categoryId: string) => void;
  /** Mostra grafico giornaliero */
  showDailyChart?: boolean;
  /** Numero max categorie da mostrare */
  maxCategories?: number;
  /** Test ID */
  testID?: string;
}

export function SpendingChart({
  totalSpent,
  budget,
  categories,
  dailySpending = [],
  onCategoryPress,
  showDailyChart = true,
  maxCategories = 5,
  testID,
}: SpendingChartProps): JSX.Element {
  const budgetProgress = budget ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const isOverBudget = budget ? totalSpent > budget : false;
  const remaining = budget ? budget - totalSpent : 0;

  const topCategories = categories
    .sort((a, b) => b.amount - a.amount)
    .slice(0, maxCategories);

  const maxDailySpend = Math.max(...dailySpending.map((d) => d.amount), 1);

  return (
    <Box gap="lg" testID={testID}>
      {/* Budget Overview Card */}
      {budget !== undefined && (
        <GlassCard variant="solid" padding="lg">
          <Box flexDirection="row" alignItems="center" gap="lg">
            <AnimatedProgressRing
              progress={budgetProgress}
              size="lg"
              color={isOverBudget ? 'error' : budgetProgress > 80 ? 'warning' : 'success'}
            >
              <Box alignItems="center">
                <Text
                  variant="caption"
                  color={isOverBudget ? 'error' : 'textSecondary'}
                  weight="semibold"
                >
                  {Math.round(budgetProgress)}%
                </Text>
              </Box>
            </AnimatedProgressRing>

            <Box flex={1} gap="sm">
              <Text variant="bodySmall" color="textSecondary">
                Speso questo mese
              </Text>
              <AnimatedNumber
                value={totalSpent}
                format="currency"
                prefix="€"
                variant="headingMedium"
                color="textPrimary"
              />
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Icon
                  name={isOverBudget ? 'warning' : 'checkCircle'}
                  size="xs"
                  color={isOverBudget ? 'error' : 'success'}
                />
                <Text
                  variant="caption"
                  color={isOverBudget ? 'error' : 'success'}
                >
                  {isOverBudget
                    ? `€${Math.abs(remaining).toFixed(2)} oltre budget`
                    : `€${remaining.toFixed(2)} rimanenti`}
                </Text>
              </Box>
            </Box>
          </Box>
        </GlassCard>
      )}

      {/* Daily Spending Chart */}
      {showDailyChart && dailySpending.length > 0 && (
        <GlassCard variant="solid" padding="lg">
          <Box gap="md">
            <Text variant="bodyMedium" weight="semibold">
              Ultimi 7 giorni
            </Text>

            <Box height={120} flexDirection="row" alignItems="flex-end" gap="sm">
              {dailySpending.map((day, index) => (
                <Box key={index} flex={1} alignItems="center" gap="xs">
                  <Box flex={1} width="100%" justifyContent="flex-end">
                    <AnimatedBar
                      value={(day.amount / maxDailySpend) * 100}
                      direction="vertical"
                      size="lg"
                      color={day.amount > 0 ? 'primary' : 'border'}
                      delay={index * 80}
                    />
                  </Box>
                  <Text variant="caption" color="textTertiary">
                    {day.label}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </GlassCard>
      )}

      {/* Categories Breakdown */}
      <GlassCard variant="solid" padding="lg">
        <Box gap="md">
          <Text variant="bodyMedium" weight="semibold">
            Per categoria
          </Text>

          <Box gap="sm">
            {topCategories.map((category, index) => (
              <AnimatedPressable
                key={category.id}
                onPress={() => onCategoryPress?.(category.id)}
                haptic="light"
                pressScale={0.98}
                accessibilityLabel={`${category.name}: €${category.amount.toFixed(2)}`}
                accessibilityRole="button"
              >
                <Box gap="xs">
                  <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                    <Box flexDirection="row" alignItems="center" gap="sm">
                      <Box
                        width={32}
                        height={32}
                        borderRadius="md"
                        backgroundColor={`${category.color}Light` as SemanticColorKey}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon name={category.icon} size="sm" color={category.color} />
                      </Box>
                      <Text variant="bodySmall" weight="medium">
                        {category.name}
                      </Text>
                    </Box>
                    <Box alignItems="flex-end">
                      <Text variant="bodySmall" weight="semibold">
                        €{category.amount.toFixed(2)}
                      </Text>
                      <Text variant="caption" color="textTertiary">
                        {category.percentage.toFixed(1)}%
                      </Text>
                    </Box>
                  </Box>
                  <AnimatedBar
                    value={category.percentage}
                    color={category.color}
                    size="xs"
                    delay={index * 60}
                  />
                </Box>
              </AnimatedPressable>
            ))}
          </Box>
        </Box>
      </GlassCard>
    </Box>
  );
}
