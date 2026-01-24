/**
 * CalendarMonthView Component - Modern Design
 * Vista mensile stile TimeTree con eventi inline - fullscreen
 * FEATURE COMPONENT: Usa solo atoms e molecules del design system
 */

import React, { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { Box, Text, AnimatedPressable } from '@shared/ui';
import { useTheme } from '@shared/ui/theme';
import { eventColors, EventColor } from '@shared/ui/tokens';
import { CalendarEvent } from '../domain/types';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachWeekOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  getWeek,
} from 'date-fns';

interface CalendarMonthViewProps {
  selectedDate: string;
  events: CalendarEvent[];
  onSelectDate: (date: string) => void;
  onEventPress?: (event: CalendarEvent) => void;
}

interface WeekRow {
  weekNumber: number;
  days: Date[];
}

interface EventBar {
  event: CalendarEvent;
  startCol: number;
  span: number;
  row: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_WIDTH = SCREEN_WIDTH;
const DAY_WIDTH = GRID_WIDTH / 7;
const EVENT_HEIGHT = 16;
const EVENT_GAP = 1;
const MAX_VISIBLE_EVENTS = 2;
const DAY_NUMBER_HEIGHT = 22;

export function CalendarMonthView({
  selectedDate,
  events,
  onSelectDate,
  onEventPress,
}: CalendarMonthViewProps): JSX.Element {
  const { colors } = useTheme();
  const currentDate = parseISO(selectedDate);

  // Generate weeks for the month
  const weeks = useMemo((): WeekRow[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const weekStarts = eachWeekOfInterval(
      { start: calendarStart, end: calendarEnd },
      { weekStartsOn: 1 }
    );

    return weekStarts.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      return {
        weekNumber: getWeek(weekStart, { weekStartsOn: 1 }),
        days,
      };
    });
  }, [currentDate]);

  // Calculate event bars for each week
  const getEventBarsForWeek = (weekDays: Date[]): EventBar[] => {
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    const bars: EventBar[] = [];
    const rowOccupancy: boolean[][] = [];

    // Filter events that overlap with this week
    const weekEvents = events.filter((event) => {
      const eventStart = parseISO(event.startAt);
      const eventEnd = parseISO(event.endAt);
      return eventStart <= weekEnd && eventEnd >= weekStart;
    });

    // Sort events by start date, then by duration (longer first)
    weekEvents.sort((a, b) => {
      const startDiff = parseISO(a.startAt).getTime() - parseISO(b.startAt).getTime();
      if (startDiff !== 0) return startDiff;
      const durationA = parseISO(a.endAt).getTime() - parseISO(a.startAt).getTime();
      const durationB = parseISO(b.endAt).getTime() - parseISO(b.startAt).getTime();
      return durationB - durationA;
    });

    weekEvents.forEach((event) => {
      const eventStart = parseISO(event.startAt);
      const eventEnd = parseISO(event.endAt);

      // Calculate start column (0-6)
      let startCol = 0;
      for (let i = 0; i < 7; i++) {
        if (isSameDay(weekDays[i], eventStart) || weekDays[i] > eventStart) {
          startCol = eventStart < weekDays[0] ? 0 : i;
          break;
        }
      }

      // Calculate span
      let endCol = 6;
      for (let i = 6; i >= 0; i--) {
        if (isSameDay(weekDays[i], eventEnd) || weekDays[i] < eventEnd) {
          endCol = eventEnd > weekDays[6] ? 6 : i;
          break;
        }
      }

      const span = endCol - startCol + 1;

      // Find available row
      let row = 0;
      while (true) {
        if (!rowOccupancy[row]) {
          rowOccupancy[row] = new Array(7).fill(false);
        }

        let canPlace = true;
        for (let col = startCol; col <= endCol; col++) {
          if (rowOccupancy[row][col]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let col = startCol; col <= endCol; col++) {
            rowOccupancy[row][col] = true;
          }
          break;
        }
        row++;

        if (row >= MAX_VISIBLE_EVENTS) {
          row = -1;
          break;
        }
      }

      if (row >= 0) {
        bars.push({ event, startCol, span, row });
      }
    });

    return bars;
  };

  const weekDayNames = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

  return (
    <Box
      flex={1}
      style={{
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
        marginTop: 12,
      }}
    >
      {/* Week day headers */}
      <Box
        flexDirection="row"
        style={{
          paddingBottom: 8,
          paddingTop: 12,
          backgroundColor: '#f8fafc',
        }}
      >
        {weekDayNames.map((day, index) => (
          <Box
            key={day}
            alignItems="center"
            justifyContent="center"
            style={{ width: DAY_WIDTH }}
          >
            <Text
              variant="labelSmall"
              color={index >= 5 ? 'error' : 'textSecondary'}
              style={{ fontSize: 10, fontWeight: '600' }}
            >
              {day}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Weeks - flex to fill available space */}
      <Box flex={1}>
        {weeks.map((week, weekIndex) => {
          const eventBars = getEventBarsForWeek(week.days);

          return (
            <Box
              key={weekIndex}
              flex={1}
              style={{
                borderBottomWidth: 0.5,
                borderBottomColor: colors.separator,
              }}
            >
              {/* Day numbers row */}
              <Box flexDirection="row" style={{ height: DAY_NUMBER_HEIGHT }}>
                {week.days.map((day, dayIndex) => {
                  const isInMonth = isSameMonth(day, currentDate);
                  const isSelected = isSameDay(day, currentDate);
                  const isTodayDate = isToday(day);
                  const isWeekend = dayIndex >= 5;

                  return (
                    <AnimatedPressable
                      key={dayIndex}
                      onPress={() => onSelectDate(day.toISOString())}
                      haptic="light"
                      pressScale={0.95}
                      style={{ width: DAY_WIDTH, alignItems: 'center' }}
                    >
                      <Box
                        alignItems="center"
                        justifyContent="center"
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          backgroundColor: isSelected
                            ? colors.primary
                            : isTodayDate
                            ? colors.warning
                            : 'transparent',
                        }}
                      >
                        <Text
                          weight={isTodayDate || isSelected ? 'semibold' : 'regular'}
                          color={
                            isSelected
                              ? 'onPrimary'
                              : isTodayDate
                              ? 'onPrimary'
                              : !isInMonth
                              ? 'textTertiary'
                              : isWeekend
                              ? 'error'
                              : 'textPrimary'
                          }
                          style={{ fontSize: 13 }}
                        >
                          {format(day, 'd')}
                        </Text>
                      </Box>
                    </AnimatedPressable>
                  );
                })}
              </Box>

              {/* Events area */}
              <Box flex={1} style={{ position: 'relative' }}>
                {eventBars.map((bar, barIndex) => (
                  <AnimatedPressable
                    key={`${bar.event.id}-${barIndex}`}
                    onPress={() => onEventPress?.(bar.event)}
                    haptic="light"
                    pressScale={0.98}
                    style={{
                      position: 'absolute',
                      left: bar.startCol * DAY_WIDTH,
                      top: bar.row * (EVENT_HEIGHT + EVENT_GAP),
                      width: bar.span * DAY_WIDTH - 2,
                      height: EVENT_HEIGHT,
                      backgroundColor: eventColors[bar.event.color as EventColor] || eventColors.blue,
                      borderRadius: 4,
                      paddingHorizontal: 4,
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 10,
                        fontWeight: '600',
                        color: '#FFFFFF',
                      }}
                    >
                      {bar.event.title}
                    </Text>
                  </AnimatedPressable>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
