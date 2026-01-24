/**
 * RecurringItem Component
 * Item per visualizzare una transazione ricorrente - Design moderno con icone
 */

import React from 'react';
import { Box, Text, GlassCard, Icon, IconName, AnimatedPressable, appleColors, transactionColors } from '@shared/ui';
import { RecurringTransaction, Category, Account, RecurrenceFrequency } from '../domain/types';
import { format, parseISO, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

// Mapping category icons (per retrocompatibilità con emoji nel DB)
const categoryIconMap: Record<string, IconName> = {
  '🍔': 'food',
  '🍕': 'food',
  '🛒': 'shopping',
  '🚗': 'transport',
  '🚌': 'transport',
  '🎬': 'entertainment',
  '🎮': 'entertainment',
  '🏥': 'health',
  '💊': 'health',
  '📄': 'bills',
  '💡': 'bills',
  '💰': 'money',
  '💳': 'creditCard',
  '🏠': 'home',
  '📱': 'other',
  '💻': 'other',
  '🎓': 'education',
  '✈️': 'travel',
  '🎁': 'gift',
};

const getCategoryIcon = (iconEmoji: string | undefined, type: 'expense' | 'income'): IconName => {
  if (!iconEmoji) return type === 'expense' ? 'arrowUpCircle' : 'arrowDownCircle';
  return categoryIconMap[iconEmoji] || (type === 'expense' ? 'arrowUpCircle' : 'arrowDownCircle');
};

interface RecurringItemProps {
  recurring: RecurringTransaction;
  category?: Category | null;
  account?: Account | null;
  onPress?: () => void;
  onToggle?: (isActive: boolean) => void;
}

const frequencyLabels: Record<RecurrenceFrequency, string> = {
  daily: 'Giornaliero',
  weekly: 'Settimanale',
  biweekly: 'Bisettimanale',
  monthly: 'Mensile',
  yearly: 'Annuale',
};

export function RecurringItem({
  recurring,
  category,
  account,
  onPress,
}: RecurringItemProps): JSX.Element {
  const isExpense = recurring.type === 'expense';
  const nextDate = parseISO(recurring.nextExecution);
  const iconName = getCategoryIcon(category?.icon, recurring.type);
  const iconColor = category?.color || (isExpense ? appleColors.systemRed : appleColors.systemGreen);

  // Format next execution date
  const getNextExecutionText = () => {
    if (isToday(nextDate)) return 'Oggi';
    if (isTomorrow(nextDate)) return 'Domani';
    const days = differenceInDays(nextDate, new Date());
    if (days > 0 && days <= 7) return `Tra ${days} giorni`;
    return format(nextDate, 'd MMM', { locale: it });
  };

  // Determine status color
  const getStatusColor = () => {
    if (!recurring.isActive) return appleColors.systemGray;
    if (isToday(nextDate)) return appleColors.systemOrange;
    return appleColors.systemGreen;
  };

  const content = (
    <GlassCard variant="solid" padding="md">
      <Box flexDirection="row" alignItems="center" gap="md">
        {/* Category icon */}
        <Box
          width={44}
          height={44}
          borderRadius="lg"
          alignItems="center"
          justifyContent="center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon
            name={iconName}
            size="md"
            color={isExpense ? 'error' : 'success'}
          />
        </Box>

        {/* Info */}
        <Box flex={1}>
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Text variant="bodyMedium" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
              {recurring.note || category?.name || 'Transazione ricorrente'}
            </Text>
            {!recurring.isActive && (
              <Box
                flexDirection="row"
                alignItems="center"
                gap="xxs"
                padding="xxs"
                borderRadius="sm"
                backgroundColor="backgroundSecondary"
              >
                <Icon name="pause" size="xs" color="textSecondary" />
                <Text variant="caption" color="textSecondary">
                  Pausa
                </Text>
              </Box>
            )}
          </Box>

          <Box flexDirection="row" alignItems="center" gap="xs" marginTop="xxs">
            <Icon name="repeat" size="xs" color="textTertiary" />
            <Text variant="caption" color="textSecondary">
              {frequencyLabels[recurring.frequency]}
            </Text>
            {account && (
              <>
                <Text variant="caption" color="textTertiary">•</Text>
                <Icon name="creditCard" size="xs" color="textTertiary" />
                <Text variant="caption" color="textSecondary">
                  {account.name}
                </Text>
              </>
            )}
          </Box>
        </Box>

        {/* Amount and next date */}
        <Box alignItems="flex-end">
          <Text
            variant="bodyMedium"
            weight="bold"
            color={isExpense ? 'error' : 'success'}
          >
            {isExpense ? '-' : '+'}€{recurring.amount.toFixed(2)}
          </Text>
          <Box flexDirection="row" alignItems="center" gap="xxs" marginTop="xxs">
            <Box
              width={6}
              height={6}
              borderRadius="full"
              style={{ backgroundColor: getStatusColor() }}
            />
            <Text variant="caption" color="textSecondary">
              {getNextExecutionText()}
            </Text>
          </Box>
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

/**
 * RecurringStats Component
 * Mostra un riepilogo delle transazioni ricorrenti - Design moderno
 */
interface RecurringStatsProps {
  recurring: RecurringTransaction[];
  onPress?: () => void;
}

export function RecurringStats({ recurring, onPress }: RecurringStatsProps): JSX.Element {
  const active = recurring.filter(r => r.isActive);

  const monthlyExpenses = active
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => {
      switch (r.frequency) {
        case 'daily': return sum + (r.amount * 30);
        case 'weekly': return sum + (r.amount * 4);
        case 'biweekly': return sum + (r.amount * 2);
        case 'monthly': return sum + r.amount;
        case 'yearly': return sum + (r.amount / 12);
        default: return sum + r.amount;
      }
    }, 0);

  const monthlyIncome = active
    .filter(r => r.type === 'income')
    .reduce((sum, r) => {
      switch (r.frequency) {
        case 'daily': return sum + (r.amount * 30);
        case 'weekly': return sum + (r.amount * 4);
        case 'biweekly': return sum + (r.amount * 2);
        case 'monthly': return sum + r.amount;
        case 'yearly': return sum + (r.amount / 12);
        default: return sum + r.amount;
      }
    }, 0);

  const dueToday = active.filter(r => isToday(parseISO(r.nextExecution))).length;
  const netMonthly = monthlyIncome - monthlyExpenses;

  if (active.length === 0) {
    const emptyContent = (
      <GlassCard variant="solid" padding="sm">
        <Box flexDirection="row" alignItems="center" gap="md">
          <Box
            width={40}
            height={40}
            borderRadius="lg"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
          >
            <Icon name="repeat" size="sm" color="primary" />
          </Box>
          <Box flex={1}>
            <Text variant="bodySmall" weight="semibold" color="textPrimary">
              Pagamenti ricorrenti
            </Text>
            <Text variant="caption" color="textSecondary">
              Nessuna transazione attiva
            </Text>
          </Box>
          {onPress && (
            <Text variant="caption" color="primary" weight="semibold">
              + Aggiungi
            </Text>
          )}
        </Box>
      </GlassCard>
    );

    return onPress ? <Pressable onPress={onPress}>{emptyContent}</Pressable> : emptyContent;
  }

  const content = (
    <GlassCard variant="solid" padding="sm">
      <Box flexDirection="row" alignItems="center" gap="md">
        <Box
          width={40}
          height={40}
          borderRadius="lg"
          alignItems="center"
          justifyContent="center"
          style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
        >
          <Icon name="repeat" size="sm" color="primary" />
        </Box>
        <Box flex={1}>
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Text variant="bodySmall" weight="semibold" color="textPrimary">
              {active.length} ricorrent{active.length === 1 ? 'e' : 'i'}
            </Text>
            {dueToday > 0 && (
              <Box
                flexDirection="row"
                alignItems="center"
                gap="xxs"
                paddingHorizontal="xs"
                borderRadius="full"
                style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}
              >
                <Text variant="caption" style={{ color: appleColors.systemOrange, fontSize: 11 }}>
                  {dueToday} oggi
                </Text>
              </Box>
            )}
          </Box>
          <Text variant="caption" color="textSecondary">
            -€{monthlyExpenses.toFixed(0)} · +€{monthlyIncome.toFixed(0)} /mese
          </Text>
        </Box>
        <Icon name="chevronRight" size="sm" color="textTertiary" />
      </Box>
    </GlassCard>
  );

  return onPress ? (
    <AnimatedPressable onPress={onPress} haptic="light" pressScale={0.98}>
      {content}
    </AnimatedPressable>
  ) : content;
}

