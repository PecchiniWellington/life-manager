/**
 * ReportsScreen
 * Report e statistiche avanzate
 * SCREEN: Usa solo atoms e molecules del design system
 */

import React, { useState, useMemo } from 'react';
import {
  Screen,
  Box,
  Text,
  Button,
  Icon,
  GlassCard,
  ScrollContainer,
  AnimatedPressable,
} from '@shared/ui';
import { ScreenTitle } from '@shared/ui/molecules';
import { useTheme } from '@shared/ui/theme';
import { useAppSelector } from '@app/store/hooks';
import { selectAllCategories, selectMonthlySummary } from '../store';
import {
  SpendingBarChart,
  SpendingDonutChart,
  TrendLineChart,
  MonthlyComparison,
} from '../components';
import { useNavigation } from '@react-navigation/native';
import { format, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, subWeeks, subYears } from 'date-fns';

type Period = 'week' | 'month' | 'year';

export function ReportsScreen(): JSX.Element {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  const categories = useAppSelector(selectAllCategories);
  const summary = useAppSelector(selectMonthlySummary);

  // Mock data for charts - in real app would query transactions
  const categorySpendingData = useMemo(() => {
    const expenseCategories = categories.filter(c => c.type === 'expense');
    const totalSpent = summary?.totalExpenses || 0;

    // Simulate spending distribution
    return expenseCategories.slice(0, 6).map((category, index) => {
      const percentage = Math.max(5, 30 - index * 5);
      const amount = totalSpent * (percentage / 100);
      return {
        category,
        amount,
        percentage,
      };
    });
  }, [categories, summary]);

  const totalSpent = categorySpendingData.reduce((sum, item) => sum + item.amount, 0);

  // Generate trend data based on period
  const trendData = useMemo(() => {
    const now = new Date();
    let dates: Date[];

    switch (selectedPeriod) {
      case 'week':
        dates = eachDayOfInterval({
          start: subWeeks(now, 1),
          end: now,
        });
        break;
      case 'month':
        dates = eachWeekOfInterval({
          start: subMonths(now, 1),
          end: now,
        });
        break;
      case 'year':
        dates = eachMonthOfInterval({
          start: subYears(now, 1),
          end: now,
        });
        break;
    }

    // Generate mock data
    return dates.map((date) => ({
      date: format(date, 'yyyy-MM-dd'),
      income: Math.random() * 2000 + 500,
      expense: Math.random() * 1500 + 300,
      balance: Math.random() * 1000 - 200,
    }));
  }, [selectedPeriod]);

  // Monthly comparison mock data
  const monthlyComparison = useMemo(() => ({
    currentMonth: {
      income: summary?.totalIncome || 0,
      expense: summary?.totalExpenses || 0,
    },
    previousMonth: {
      income: (summary?.totalIncome || 0) * 0.9,
      expense: (summary?.totalExpenses || 0) * 1.1,
    },
  }), [summary]);

  const periodLabels: Record<Period, string> = {
    week: 'Settimana',
    month: 'Mese',
    year: 'Anno',
  };

  return (
    <Screen paddingHorizontal="lg">
      <ScreenTitle
        title="Report"
        leftAction={
          <Button
            title=""
            variant="ghost"
            size="sm"
            onPress={() => navigation.goBack()}
            leftIcon={<Icon name="chevronLeft" size="md" color="textPrimary" />}
          />
        }
      />

      <ScrollContainer showsVerticalScrollIndicator={false}>
        {/* Period selector */}
        <Box flexDirection="row" gap="sm" marginBottom="lg">
          {(['week', 'month', 'year'] as Period[]).map((period) => (
            <AnimatedPressable
              key={period}
              onPress={() => setSelectedPeriod(period)}
              haptic="selection"
              pressScale={0.98}
              style={{ flex: 1 }}
            >
              <Box
                paddingVertical="sm"
                paddingHorizontal="md"
                borderRadius="md"
                alignItems="center"
                style={{
                  backgroundColor: selectedPeriod === period ? colors.primary : 'rgba(0,0,0,0.05)',
                }}
              >
                <Text
                  variant="bodySmall"
                  weight="semibold"
                  color={selectedPeriod === period ? 'onPrimary' : 'textSecondary'}
                >
                  {periodLabels[period]}
                </Text>
              </Box>
            </AnimatedPressable>
          ))}
        </Box>

        {/* Summary cards */}
        <Box flexDirection="row" gap="sm" marginBottom="lg">
          <Box flex={1}>
            <GlassCard variant="solid" padding="md">
              <Box alignItems="center">
                <Text variant="caption" color="textSecondary">
                  Entrate
                </Text>
                <Text variant="headingSmall" weight="bold" color="success">
                  +€{(summary?.totalIncome || 0).toFixed(0)}
                </Text>
              </Box>
            </GlassCard>
          </Box>
          <Box flex={1}>
            <GlassCard variant="solid" padding="md">
              <Box alignItems="center">
                <Text variant="caption" color="textSecondary">
                  Uscite
                </Text>
                <Text variant="headingSmall" weight="bold" color="error">
                  -€{(summary?.totalExpenses || 0).toFixed(0)}
                </Text>
              </Box>
            </GlassCard>
          </Box>
          <Box flex={1}>
            <GlassCard variant="solid" padding="md">
              <Box alignItems="center">
                <Text variant="caption" color="textSecondary">
                  Saldo
                </Text>
                <Text
                  variant="headingSmall"
                  weight="bold"
                  color={(summary?.totalIncome || 0) - (summary?.totalExpenses || 0) >= 0 ? 'success' : 'error'}
                >
                  €{((summary?.totalIncome || 0) - (summary?.totalExpenses || 0)).toFixed(0)}
                </Text>
              </Box>
            </GlassCard>
          </Box>
        </Box>

        {/* Trend chart */}
        <Box marginBottom="lg">
          <TrendLineChart
            data={trendData}
            period={selectedPeriod}
          />
        </Box>

        {/* Monthly comparison */}
        <Box marginBottom="lg">
          <MonthlyComparison
            currentMonth={monthlyComparison.currentMonth}
            previousMonth={monthlyComparison.previousMonth}
          />
        </Box>

        {/* Spending by category - Bar chart */}
        <Box marginBottom="lg">
          <SpendingBarChart
            data={categorySpendingData}
            totalSpent={totalSpent}
          />
        </Box>

        {/* Spending distribution - Donut chart */}
        <Box marginBottom="lg">
          <SpendingDonutChart
            data={categorySpendingData}
            totalSpent={totalSpent}
          />
        </Box>

        {/* Tips */}
        <Box marginBottom="xl">
          <GlassCard variant="solid" padding="md">
            <Box gap="md">
              <Text variant="bodyMedium" weight="semibold">
                Suggerimenti
              </Text>

              <Box flexDirection="row" gap="sm">
                <Text style={{ fontSize: 20 }}>💡</Text>
                <Box flex={1}>
                  <Text variant="bodySmall">
                    La tua categoria più costosa è{' '}
                    <Text weight="semibold">
                      {categorySpendingData[0]?.category?.name || 'N/A'}
                    </Text>
                    . Considera di ridurre le spese in questa area.
                  </Text>
                </Box>
              </Box>

              <Box flexDirection="row" gap="sm">
                <Text style={{ fontSize: 20 }}>📊</Text>
                <Box flex={1}>
                  <Text variant="bodySmall">
                    Rispetto al mese scorso hai{' '}
                    <Text
                      weight="semibold"
                      color={monthlyComparison.currentMonth.expense <= monthlyComparison.previousMonth.expense ? 'success' : 'error'}
                    >
                      {monthlyComparison.currentMonth.expense <= monthlyComparison.previousMonth.expense
                        ? 'ridotto'
                        : 'aumentato'}
                    </Text>
                    {' '}le spese del{' '}
                    {Math.abs(
                      ((monthlyComparison.currentMonth.expense - monthlyComparison.previousMonth.expense) /
                        monthlyComparison.previousMonth.expense) *
                        100
                    ).toFixed(0)}
                    %.
                  </Text>
                </Box>
              </Box>

              <Box flexDirection="row" gap="sm">
                <Text style={{ fontSize: 20 }}>🎯</Text>
                <Box flex={1}>
                  <Text variant="bodySmall">
                    Per raggiungere i tuoi obiettivi, prova a risparmiare{' '}
                    <Text weight="semibold">€200</Text> in più questo mese.
                  </Text>
                </Box>
              </Box>
            </Box>
          </GlassCard>
        </Box>
      </ScrollContainer>
    </Screen>
  );
}
