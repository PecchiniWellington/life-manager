/**
 * useTodos Hook
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  loadTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoStatus,
  setStatusFilter,
  setPriorityFilter,
  setTagsFilter,
  setSearchFilter,
  toggleShowCompleted,
  clearFilters,
  clearError,
  selectSortedFilteredTodos,
  selectTodoFilter,
  selectAvailableTags,
  selectIsTodosLoading,
  selectTodosError,
  selectTodosCountByStatus,
  selectUrgentTodos,
  selectHasActiveFilters,
} from '../store';
import { CreateTodoPayload, UpdateTodoPayload, TodoStatus, TodoPriority } from '../domain/types';

export function useTodos() {
  const dispatch = useAppDispatch();

  // Selectors
  const todos = useAppSelector(selectSortedFilteredTodos);
  const filter = useAppSelector(selectTodoFilter);
  const availableTags = useAppSelector(selectAvailableTags);
  const isLoading = useAppSelector(selectIsTodosLoading);
  const error = useAppSelector(selectTodosError);
  const countByStatus = useAppSelector(selectTodosCountByStatus);
  const urgentTodos = useAppSelector(selectUrgentTodos);
  const hasActiveFilters = useAppSelector(selectHasActiveFilters);

  // Load todos on mount
  useEffect(() => {
    dispatch(loadTodos());
  }, [dispatch]);

  // Actions
  const handleCreateTodo = useCallback(
    async (payload: CreateTodoPayload) => {
      const result = await dispatch(createTodo(payload));
      return createTodo.fulfilled.match(result);
    },
    [dispatch]
  );

  const handleUpdateTodo = useCallback(
    async (payload: UpdateTodoPayload) => {
      const result = await dispatch(updateTodo(payload));
      return updateTodo.fulfilled.match(result);
    },
    [dispatch]
  );

  const handleDeleteTodo = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteTodo(id));
      return deleteTodo.fulfilled.match(result);
    },
    [dispatch]
  );

  const handleToggleStatus = useCallback(
    async (id: string) => {
      const result = await dispatch(toggleTodoStatus(id));
      return toggleTodoStatus.fulfilled.match(result);
    },
    [dispatch]
  );

  // Filter actions
  const handleSetStatusFilter = useCallback(
    (status: TodoStatus | null) => {
      dispatch(setStatusFilter(status));
    },
    [dispatch]
  );

  const handleSetPriorityFilter = useCallback(
    (priority: TodoPriority | null) => {
      dispatch(setPriorityFilter(priority));
    },
    [dispatch]
  );

  const handleSetTagsFilter = useCallback(
    (tags: string[]) => {
      dispatch(setTagsFilter(tags));
    },
    [dispatch]
  );

  const handleSetSearchFilter = useCallback(
    (search: string) => {
      dispatch(setSearchFilter(search));
    },
    [dispatch]
  );

  const handleToggleShowCompleted = useCallback(() => {
    dispatch(toggleShowCompleted());
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    todos,
    filter,
    availableTags,
    isLoading,
    error,
    countByStatus,
    urgentTodos,
    hasActiveFilters,

    // Actions
    createTodo: handleCreateTodo,
    updateTodo: handleUpdateTodo,
    deleteTodo: handleDeleteTodo,
    toggleStatus: handleToggleStatus,

    // Filter actions
    setStatusFilter: handleSetStatusFilter,
    setPriorityFilter: handleSetPriorityFilter,
    setTagsFilter: handleSetTagsFilter,
    setSearchFilter: handleSetSearchFilter,
    toggleShowCompleted: handleToggleShowCompleted,
    clearFilters: handleClearFilters,
    clearError: handleClearError,
  };
}
