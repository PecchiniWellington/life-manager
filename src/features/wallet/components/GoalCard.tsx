/**
 * GoalCard Component
 * Mostra un obiettivo di risparmio con progress ring - Design moderno con icone
 * FEATURE COMPONENT: Usa solo atoms e molecules del design system
 */

import React from 'react';
import { Box, Text, GlassCard, Icon, IconName, AnimatedPressable, appleColors, progressColors } from '@shared/ui';
import { SavingsGoal } from '../domain/types';
import { parseISO, differenceInDays } from 'date-fns';

// Mapping goal icons (per retrocompatibilità con emoji nel DB)
const goalIconMap: Record<string, IconName> = {
  '🎯': 'target',
  '💰': 'money',
  '🏠': 'home',
  '🚗': 'transport',
  '✈️': 'travel',
  '📱': 'other',
  '💻': 'other',
  '🎓': 'education',
  '💍': 'gift',
  '👶': 'heart',
  '🏖️': 'travel',
  '🎁': 'gift',
  '🏋️': 'health',
  '📚': 'education',
  '💳': 'creditCard',
  '🏦': 'bankAccount',
  '💵': 'money',
  '📈': 'trending',
};

const getGoalIcon = (iconEmoji: string | undefined): IconName => {
  if (!iconEmoji) return 'target';
  return goalIconMap[iconEmoji] || 'target';
};

interface GoalCardProps {
  goal: SavingsGoal;
  onPress?: () => void;
  compact?: boolean;
}

export function GoalCard({ goal, onPress, compact = false }: GoalCardProps): JSX.Element {
  const progress = goal.targetAmount > 0
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.status === 'completed' || goal.currentAmount >= goal.targetAmount;
  const iconName = getGoalIcon(goal.icon);
  const goalColor = goal.color || appleColors.systemBlue;

  // Calculate days remaining
  const daysRemaining = goal.deadline
    ? differenceInDays(parseISO(goal.deadline), new Date())
    : null;

  // Get progress color
  const getProgressColor = () => {
    if (isCompleted) return appleColors.systemGreen;
    if (progress >= 75) return appleColors.systemGreen;
    if (progress >= 50) return appleColors.systemYellow;
    if (progress >= 25) return appleColors.systemOrange;
    return goalColor;
  };

  if (compact) {
    const compactContent = (
      <GlassCard variant="solid" padding="sm">
        <Box flexDirection="row" alignItems="center" gap="sm">
          {/* Icon */}
          <Box
            width={36}
            height={36}
            borderRadius="md"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: `${goalColor}15` }}
          >
            <Icon name={iconName} size="sm" color="primary" />
          </Box>

          {/* Info */}
          <Box flex={1}>
            <Text variant="bodySmall" weight="semibold" numberOfLines={1}>
              {goal.name}
            </Text>
            <Text variant="caption" color="textSecondary">
              €{goal.currentAmount.toFixed(0)} / €{goal.targetAmount.toFixed(0)}
            </Text>
          </Box>

          {/* Progress percentage */}
          <Text
            variant="bodySmall"
            weight="bold"
            style={{ color: getProgressColor() }}
          >
            {progress.toFixed(0)}%
          </Text>
        </Box>

        {/* Progress bar */}
        <Box marginTop="xs">
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
                width: `${progress}%`,
                backgroundColor: getProgressColor(),
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
        {/* Header */}
        <Box flexDirection="row" alignItems="flex-start" gap="md">
          {/* Icon */}
          <Box
            width={48}
            height={48}
            borderRadius="lg"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: `${goalColor}15` }}
          >
            <Icon name={iconName} size="lg" color="primary" />
          </Box>

          {/* Title and status */}
          <Box flex={1}>
            <Text variant="bodyMedium" weight="semibold">
              {goal.name}
            </Text>
            {goal.deadline && (
              <Box flexDirection="row" alignItems="center" gap="xxs">
                <Icon name="calendar" size="xs" color="textSecondary" />
                <Text variant="caption" color="textSecondary">
                  {daysRemaining !== null && daysRemaining > 0
                    ? `${daysRemaining} giorni rimanenti`
                    : daysRemaining === 0
                    ? 'Scade oggi'
                    : 'Scaduto'}
                </Text>
              </Box>
            )}
            {isCompleted && (
              <Box flexDirection="row" alignItems="center" gap="xxs">
                <Icon name="checkCircle" size="xs" color="success" />
                <Text variant="caption" color="success" weight="semibold">
                  Obiettivo raggiunto!
                </Text>
              </Box>
            )}
          </Box>

          {/* Progress circle */}
          <Box alignItems="center">
            <Box
              width={56}
              height={56}
              borderRadius="full"
              alignItems="center"
              justifyContent="center"
              borderWidth={4}
              style={{ borderColor: getProgressColor() }}
            >
              <Text
                variant="bodySmall"
                weight="bold"
                style={{ color: getProgressColor() }}
              >
                {progress.toFixed(0)}%
              </Text>
            </Box>
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
                width: `${progress}%`,
                backgroundColor: getProgressColor(),
              }}
            />
          </Box>

          {/* Amounts */}
          <Box flexDirection="row" justifyContent="space-between">
            <Box flexDirection="row" alignItems="center" gap="xxs">
              <Icon name="arrowUpCircle" size="xs" color="textSecondary" />
              <Text variant="caption" color="textSecondary">
                €{goal.currentAmount.toFixed(2)}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="xxs">
              <Icon name="target" size="xs" color="textSecondary" />
              <Text variant="caption" color="textSecondary">
                €{goal.targetAmount.toFixed(2)}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Remaining amount */}
        {!isCompleted && (
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            gap="xs"
            padding="sm"
            borderRadius="md"
            backgroundColor="backgroundSecondary"
          >
            <Icon name="trending" size="sm" color="primary" />
            <Text variant="bodySmall" color="textSecondary">
              Mancano{' '}
              <Text variant="bodySmall" weight="bold" color="textPrimary">
                €{remaining.toFixed(2)}
              </Text>
            </Text>
          </Box>
        )}
      </Box>
    </GlassCard>
  );

  return onPress ? (
    <AnimatedPressable onPress={onPress} haptic="light" pressScale={0.98}>
      {fullContent}
    </AnimatedPressable>
  ) : fullContent;
}

