/**
 * TodosScreen - Modern Design
 * Stile coerente con WalletScreen
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  Screen,
  Box,
  Icon,
  Text,
  VStack,
  GlassCard,
} from '@shared/ui';
import { EmptyState } from '@shared/ui/molecules';
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
  const completionProgress = totalTodos > 0 ? Math.round((countByStatus.done / totalTodos) * 100) : 0;

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


  return (
    <Screen scroll paddingHorizontal="lg">
      {/* Space Selector */}
      <SpaceSelector
        onCreateSpace={() => setShowCreateSpace(true)}
        onOpenSettings={handleOpenSpaceSettings}
        onOpenInvites={() => setShowInvites(true)}
      />

      <VStack spacing="lg">
        {/* Stats Card with Add Button */}
        <Box
          borderRadius="xl"
          padding="md"
          style={styles.statsCard}
        >
          <Box gap="md">
            {/* Header row with stats and add button */}
            <Box flexDirection="row" alignItems="flex-start" justifyContent="space-between">
              <Box>
                <Text variant="caption" color="textSecondary">
                  Attività totali
                </Text>
                <Text variant="headingLarge" weight="bold" color="textPrimary" style={styles.statsText}>
                  {totalTodos}
                </Text>
                <Text variant="caption" color="textTertiary">
                  {completionProgress}% completato
                </Text>
              </Box>
              <Pressable
                onPress={handleAddTodo}
                style={styles.addButton}
                accessibilityLabel="Aggiungi nuovo todo"
              >
                <Icon name="add" size="md" color="onPrimary" />
              </Pressable>
            </Box>

            {/* Progress bar */}
            <Box>
              <Box height={8} borderRadius="full" backgroundColor="border" overflow="hidden">
                <Box
                  height={8}
                  borderRadius="full"
                  style={{
                    width: `${completionProgress}%`,
                    backgroundColor: '#22c55e',
                  }}
                />
              </Box>
            </Box>

            {/* Status breakdown */}
            <Box flexDirection="row" gap="sm">
              <Box flex={1} padding="sm" borderRadius="lg" style={styles.statusBox}>
                <Box flexDirection="row" alignItems="center" gap="xs" marginBottom="xs">
                  <Box width={8} height={8} borderRadius="full" style={{ backgroundColor: '#3b82f6' }} />
                  <Text variant="caption" color="textSecondary">Da fare</Text>
                </Box>
                <Text variant="bodyMedium" weight="bold" color="textPrimary">
                  {countByStatus.todo}
                </Text>
              </Box>
              <Box flex={1} padding="sm" borderRadius="lg" style={styles.statusBox}>
                <Box flexDirection="row" alignItems="center" gap="xs" marginBottom="xs">
                  <Box width={8} height={8} borderRadius="full" style={{ backgroundColor: '#f59e0b' }} />
                  <Text variant="caption" color="textSecondary">In corso</Text>
                </Box>
                <Text variant="bodyMedium" weight="bold" color="textPrimary">
                  {countByStatus.doing}
                </Text>
              </Box>
              <Box flex={1} padding="sm" borderRadius="lg" style={styles.statusBox}>
                <Box flexDirection="row" alignItems="center" gap="xs" marginBottom="xs">
                  <Box width={8} height={8} borderRadius="full" style={{ backgroundColor: '#22c55e' }} />
                  <Text variant="caption" color="textSecondary">Completati</Text>
                </Box>
                <Text variant="bodyMedium" weight="bold" color="textPrimary">
                  {countByStatus.done}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Filter toggle */}
        <Pressable onPress={toggleFilters}>
          <GlassCard variant="solid" padding="sm">
            <Box flexDirection="row" alignItems="center" gap="md">
              <Box
                width={40}
                height={40}
                borderRadius="lg"
                alignItems="center"
                justifyContent="center"
                style={{ backgroundColor: hasActiveFilters ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0,0,0,0.04)' }}
              >
                <Icon name="filter" size="sm" color={hasActiveFilters ? 'primary' : 'textSecondary'} />
              </Box>
              <Box flex={1}>
                <Text variant="bodySmall" weight="semibold" color="textPrimary">
                  Filtri
                </Text>
                <Text variant="caption" color="textSecondary">
                  {hasActiveFilters ? 'Filtri attivi' : 'Nessun filtro attivo'}
                </Text>
              </Box>
              <Icon name={showFilters ? 'chevronUp' : 'chevronDown'} size="sm" color="textTertiary" />
            </Box>
          </GlassCard>
        </Pressable>

        {/* Filters */}
        {showFilters && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
            <TodoFilters
              filter={filter}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              onSearchChange={setSearchFilter}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </Animated.View>
        )}

        {/* Todo list */}
        <Box>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="sm">
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Icon name="list" size="sm" color="textSecondary" />
              <Text variant="bodySmall" weight="semibold" color="textSecondary">
                ATTIVITÀ
              </Text>
            </Box>
            {todos.length > 0 && (
              <Text variant="caption" color="textTertiary">
                {todos.length} {todos.length === 1 ? 'attività' : 'attività'}
              </Text>
            )}
          </Box>

          {todos.length === 0 ? (
            <EmptyState
              icon="todo"
              title={hasActiveFilters ? 'Nessun risultato' : 'Nessuna attività'}
              description={
                hasActiveFilters
                  ? 'Prova a modificare i filtri'
                  : 'Inizia aggiungendo la tua prima attività'
              }
              actionLabel={hasActiveFilters ? 'Rimuovi filtri' : 'Aggiungi attività'}
              onAction={hasActiveFilters ? clearFilters : handleAddTodo}
            />
          ) : (
            <VStack spacing="xs">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onPress={handleTodoPress}
                  onToggleStatus={toggleStatus}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </VStack>
          )}
        </Box>

        {/* Bottom spacing */}
        <Box height={20} />
      </VStack>

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

const styles = StyleSheet.create({
  statsCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingTop: 20,
    marginTop: 12,
  },
  statsText: {
    fontSize: 32,
    letterSpacing: -0.5,
  },
  statusBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
