/**
 * TodosScreen - NO TAG NATIVI
 * FEATURE COMPONENT: Usa solo atoms e molecules del design system
 * Features: AnimatedList, SwipeableRow, BottomSheet, SegmentedControl, ProgressStats
 */

import React, { useState, useCallback, useMemo } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  Screen,
  Box,
  Button,
  Icon,
  AnimatedList,
  AnimatedPressable,
  type ListAnimationPreset,
} from '@shared/ui';
import { ScreenTitle, EmptyState, ProgressStats, type ProgressItem } from '@shared/ui/molecules';
import { TodoItem, TodoFilters, TodoForm } from '../components';
import { useTodos } from '../hooks';
import { Todo, CreateTodoPayload, UpdateTodoPayload } from '../domain/types';
import { SpaceSelector, CreateSpaceModal, SpaceSettingsModal, PendingInvitesModal } from '@features/spaces';
import { Space } from '@features/spaces/domain/types';

export function TodosScreen(): JSX.Element {
  const {
    todos,
    filter,
    availableTags,
    countByStatus,
    hasActiveFilters,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleStatus,
    setStatusFilter,
    setPriorityFilter,
    setSearchFilter,
    clearFilters,
  } = useTodos();

  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [showSpaceSettings, setShowSpaceSettings] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showInvites, setShowInvites] = useState(false);

  const handleOpenSpaceSettings = useCallback((space: Space) => {
    setSelectedSpace(space);
    setShowSpaceSettings(true);
  }, []);

  const handleCloseSpaceSettings = useCallback(() => {
    setShowSpaceSettings(false);
    setSelectedSpace(null);
  }, []);

  // Calculate progress
  const totalTodos = countByStatus.todo + countByStatus.doing + countByStatus.done;
  const completionProgress = totalTodos > 0 ? (countByStatus.done / totalTodos) * 100 : 0;

  // Progress items for the chart
  const progressItems: ProgressItem[] = useMemo(
    () => [
      {
        label: 'Completati',
        value: countByStatus.done,
        total: totalTodos,
        color: 'success',
      },
      {
        label: 'In corso',
        value: countByStatus.doing,
        total: totalTodos,
        color: 'warning',
      },
      {
        label: 'Da fare',
        value: countByStatus.todo,
        total: totalTodos,
        color: 'primary',
      },
    ],
    [countByStatus, totalTodos]
  );

  const handleTodoPress = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  }, []);

  const handleAddTodo = useCallback(() => {
    setEditingTodo(null);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingTodo(null);
  }, []);

  const handleSubmit = useCallback(
    async (payload: CreateTodoPayload) => {
      if (editingTodo) {
        return updateTodo({ id: editingTodo.id, ...payload } as UpdateTodoPayload);
      }
      return createTodo(payload);
    },
    [editingTodo, createTodo, updateTodo]
  );

  const handleDeleteTodo = useCallback(
    (id: string) => {
      deleteTodo(id);
    },
    [deleteTodo]
  );

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  // Render item per AnimatedList
  const renderTodoItem = useCallback(
    ({ item }: { item: Todo }) => (
      <TodoItem
        todo={item}
        onPress={handleTodoPress}
        onToggleStatus={toggleStatus}
        onDelete={handleDeleteTodo}
      />
    ),
    [handleTodoPress, toggleStatus, handleDeleteTodo]
  );

  // Key extractor
  const keyExtractor = useCallback((item: Todo) => item.id, []);

  // Item separator
  const ItemSeparator = useCallback(() => <Box height={8} />, []);

  // Animation preset
  const animationPreset: ListAnimationPreset = 'fadeUp';

  return (
    <Screen paddingHorizontal="lg">
      {/* Header */}
      <ScreenTitle
        title="Todo"
        topContent={
          <SpaceSelector
            onCreateSpace={() => setShowCreateSpace(true)}
            onOpenSettings={handleOpenSpaceSettings}
            onOpenInvites={() => setShowInvites(true)}
          />
        }
        subtitle={`${countByStatus.doing} in corso, ${countByStatus.todo} da fare`}
        rightAction={
          <Box flexDirection="row" gap="sm">
            <AnimatedPressable
              onPress={toggleFilters}
              haptic="light"
              pressScale={0.9}
              accessibilityLabel="Mostra filtri"
              accessibilityRole="button"
            >
              <Box
                padding="sm"
                backgroundColor={showFilters ? 'primaryLight' : 'transparent'}
                borderRadius="md"
              >
                <Icon
                  name="filter"
                  size="md"
                  color={hasActiveFilters || showFilters ? 'primary' : 'textSecondary'}
                />
              </Box>
            </AnimatedPressable>
            <Button
              title="Nuovo"
              size="sm"
              onPress={handleAddTodo}
              accessibilityLabel="Aggiungi nuovo todo"
              leftIcon={<Icon name="add" size="sm" color="onPrimary" />}
            />
          </Box>
        }
      />

      {/* Progress Stats - only show when there are todos */}
      {totalTodos > 0 && !showFilters && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
          <Box marginBottom="lg">
            <ProgressStats
              title="Il tuo progresso"
              mainProgress={completionProgress}
              mainLabel={`${countByStatus.done} di ${totalTodos} completati`}
              items={progressItems}
              color="primary"
            />
          </Box>
        </Animated.View>
      )}

      {/* Filters con animazione */}
      {showFilters && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <Box marginBottom="lg">
            <TodoFilters
              filter={filter}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              onSearchChange={setSearchFilter}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </Box>
        </Animated.View>
      )}

      {/* Todo list con AnimatedList */}
      {todos.length === 0 ? (
        <EmptyState
          icon="todo"
          title={hasActiveFilters ? 'Nessun risultato' : 'Nessun todo'}
          description={
            hasActiveFilters
              ? 'Prova a modificare i filtri'
              : 'Inizia aggiungendo il tuo primo todo'
          }
          actionLabel={hasActiveFilters ? 'Rimuovi filtri' : 'Aggiungi todo'}
          onAction={hasActiveFilters ? clearFilters : handleAddTodo}
        />
      ) : (
        <AnimatedList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparator}
          animation={animationPreset}
          staggerDelay="fast"
          maxStaggerItems={15}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Form BottomSheet */}
      <TodoForm
        visible={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingTodo}
        availableTags={availableTags}
      />

      {/* Create space modal */}
      <CreateSpaceModal
        visible={showCreateSpace}
        onClose={() => setShowCreateSpace(false)}
      />

      {/* Space settings modal */}
      <SpaceSettingsModal
        visible={showSpaceSettings}
        space={selectedSpace}
        onClose={handleCloseSpaceSettings}
      />

      {/* Pending invites modal */}
      <PendingInvitesModal
        visible={showInvites}
        onClose={() => setShowInvites(false)}
      />
    </Screen>
  );
}
