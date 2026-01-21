/**
 * WeeklyOverview Organism
 * Overview settimanale con eventi e statistiche
 *
 * ORGANISM: compone ATOMI + MOLECOLE, zero tag nativi
 */

import React from 'react';
import { Box, Text, Icon, GlassCard, AnimatedPressable, IconName } from '../atoms';
import { AnimatedBar } from '../atoms/AnimatedBar';
import { AnimatedNumber } from '../atoms/AnimatedNumber';
import { SemanticColorKey } from '../tokens';

export interface DayOverview {
  date: string;
  dayLabel: string;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  eventCount: number;
  hasImportantEvent: boolean;
}

export interface WeekStat {
  label: string;
  value: number;
  icon: IconName;
  color: SemanticColorKey;
}

export interface WeeklyOverviewProps {
  /** Giorni della settimana */
  days: DayOverview[];
  /** Statistiche della settimana */
  stats?: WeekStat[];
  /** Callback selezione giorno */
  onDayPress: (date: string) => void;
  /** Titolo (es. "Questa settimana") */
  title?: string;
  /** Test ID */
  testID?: string;
}

export function WeeklyOverview({
  days,
  stats = [],
  onDayPress,
  title = 'Questa settimana',
  testID,
}: WeeklyOverviewProps): JSX.Element {
  const maxEvents = Math.max(...days.map((d) => d.eventCount), 1);

  return (
    <GlassCard variant="solid" padding="lg" testID={testID}>
      <Box gap="lg">
        {/* Header */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text variant="bodyMedium" weight="semibold">
            {title}
          </Text>
          {stats.length > 0 && (
            <Box flexDirection="row" gap="md">
              {stats.map((stat, index) => (
                <Box key={index} flexDirection="row" alignItems="center" gap="xs">
                  <Icon name={stat.icon} size="xs" color={stat.color} />
                  <Text variant="caption" weight="semibold" color={stat.color}>
                    {stat.value}
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Week days */}
        <Box flexDirection="row" gap="xs">
          {days.map((day) => (
            <AnimatedPressable
              key={day.date}
              onPress={() => onDayPress(day.date)}
              haptic="selection"
              pressScale={0.95}
              accessibilityLabel={`${day.dayLabel} ${day.dayNumber}, ${day.eventCount} eventi`}
              accessibilityRole="button"
              accessibilityState={{ selected: day.isSelected }}
              style={{ flex: 1 }}
            >
              <Box
                alignItems="center"
                padding="sm"
                borderRadius="md"
                backgroundColor={
                  day.isSelected
                    ? 'primary'
                    : day.isToday
                    ? 'primaryLight'
                    : 'transparent'
                }
                gap="xs"
              >
                {/* Day label */}
                <Text
                  variant="caption"
                  color={day.isSelected ? 'onPrimary' : 'textTertiary'}
                  weight="medium"
                >
                  {day.dayLabel}
                </Text>

                {/* Day number */}
                <Text
                  variant="bodyMedium"
                  weight={day.isToday || day.isSelected ? 'bold' : 'regular'}
                  color={
                    day.isSelected
                      ? 'onPrimary'
                      : day.isToday
                      ? 'primary'
                      : 'textPrimary'
                  }
                >
                  {day.dayNumber}
                </Text>

                {/* Event indicator bar */}
                <Box width="100%" height={4}>
                  {day.eventCount > 0 && (
                    <AnimatedBar
                      value={(day.eventCount / maxEvents) * 100}
                      size="xs"
                      color={
                        day.isSelected
                          ? 'onPrimary'
                          : day.hasImportantEvent
                          ? 'error'
                          : 'primary'
                      }
                      delay={days.indexOf(day) * 50}
                    />
                  )}
                </Box>

                {/* Important event dot */}
                {day.hasImportantEvent && !day.isSelected && (
                  <Box
                    position="absolute"
                    top={4}
                    right={4}
                    width={6}
                    height={6}
                    borderRadius="full"
                    backgroundColor="error"
                  />
                )}
              </Box>
            </AnimatedPressable>
          ))}
        </Box>
      </Box>
    </GlassCard>
  );
}

/**
 * MonthProgress
 * Progresso del mese corrente
 */
export interface MonthProgressProps {
  /** Giorno corrente */
  currentDay: number;
  /** Giorni totali nel mese */
  totalDays: number;
  /** Eventi completati */
  completedEvents: number;
  /** Eventi totali */
  totalEvents: number;
  /** Test ID */
  testID?: string;
}

export function MonthProgress({
  currentDay,
  totalDays,
  completedEvents,
  totalEvents,
  testID,
}: MonthProgressProps): JSX.Element {
  const monthProgress = (currentDay / totalDays) * 100;
  const eventProgress = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;

  return (
    <GlassCard variant="solid" padding="lg" testID={testID}>
      <Box gap="md">
        <Text variant="bodyMedium" weight="semibold">
          Progresso mese
        </Text>

        {/* Month progress */}
        <Box gap="xs">
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="caption" color="textSecondary">
              Giorno {currentDay} di {totalDays}
            </Text>
            <Text variant="caption" weight="semibold" color="primary">
              {Math.round(monthProgress)}%
            </Text>
          </Box>
          <AnimatedBar value={monthProgress} color="primary" size="sm" />
        </Box>

        {/* Events progress */}
        <Box gap="xs">
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="caption" color="textSecondary">
              Eventi completati
            </Text>
            <Text variant="caption" weight="semibold" color="success">
              {completedEvents}/{totalEvents}
            </Text>
          </Box>
          <AnimatedBar value={eventProgress} color="success" size="sm" delay={200} />
        </Box>
      </Box>
    </GlassCard>
  );
}
