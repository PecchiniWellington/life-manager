/**
 * ProgressStats Molecule
 * Statistiche di progresso con ring e barre animate
 *
 * MOLECULE: compone solo ATOMI, zero tag nativi
 */

import React from 'react';
import { Box, Text, GlassCard } from '../atoms';
import { AnimatedProgressRing } from '../atoms/AnimatedProgressRing';
import { AnimatedBar } from '../atoms/AnimatedBar';
import { AnimatedNumber } from '../atoms/AnimatedNumber';
import { SemanticColorKey } from '../tokens';

export interface ProgressItem {
  label: string;
  value: number;
  total: number;
  color: SemanticColorKey;
}

export interface ProgressStatsProps {
  /** Titolo */
  title?: string;
  /** Progresso principale (0-100) */
  mainProgress: number;
  /** Label progresso principale */
  mainLabel?: string;
  /** Numero completati (per mostrare X/Y nel ring) */
  completed?: number;
  /** Totale (per mostrare X/Y nel ring) */
  total?: number;
  /** Items di progresso secondari */
  items?: ProgressItem[];
  /** Colore principale */
  color?: SemanticColorKey;
  /** Test ID */
  testID?: string;
}

export function ProgressStats({
  title,
  mainProgress,
  mainLabel = 'Completato',
  completed,
  total,
  items = [],
  color = 'success',
  testID,
}: ProgressStatsProps): JSX.Element {
  return (
    <GlassCard variant="solid" padding="lg" testID={testID}>
      <Box gap="lg">
        {title && (
          <Text variant="headingSmall" weight="semibold">
            {title}
          </Text>
        )}

        {/* Main progress ring */}
        <Box flexDirection="row" alignItems="center" gap="lg">
          <AnimatedProgressRing
            progress={mainProgress}
            size="lg"
            color={color}
          >
            <Box alignItems="center">
              {completed !== undefined && total !== undefined ? (
                <Box alignItems="center">
                  <Text variant="headingMedium" weight="bold" color={color}>
                    {completed}
                  </Text>
                  <Text variant="caption" color="textTertiary">
                    di {total}
                  </Text>
                </Box>
              ) : (
                <Text variant="headingSmall" weight="bold" color="textPrimary">
                  {Math.round(mainProgress)}%
                </Text>
              )}
            </Box>
          </AnimatedProgressRing>

          <Box flex={1} gap="md">
            <Text variant="bodyMedium" color="textSecondary">
              {mainLabel}
            </Text>

            {/* Secondary items */}
            {items.map((item, index) => (
              <Box key={index} gap="xs">
                <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Text variant="bodySmall" color="textSecondary">
                    {item.label}
                  </Text>
                  <Text variant="bodySmall" weight="semibold" color={item.color}>
                    {item.value}/{item.total}
                  </Text>
                </Box>
                <AnimatedBar
                  value={item.total > 0 ? (item.value / item.total) * 100 : 0}
                  color={item.color}
                  size="xs"
                  delay={index * 100}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </GlassCard>
  );
}

/**
 * CompactProgressStats
 * Versione compatta per spazi ridotti
 */
export interface CompactProgressStatsProps {
  /** Items */
  items: Array<{
    label: string;
    value: number;
    color: SemanticColorKey;
  }>;
  /** Test ID */
  testID?: string;
}

export function CompactProgressStats({
  items,
  testID,
}: CompactProgressStatsProps): JSX.Element {
  return (
    <Box flexDirection="row" gap="md" testID={testID}>
      {items.map((item, index) => (
        <Box key={index} flex={1} alignItems="center" gap="sm">
          <AnimatedProgressRing
            progress={item.value}
            size="sm"
            color={item.color}
          >
            <Text variant="caption" weight="bold" color={item.color}>
              {Math.round(item.value)}
            </Text>
          </AnimatedProgressRing>
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {item.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
