/**
 * Todos Selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@app/store';
import { Todo, TodoStatus, TodoPriority } from '../domain/types';

/**
 * Base selectors
 */
const selectTodosState = (state: RootState) => state.todos;

export const selectAllTodoIds = (state: RootState) => state.todos.ids;
export const selectTodoEntities = (state: RootState) => state.todos.entities;
export const selectTodoFilter = (state: RootState) => state.todos.filter;
export const selectAvailableTags = (state: RootState) => state.todos.availableTags;
export const selectTodosStatus = (state: RootState) => state.todos.status;
export const selectTodosError = (state: RootState) => state.todos.error;

/**
 * Select all todos as array
 */
export const selectAllTodos = createSelector(
  [selectAllTodoIds, selectTodoEntities],
  (ids, entities): Todo[] => ids.map((id) => entities[id])
);

/**
 * Select todo by ID
 */
export const selectTodoById = (id: string) =>
  createSelector([selectTodoEntities], (entities) => entities[id] || null);

/**
 * Select filtered todos
 */
export const selectFilteredTodos = createSelector(
  [selectAllTodos, selectTodoFilter],
  (todos, filter): Todo[] => {
    let filtered = todos;

    // Filter by status
    if (filter.status) {
      filtered = filtered.filter((t) => t.status === filter.status);
    }

    // Filter completed if not showing
    if (!filter.showCompleted && !filter.status) {
      filtered = filtered.filter((t) => t.status !== 'done');
    }

    // Filter by priority
    if (filter.priority) {
      filtered = filtered.filter((t) => t.priority === filter.priority);
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((t) =>
        filter.tags!.some((tag) => t.tags.includes(tag))
      );
    }

    // Filter by search
    if (filter.search && filter.search.trim()) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }
);

/**
 * Select sorted filtered todos (by priority and due date)
 */
export const selectSortedFilteredTodos = createSelector(
  [selectFilteredTodos],
  (todos): Todo[] => {
    const priorityOrder: Record<TodoPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    return [...todos].sort((a, b) => {
      // First sort by status (todo first, then doing, then done)
      const statusOrder: Record<TodoStatus, number> = {
        doing: 0,
        todo: 1,
        done: 2,
      };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Then by priority (high first)
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by due date (earliest first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      // Finally by creation date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
);

/**
 * Select todos count by status
 */
export const selectTodosCountByStatus = createSelector(
  [selectAllTodos],
  (todos): Record<TodoStatus, number> => {
    return {
      todo: todos.filter((t) => t.status === 'todo').length,
      doing: todos.filter((t) => t.status === 'doing').length,
      done: todos.filter((t) => t.status === 'done').length,
    };
  }
);

/**
 * Select todos with due date today or overdue
 */
export const selectUrgentTodos = createSelector([selectAllTodos], (todos): Todo[] => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return todos.filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false;
    return new Date(t.dueDate) <= today;
  });
});

/**
 * Select if todos are loading
 */
export const selectIsTodosLoading = createSelector(
  [selectTodosStatus],
  (status) => status === 'loading'
);

/**
 * Select if any filter is active
 */
export const selectHasActiveFilters = createSelector(
  [selectTodoFilter],
  (filter): boolean => {
    return !!(
      filter.status !== null ||
      filter.priority !== null ||
      (filter.tags && filter.tags.length > 0) ||
      (filter.search && filter.search.trim().length > 0)
    );
  }
);
