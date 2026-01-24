/**
 * TrendChart Component
 * Grafici trend temporali (placeholder senza libreria esterna)
 */

import React from 'react';
import { Box, Text, GlassCard, AnimatedPressable } from '@shared/ui';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface TrendDataPoint {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  period: 'week' | 'month' | 'year';
  showBalance?: boolean;
}

/**
 * Line chart per trend (placeholder implementation)
 */
export function TrendLineChart({
  data,
  period,
}: TrendChartProps): JSX.Element {
  if (data.length === 0) {
    return (
      <GlassCard variant="solid" padding="md">
        <Box alignItems="center" padding="lg">
          <Text variant="bodyMedium" color="textSecondary">
            Nessun dato da visualizzare
          </Text>
        </Box>
      </GlassCard>
    );
  }

  // Calculate max value for scaling
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.income, d.expense, Math.abs(d.balance)))
  );

  // Calculate totals
  const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
  const netBalance = totalIncome - totalExpense;

  // Format date label based on period
  const formatDateLabel = (date: string) => {
    const parsed = parseISO(date);
    switch (period) {
      case 'week':
        return format(parsed, 'EEE', { locale: it });
      case 'month':
        return format(parsed, 'd', { locale: it });
      case 'year':
        return format(parsed, 'MMM', { locale: it });
      default:
        return format(parsed, 'd MMM', { locale: it });
    }
  };

  return (
    <GlassCard variant="solid" padding="md">
      <Box gap="md">
        <Text variant="bodyMedium" weight="semibold">
          Trend {period === 'week' ? 'settimanale' : period === 'month' ? 'mensile' : 'annuale'}
        </Text>

        {/* Summary */}
        <Box flexDirection="row" justifyContent="space-around">
          <Box alignItems="center">
            <Text variant="caption" color="textSecondary">
              Entrate
            </Text>
            <Text variant="bodyMedium" weight="semibold" color="success">
              +€{totalIncome.toFixed(0)}
            </Text>
          </Box>
          <Box alignItems="center">
            <Text variant="caption" color="textSecondary">
              Uscite
            </Text>
            <Text variant="bodyMedium" weight="semibold" color="error">
              -€{totalExpense.toFixed(0)}
            </Text>
          </Box>
          <Box alignItems="center">
            <Text variant="caption" color="textSecondary">
              Bilancio
            </Text>
            <Text
              variant="bodyMedium"
              weight="semibold"
              color={netBalance >= 0 ? 'success' : 'error'}
            >
              {netBalance >= 0 ? '+' : ''}€{netBalance.toFixed(0)}
            </Text>
          </Box>
        </Box>

        {/* Bar chart representation */}
        <Box gap="xs">
          <Box flexDirection="row" justifyContent="space-between" height={100}>
            {data.map((point, index) => {
              const incomeHeight = maxValue > 0 ? (point.income / maxValue) * 100 : 0;
              const expenseHeight = maxValue > 0 ? (point.expense / maxValue) * 100 : 0;

              return (
                <Box
                  key={index}
                  flex={1}
                  alignItems="center"
                  justifyContent="flex-end"
                  gap="xxs"
                >
                  <Box flexDirection="row" alignItems="flex-end" gap="xxs" height={80}>
                    {/* Income bar */}
                    <Box
                      width={8}
                      borderRadius="sm"
                      style={{
                        height: `${incomeHeight}%`,
                        backgroundColor: '#34C759',
                        minHeight: point.income > 0 ? 4 : 0,
                      }}
                    />
                    {/* Expense bar */}
                    <Box
                      width={8}
                      borderRadius="sm"
                      style={{
                        height: `${expenseHeight}%`,
                        backgroundColor: '#FF3B30',
                        minHeight: point.expense > 0 ? 4 : 0,
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* X axis labels */}
          <Box flexDirection="row" justifyContent="space-between">
            {data.map((point, index) => (
              <Box key={index} flex={1} alignItems="center">
                <Text variant="caption" color="textSecondary">
                  {formatDateLabel(point.date)}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Legend */}
        <Box flexDirection="row" justifyContent="center" gap="lg">
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Box
              width={12}
              height={12}
              borderRadius="sm"
              style={{ backgroundColor: '#34C759' }}
            />
            <Text variant="caption" color="textSecondary">
              Entrate
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Box
              width={12}
              height={12}
              borderRadius="sm"
              style={{ backgroundColor: '#FF3B30' }}
            />
            <Text variant="caption" color="textSecondary">
              Uscite
            </Text>
          </Box>
        </Box>
      </Box>
    </GlassCard>
  );
}

/**
 * Monthly comparison chart
 */
interface MonthlyComparisonProps {
  currentMonth: { income: number; expense: number };
  previousMonth: { income: number; expense: number };
}

export function MonthlyComparison({
  currentMonth,
  previousMonth,
}: MonthlyComparisonProps): JSX.Element {
  const incomeChange = previousMonth.income > 0
    ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
    : 0;
  const expenseChange = previousMonth.expense > 0
    ? ((currentMonth.expense - previousMonth.expense) / previousMonth.expense) * 100
    : 0;

  const currentBalance = currentMonth.income - currentMonth.expense;
  const previousBalance = previousMonth.income - previousMonth.expense;

  return (
    <GlassCard variant="solid" padding="md">
      <Box gap="md">
        <Text variant="bodyMedium" weight="semibold">
          Confronto mensile
        </Text>

        <Box gap="sm">
          {/* Income comparison */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Text variant="caption" color="textSecondary">
                Entrate
              </Text>
              <Text variant="bodyMedium" weight="semibold" color="success">
                €{currentMonth.income.toFixed(0)}
              </Text>
            </Box>
            <Box alignItems="flex-end">
              <Text
                variant="caption"
                color={incomeChange >= 0 ? 'success' : 'error'}
              >
                {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange).toFixed(0)}%
              </Text>
              <Text variant="caption" color="textSecondary">
                vs €{previousMonth.income.toFixed(0)}
              </Text>
            </Box>
          </Box>

          {/* Expense comparison */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Text variant="caption" color="textSecondary">
                Uscite
              </Text>
              <Text variant="bodyMedium" weight="semibold" color="error">
                €{currentMonth.expense.toFixed(0)}
              </Text>
            </Box>
            <Box alignItems="flex-end">
              <Text
                variant="caption"
                color={expenseChange <= 0 ? 'success' : 'error'}
              >
                {expenseChange <= 0 ? '↓' : '↑'} {Math.abs(expenseChange).toFixed(0)}%
              </Text>
              <Text variant="caption" color="textSecondary">
                vs €{previousMonth.expense.toFixed(0)}
              </Text>
            </Box>
          </Box>

          {/* Balance comparison */}
          <Box
            paddingTop="sm"
            borderTopWidth={1}
            borderColor="border"
          >
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Text variant="caption" color="textSecondary">
                  Bilancio
                </Text>
                <Text
                  variant="bodyMedium"
                  weight="bold"
                  color={currentBalance >= 0 ? 'success' : 'error'}
                >
                  {currentBalance >= 0 ? '+' : ''}€{currentBalance.toFixed(0)}
                </Text>
              </Box>
              <Box alignItems="flex-end">
                <Text variant="caption" color="textSecondary">
                  Mese precedente
                </Text>
                <Text
                  variant="caption"
                  color={previousBalance >= 0 ? 'success' : 'error'}
                >
                  {previousBalance >= 0 ? '+' : ''}€{previousBalance.toFixed(0)}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </GlassCard>
  );
}

/**
 * Balance over time mini chart
 */
interface BalanceHistoryProps {
  data: { date: string; balance: number }[];
  onPress?: () => void;
}

export function BalanceHistoryMini({
  data,
  onPress,
}: BalanceHistoryProps): JSX.Element {
  if (data.length === 0) {
    const emptyContent = (
      <GlassCard variant="solid" padding="sm">
        <Box alignItems="center">
          <Text variant="bodySmall" color="textSecondary">
            Nessun dato
          </Text>
        </Box>
      </GlassCard>
    );
    return onPress ? (
      <AnimatedPressable onPress={onPress} haptic="light" pressScale={0.98}>
        {emptyContent}
      </AnimatedPressable>
    ) : emptyContent;
  }

  const latestBalance = data[data.length - 1]?.balance || 0;
  const previousBalance = data[0]?.balance || 0;
  const change = latestBalance - previousBalance;
  const changePercent = previousBalance !== 0
    ? (change / Math.abs(previousBalance)) * 100
    : 0;

  // Normalize for mini bar chart
  const minBalance = Math.min(...data.map(d => d.balance));
  const maxBalance = Math.max(...data.map(d => d.balance));
  const range = maxBalance - minBalance || 1;

  const content = (
    <GlassCard variant="solid" padding="sm">
      <Box gap="xs">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text variant="caption" color="textSecondary">
            Andamento saldo
          </Text>
          <Text
            variant="caption"
            color={change >= 0 ? 'success' : 'error'}
          >
            {change >= 0 ? '+' : ''}{changePercent.toFixed(0)}%
          </Text>
        </Box>

        {/* Mini line representation */}
        <Box flexDirection="row" alignItems="flex-end" height={24} gap="xs">
          {data.slice(-7).map((point, index) => {
            const height = ((point.balance - minBalance) / range) * 24;
            return (
              <Box
                key={index}
                flex={1}
                borderRadius="sm"
                style={{
                  height: Math.max(height, 2),
                  backgroundColor: point.balance >= 0 ? '#34C759' : '#FF3B30',
                }}
              />
            );
          })}
        </Box>

        <Text variant="bodySmall" weight="semibold" align="right">
          €{latestBalance.toFixed(0)}
        </Text>
      </Box>
    </GlassCard>
  );

  return onPress ? (
    <AnimatedPressable onPress={onPress} haptic="light" pressScale={0.98}>
      {content}
    </AnimatedPressable>
  ) : content;
}
