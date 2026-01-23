/**
 * TodoItem Component
 * Design pulito e moderno con stato visibile
 */

import React, { useCallback } from 'react';
import {
  Box,
  Text,
  Icon,
  Chip,
  SwipeableRow,
  AnimatedPressable,
  type SwipeAction,
} from '@shared/ui';
import { Todo, priorityLabels, statusLabels } from '../domain/types';
import { formatRelativeDate } from '@shared/lib/date';

interface TodoItemProps {
  todo: Todo;
  onPress: (todo: Todo) => void;
  onToggleStatus: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Intent per priorità
const priorityIntent = {
  high: 'error',
  medium: 'warning',
  low: 'info',
} as const;

// Intent per stato
const statusIntent = {
  todo: 'primary',
  doing: 'warning',
  done: 'success',
} as const;

export function TodoItem({
  todo,
  onPress,
  onToggleStatus,
  onDelete,
}: TodoItemProps): JSX.Element {
  const isDone = todo.status === 'done';
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !isDone;

  // Swipe actions
  const leftActions: SwipeAction[] = [
    {
      icon: isDone ? 'undo' : 'check',
      label: isDone ? 'Riapri' : 'Completa',
      color: 'success',
      onPress: () => onToggleStatus(todo.id),
    },
  ];

  const rightActions: SwipeAction[] = onDelete
    ? [
        {
          icon: 'delete',
          label: 'Elimina',
          color: 'error',
          onPress: () => onDelete(todo.id),
        },
      ]
    : [];

  const handlePress = useCallback(() => {
    onPress(todo);
  }, [onPress, todo]);

  const handleToggle = useCallback(() => {
    onToggleStatus(todo.id);
  }, [onToggleStatus, todo.id]);

  return (
    <SwipeableRow leftActions={leftActions} rightActions={rightActions}>
      <AnimatedPressable
        onPress={handlePress}
        haptic="light"
        pressScale={0.98}
        accessibilityLabel={todo.title}
        accessibilityRole="button"
      >
        <Box
          flexDirection="row"
          backgroundColor="surface"
          borderRadius="lg"
          padding="md"
          gap="md"
          alignItems="center"
          opacity={isDone ? 0.6 : 1}
        >
          {/* Checkbox */}
          <AnimatedPressable
            onPress={handleToggle}
            haptic="selection"
            pressScale={0.85}
            accessibilityLabel={isDone ? 'Segna come non completato' : 'Segna come completato'}
            accessibilityRole="checkbox"
          >
            <Box
              width={22}
              height={22}
              borderRadius="full"
              borderWidth={2}
              borderColor={isDone ? 'success' : 'border'}
              backgroundColor={isDone ? 'success' : 'transparent'}
              alignItems="center"
              justifyContent="center"
            >
              {isDone && <Icon name="check" size="xs" color="onSuccess" />}
            </Box>
          </AnimatedPressable>

          {/* Content */}
          <Box flex={1} gap="xs">
            <Text
              variant="bodyMedium"
              weight="medium"
              numberOfLines={2}
              decoration={isDone ? 'line-through' : undefined}
              color={isDone ? 'textTertiary' : 'textPrimary'}
            >
              {todo.title}
            </Text>

            {todo.description && (
              <Text
                variant="bodySmall"
                color="textTertiary"
                numberOfLines={1}
              >
                {todo.description}
              </Text>
            )}

            {/* Meta row: stato, priorità, data, tags */}
            <Box flexDirection="row" alignItems="center" gap="sm" flexWrap="wrap">
              {/* Status chip - sempre visibile */}
              <Chip
                label={statusLabels[todo.status]}
                size="sm"
                variant="soft"
                intent={statusIntent[todo.status]}
              />

              {/* Priority chip - solo se non completato */}
              {!isDone && (
                <Chip
                  label={priorityLabels[todo.priority]}
                  size="sm"
                  variant="outlined"
                  intent={priorityIntent[todo.priority]}
                />
              )}

              {/* Due date */}
              {todo.dueDate && (
                <Box flexDirection="row" alignItems="center" gap="xxs">
                  <Icon
                    name="calendar"
                    size="xs"
                    color={isOverdue ? 'error' : 'textTertiary'}
                  />
                  <Text
                    variant="caption"
                    color={isOverdue ? 'error' : 'textTertiary'}
                  >
                    {formatRelativeDate(todo.dueDate)}
                  </Text>
                </Box>
              )}

              {/* Tags */}
              {todo.tags.length > 0 && (
                <Box flexDirection="row" alignItems="center" gap="xxs">
                  <Icon name="tag" size="xs" color="textTertiary" />
                  <Text variant="caption" color="textTertiary">
                    {todo.tags.slice(0, 2).join(', ')}
                    {todo.tags.length > 2 && ` +${todo.tags.length - 2}`}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Chevron */}
          <Icon name="chevronRight" size="sm" color="textTertiary" />
        </Box>
      </AnimatedPressable>
    </SwipeableRow>
  );
}
