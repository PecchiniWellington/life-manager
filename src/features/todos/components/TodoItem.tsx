/**
 * TodoItem Component - NO TAG NATIVI
 * MOLECULE: Usa solo atoms del design system
 * Features: SwipeableRow per azioni, AnimatedPressable per feedback
 */

import React, { useCallback } from 'react';
import {
  Box,
  Text,
  Chip,
  Icon,
  SwipeableRow,
  AnimatedPressable,
  type SwipeAction,
} from '@shared/ui';
import { Todo, statusLabels, priorityLabels } from '../domain/types';
import { formatRelativeDate } from '@shared/lib/date';

interface TodoItemProps {
  /** Todo da visualizzare */
  todo: Todo;
  /** Callback pressione item */
  onPress: (todo: Todo) => void;
  /** Callback toggle status */
  onToggleStatus: (id: string) => void;
  /** Callback eliminazione */
  onDelete?: (id: string) => void;
}

export function TodoItem({
  todo,
  onPress,
  onToggleStatus,
  onDelete,
}: TodoItemProps): JSX.Element {
  const isDone = todo.status === 'done';
  const isOverdue =
    todo.dueDate && new Date(todo.dueDate) < new Date() && !isDone;

  const getPriorityIcon = useCallback(() => {
    switch (todo.priority) {
      case 'high':
        return 'priorityHigh' as const;
      case 'medium':
        return 'priorityMedium' as const;
      case 'low':
        return 'priorityLow' as const;
    }
  }, [todo.priority]);

  const getStatusIntent = useCallback(() => {
    switch (todo.status) {
      case 'todo':
        return 'default' as const;
      case 'doing':
        return 'warning' as const;
      case 'done':
        return 'success' as const;
    }
  }, [todo.status]);

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
    <SwipeableRow
      leftActions={leftActions}
      rightActions={rightActions}
    >
      <AnimatedPressable
        onPress={handlePress}
        haptic="light"
        pressScale={0.98}
        accessibilityLabel={todo.title}
        accessibilityHint={`${statusLabels[todo.status]}, priorità ${priorityLabels[todo.priority]}`}
        accessibilityRole="button"
      >
        <Box
          flexDirection="row"
          alignItems="flex-start"
          padding="md"
          backgroundColor="surface"
          borderRadius="card"
          gap="md"
          opacity={isDone ? 0.7 : 1}
        >
          {/* Checkbox / Status toggle */}
          <AnimatedPressable
            onPress={handleToggle}
            haptic="selection"
            pressScale={0.9}
            accessibilityLabel={isDone ? 'Segna come non completato' : 'Segna come completato'}
            accessibilityRole="checkbox"
          >
            <Box
              width={26}
              height={26}
              borderRadius="sm"
              borderWidth={2}
              borderColor={isDone ? 'success' : 'border'}
              backgroundColor={isDone ? 'success' : 'transparent'}
              alignItems="center"
              justifyContent="center"
            >
              {isDone && (
                <Icon name="check" size="xs" color="onSuccess" />
              )}
            </Box>
          </AnimatedPressable>

          {/* Content */}
          <Box flex={1} gap="xs">
            {/* Title */}
            <Text
              variant="bodyMedium"
              weight="medium"
              numberOfLines={2}
              decoration={isDone ? 'line-through' : undefined}
              color={isDone ? 'textSecondary' : 'textPrimary'}
            >
              {todo.title}
            </Text>

            {/* Description */}
            {todo.description && (
              <Text
                variant="bodySmall"
                color="textSecondary"
                numberOfLines={1}
              >
                {todo.description}
              </Text>
            )}

            {/* Meta info */}
            <Box flexDirection="row" alignItems="center" gap="sm" flexWrap="wrap">
              {/* Priority */}
              <Icon name={getPriorityIcon()} size="sm" />

              {/* Status chip */}
              <Chip
                label={statusLabels[todo.status]}
                size="sm"
                variant="soft"
                intent={getStatusIntent()}
              />

              {/* Due date */}
              {todo.dueDate && (
                <Box flexDirection="row" alignItems="center" gap="xs">
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
            </Box>

            {/* Tags */}
            {todo.tags.length > 0 && (
              <Box flexDirection="row" gap="xs" flexWrap="wrap" marginTop="xs">
                {todo.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="sm"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Chevron */}
          <Box alignSelf="center">
            <Icon name="chevronRight" size="sm" color="textTertiary" />
          </Box>
        </Box>
      </AnimatedPressable>
    </SwipeableRow>
  );
}
