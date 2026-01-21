/**
 * StatCard Molecule
 * Card per mostrare statistiche con animazioni
 *
 * MOLECULE: compone solo ATOMI, zero tag nativi
 */

import React from 'react';
import {
  Box,
  Text,
  Icon,
  IconName,
  GlassCard,
  AnimatedPressable,
} from '../atoms';
import { AnimatedNumber } from '../atoms/AnimatedNumber';
import { AnimatedProgressRing } from '../atoms/AnimatedProgressRing';
import { AnimatedBar } from '../atoms/AnimatedBar';
import { SemanticColorKey } from '../tokens';

export type StatCardVariant = 'simple' | 'progress' | 'comparison' | 'trend';
export type StatCardSize = 'sm' | 'md' | 'lg';
export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatCardProps {
  /** Titolo della stat */
  title: string;
  /** Valore principale */
  value: number;
  /** Formato valore */
  format?: 'integer' | 'decimal' | 'currency' | 'percent';
  /** Prefisso (es. "€") */
  prefix?: string;
  /** Suffisso */
  suffix?: string;
  /** Variante */
  variant?: StatCardVariant;
  /** Dimensione */
  size?: StatCardSize;
  /** Icona */
  icon?: IconName;
  /** Colore accent */
  color?: SemanticColorKey;
  /** Progresso (0-100) per variant="progress" */
  progress?: number;
  /** Valore precedente per confronto */
  previousValue?: number;
  /** Direzione trend */
  trend?: TrendDirection;
  /** Percentuale trend */
  trendPercent?: number;
  /** Callback on press */
  onPress?: () => void;
  /** Test ID */
  testID?: string;
}

const sizeConfig = {
  sm: {
    padding: 'md' as const,
    titleVariant: 'caption' as const,
    valueVariant: 'headingSmall' as const,
    ringSize: 'sm' as const,
    iconSize: 'sm' as const,
  },
  md: {
    padding: 'lg' as const,
    titleVariant: 'bodySmall' as const,
    valueVariant: 'headingMedium' as const,
    ringSize: 'md' as const,
    iconSize: 'md' as const,
  },
  lg: {
    padding: 'xl' as const,
    titleVariant: 'bodyMedium' as const,
    valueVariant: 'headingLarge' as const,
    ringSize: 'lg' as const,
    iconSize: 'lg' as const,
  },
};

export function StatCard({
  title,
  value,
  format = 'integer',
  prefix = '',
  suffix = '',
  variant = 'simple',
  size = 'md',
  icon,
  color = 'primary',
  progress,
  previousValue,
  trend,
  trendPercent,
  onPress,
  testID,
}: StatCardProps): JSX.Element {
  const config = sizeConfig[size];

  // Calculate trend if not provided
  const computedTrend =
    trend ??
    (previousValue !== undefined
      ? value > previousValue
        ? 'up'
        : value < previousValue
        ? 'down'
        : 'neutral'
      : undefined);

  const computedTrendPercent =
    trendPercent ??
    (previousValue !== undefined && previousValue !== 0
      ? Math.abs(((value - previousValue) / previousValue) * 100)
      : undefined);

  const trendColor: SemanticColorKey =
    computedTrend === 'up' ? 'success' : computedTrend === 'down' ? 'error' : 'textSecondary';

  const trendIcon: IconName =
    computedTrend === 'up' ? 'trending' : computedTrend === 'down' ? 'trendingDown' : 'remove';

  const content = (
    <GlassCard variant="solid" padding={config.padding} testID={testID}>
      <Box gap="sm">
        {/* Header with icon and title */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box flexDirection="row" alignItems="center" gap="sm">
            {icon && (
              <Box
                width={32}
                height={32}
                borderRadius="md"
                backgroundColor={`${color}Light` as SemanticColorKey}
                alignItems="center"
                justifyContent="center"
              >
                <Icon name={icon} size={config.iconSize} color={color} />
              </Box>
            )}
            <Text variant={config.titleVariant} color="textSecondary">
              {title}
            </Text>
          </Box>

          {/* Trend indicator */}
          {computedTrend && computedTrendPercent !== undefined && (
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Icon name={trendIcon} size="xs" color={trendColor} />
              <Text variant="caption" color={trendColor} weight="semibold">
                {computedTrendPercent.toFixed(1)}%
              </Text>
            </Box>
          )}
        </Box>

        {/* Value section */}
        {variant === 'progress' && progress !== undefined ? (
          <Box flexDirection="row" alignItems="center" gap="lg">
            <AnimatedProgressRing
              progress={progress}
              size={config.ringSize}
              color={color}
            >
              <Text variant="caption" color="textSecondary" weight="semibold">
                {Math.round(progress)}%
              </Text>
            </AnimatedProgressRing>
            <Box flex={1}>
              <AnimatedNumber
                value={value}
                format={format}
                prefix={prefix}
                suffix={suffix}
                variant={config.valueVariant}
                color="textPrimary"
              />
              {previousValue !== undefined && (
                <Text variant="caption" color="textTertiary">
                  su {prefix}{previousValue.toLocaleString('it-IT')}{suffix}
                </Text>
              )}
            </Box>
          </Box>
        ) : variant === 'comparison' && previousValue !== undefined ? (
          <Box gap="sm">
            <AnimatedNumber
              value={value}
              format={format}
              prefix={prefix}
              suffix={suffix}
              variant={config.valueVariant}
              color="textPrimary"
            />
            <AnimatedBar
              value={(value / Math.max(value, previousValue)) * 100}
              color={color}
              size="sm"
            />
            <Box flexDirection="row" justifyContent="space-between">
              <Text variant="caption" color="textTertiary">
                Attuale
              </Text>
              <Text variant="caption" color="textTertiary">
                Precedente: {prefix}{previousValue.toLocaleString('it-IT')}{suffix}
              </Text>
            </Box>
          </Box>
        ) : (
          <AnimatedNumber
            value={value}
            format={format}
            prefix={prefix}
            suffix={suffix}
            variant={config.valueVariant}
            color="textPrimary"
          />
        )}
      </Box>
    </GlassCard>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        haptic="light"
        pressScale={0.98}
        accessibilityLabel={`${title}: ${prefix}${value}${suffix}`}
        accessibilityRole="button"
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}
