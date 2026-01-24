/**
 * TodoItem Component - Modern Design
 * Stile coerente con TransactionItem
 * FEATURE COMPONENT: Usa solo atoms e molecules del design system
 */

import React, { useCallback } from 'react';
import {
  Box,
  Text,
  Icon,
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

// Colori per stato
const statusColors: Record<string, string> = {
  todo: '#3b82f6',
  doing: '#f59e0b',
  done: '#22c55e',
};

const statusBgColors: Record<string, string> = {
  todo: 'rgba(59, 130, 246, 0.12)',
  doing: 'rgba(245, 158, 11, 0.12)',
  done: 'rgba(34, 197, 94, 0.12)',
};

// Colori per priorità
const priorityColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280',
};

export function TodoItem({
  todo,
  onPress,
  onToggleStatus,
  onDelete,
}: TodoItemProps): JSX.Element {
  const isDone = todo.status === 'done';
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !isDone;
  const statusColor = statusColors[todo.status];
  const statusBgColor = statusBgColors[todo.status];

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
          alignItems="center"
          gap="md"
          padding="md"
          borderRadius="lg"
          backgroundColor="surface"
          borderWidth={1}
          borderColor="border"
          style={{ borderColor: 'rgba(0,0,0,0.04)' }}
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
              width={24}
              height={24}
              borderRadius="full"
              borderWidth={2}
              alignItems="center"
              justifyContent="center"
              style={{
                borderColor: statusColor,
                backgroundColor: isDone ? statusColor : 'transparent',
              }}
            >
              {isDone && <Icon name="check" size="xs" color="onSuccess" />}
            </Box>
          </AnimatedPressable>

          {/* Content */}
          <Box flex={1}>
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text
                variant="bodyMedium"
                weight="semibold"
                numberOfLines={1}
                style={{
                  flex: 1,
                  textDecorationLine: isDone ? 'line-through' : 'none',
                  opacity: isDone ? 0.5 : 1,
                }}
              >
                {todo.title}
              </Text>
              {!isDone && (
                <Box
                  borderRadius="sm"
                  paddingHorizontal="sm"
                  paddingVertical="xxs"
                  style={{ backgroundColor: statusBgColor }}
                >
                  <Text variant="caption" style={{ color: statusColor, fontSize: 10 }}>
                    {statusLabels[todo.status]}
                  </Text>
                </Box>
              )}
            </Box>
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginTop="xxs">
              <Box flexDirection="row" alignItems="center" gap="sm">
                {/* Priority indicator */}
                {!isDone && (
                  <Box flexDirection="row" alignItems="center" gap="xxs">
                    <Box
                      width={6}
                      height={6}
                      borderRadius="full"
                      style={{ backgroundColor: priorityColors[todo.priority] }}
                    />
                    <Text variant="caption" color="textSecondary">
                      {priorityLabels[todo.priority]}
                    </Text>
                  </Box>
                )}
                {/* Due date */}
                {todo.dueDate && (
                  <Text
                    variant="caption"
                    style={{ color: isOverdue ? '#ef4444' : '#9ca3af' }}
                  >
                    {formatRelativeDate(todo.dueDate)}
                  </Text>
                )}
                {/* Tags count */}
                {todo.tags.length > 0 && (
                  <Box flexDirection="row" alignItems="center" gap="xxs">
                    <Icon name="tag" size="xs" color="textTertiary" />
                    <Text variant="caption" color="textTertiary">
                      {todo.tags.length}
                    </Text>
                  </Box>
                )}
              </Box>
              {isDone && (
                <Text variant="caption" color="success">
                  Completato
                </Text>
              )}
            </Box>
          </Box>
        </Box>
      </AnimatedPressable>
    </SwipeableRow>
  );
}