/**
 * Mini goal progress for dashboard
 */
interface MiniGoalProgressProps {
  goals: SavingsGoal[];
  onPress?: () => void;
}

export function MiniGoalProgress({ goals, onPress }: MiniGoalProgressProps): JSX.Element {
  const activeGoals = goals.filter(g => g.status === 'active');
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  // Get progress color based on percentage
  const getProgressColor = () => {
    if (overallProgress >= 75) return progressColors.excellent;
    if (overallProgress >= 50) return progressColors.good;
    if (overallProgress >= 25) return progressColors.warning;
    return progressColors.neutral;
  };

  if (activeGoals.length === 0) {
    const emptyContent = (
      <GlassCard variant="solid" padding="sm">
        <Box flexDirection="row" alignItems="center" gap="md">
          <Box
            width={40}
            height={40}
            borderRadius="lg"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
          >
            <Icon name="target" size="sm" color="success" />
          </Box>
          <Box flex={1}>
            <Text variant="bodySmall" weight="semibold" color="textPrimary">
              Obiettivi di risparmio
            </Text>
            <Text variant="caption" color="textSecondary">
              Nessun obiettivo attivo
            </Text>
          </Box>
          {onPress && (
            <Text variant="caption" color="success" weight="semibold">
              + Crea
            </Text>
          )}
        </Box>
      </GlassCard>
    );

    return onPress ? (
      <AnimatedPressable onPress={onPress} haptic="light" pressScale={0.98}>
        {emptyContent}
      </AnimatedPressable>
    ) : emptyContent;
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
          style={{ backgroundColor: `${getProgressColor()}15` }}
        >
          <Icon name="target" size="sm" color="success" />
        </Box>
        <Box flex={1}>
          <Text variant="bodySmall" weight="semibold" color="textPrimary">
            {activeGoals.length} obiettiv{activeGoals.length === 1 ? 'o' : 'i'} · {overallProgress.toFixed(0)}%
          </Text>
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Box flex={1} height={4} borderRadius="full" backgroundColor="border" overflow="hidden">
              <Box
                height={4}
                borderRadius="full"
                style={{
                  width: `${Math.min(overallProgress, 100)}%`,
                  backgroundColor: getProgressColor(),
                }}
              />
            </Box>
            <Text variant="caption" color="textSecondary" style={{ minWidth: 70, textAlign: 'right' }}>
              €{totalCurrent.toLocaleString('it-IT')}
            </Text>
          </Box>
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
