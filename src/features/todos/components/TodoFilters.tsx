/**
 * TodoFilters Component - NO TAG NATIVI
 * MOLECULE: Usa solo atoms del design system
 * Features: SegmentedControl per status, AnimatedPressable per chips
 */

import React, { useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  Input,
  Icon,
  Chip,
  Text,
  SegmentedControl,
  AnimatedPressable,
  type SegmentedControlOption,
} from '@shared/ui';
import {
  TodoStatus,
  TodoPriority,
  TodoFilter,
  statusLabels,
  priorityLabels,
} from '../domain/types';

interface TodoFiltersProps {
  /** Filtro corrente */
  filter: TodoFilter;
  /** Callback cambio status */
  onStatusChange: (status: TodoStatus | null) => void;
  /** Callback cambio priorità */
  onPriorityChange: (priority: TodoPriority | null) => void;
  /** Callback cambio ricerca */
  onSearchChange: (search: string) => void;
  /** Callback reset filtri */
  onClearFilters: () => void;
  /** Se ci sono filtri attivi */
  hasActiveFilters: boolean;
}

export function TodoFilters({
  filter,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
}: TodoFiltersProps): JSX.Element {
  // Opzioni per SegmentedControl status (include "Tutti")
  const statusOptions: SegmentedControlOption<TodoStatus | 'all'>[] = useMemo(
    () => [
      { value: 'all', label: 'Tutti' },
      { value: 'todo', label: statusLabels.todo },
      { value: 'doing', label: statusLabels.doing },
      { value: 'done', label: statusLabels.done },
    ],
    []
  );

  // Priorità come chips selezionabili
  const priorityItems: Array<{ value: TodoPriority; label: string; color: 'error' | 'warning' | 'success' }> = useMemo(
    () => [
      { value: 'high', label: priorityLabels.high, color: 'error' },
      { value: 'medium', label: priorityLabels.medium, color: 'warning' },
      { value: 'low', label: priorityLabels.low, color: 'success' },
    ],
    []
  );

  const handleStatusChange = useCallback(
    (value: TodoStatus | 'all') => {
      onStatusChange(value === 'all' ? null : value);
    },
    [onStatusChange]
  );

  const handlePriorityToggle = useCallback(
    (priority: TodoPriority) => {
      onPriorityChange(filter.priority === priority ? null : priority);
    },
    [filter.priority, onPriorityChange]
  );

  return (
    <VStack spacing="md">
      {/* Search */}
      <Input
        placeholder="Cerca todo..."
        value={filter.search || ''}
        onChangeText={onSearchChange}
        leftIcon={<Icon name="search" size="sm" color="textTertiary" />}
        size="md"
      />

      {/* Status filter - SegmentedControl Apple-style */}
      <Box gap="xs">
        <Text variant="labelSmall" color="textSecondary">
          Stato
        </Text>
        <SegmentedControl
          options={statusOptions}
          value={filter.status || 'all'}
          onChange={handleStatusChange}
          size="md"
        />
      </Box>

      {/* Priority filter - Chips selezionabili */}
      <Box gap="xs">
        <Text variant="labelSmall" color="textSecondary">
          Priorità
        </Text>
        <Box flexDirection="row" gap="sm">
          {priorityItems.map((item) => {
            const isSelected = filter.priority === item.value;
            return (
              <AnimatedPressable
                key={item.value}
                onPress={() => handlePriorityToggle(item.value)}
                haptic="selection"
                pressScale={0.95}
              >
                <Chip
                  label={item.label}
                  size="md"
                  variant={isSelected ? 'filled' : 'outlined'}
                  intent={item.color}
                />
              </AnimatedPressable>
            );
          })}
        </Box>
      </Box>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <AnimatedPressable
          onPress={onClearFilters}
          haptic="light"
          pressScale={0.97}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            gap="xs"
            padding="sm"
            backgroundColor="surfaceSecondary"
            borderRadius="md"
          >
            <Icon name="close" size="sm" color="primary" />
            <Text variant="labelMedium" color="primary">
              Rimuovi filtri
            </Text>
          </Box>
        </AnimatedPressable>
      )}
    </VStack>
  );
}
