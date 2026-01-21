/**
 * Todos Repository
 */

import { getStorageItem, setStorageItem, StorageKey } from '@shared/lib/storage';
import { generateId } from '@shared/lib/id';
import { Todo, CreateTodoPayload, UpdateTodoPayload } from '../domain/types';

/**
 * Get all todos
 */
export async function getAllTodos(): Promise<Todo[]> {
  const todos = await getStorageItem<Todo[]>(StorageKey.TODOS);
  return todos || [];
}

/**
 * Get todo by ID
 */
export async function getTodoById(id: string): Promise<Todo | null> {
  const todos = await getAllTodos();
  return todos.find((t) => t.id === id) || null;
}

/**
 * Create todo
 */
export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  const todos = await getAllTodos();
  const now = new Date().toISOString();

  const newTodo: Todo = {
    id: generateId(),
    title: payload.title,
    description: payload.description || '',
    status: payload.status || 'todo',
    priority: payload.priority || 'medium',
    dueDate: payload.dueDate || null,
    tags: payload.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  const updatedTodos = [...todos, newTodo];
  await setStorageItem(StorageKey.TODOS, updatedTodos);

  return newTodo;
}

/**
 * Update todo
 */
export async function updateTodo(payload: UpdateTodoPayload): Promise<Todo | null> {
  const todos = await getAllTodos();
  const index = todos.findIndex((t) => t.id === payload.id);

  if (index === -1) {
    return null;
  }

  const existingTodo = todos[index];
  const updatedTodo: Todo = {
    ...existingTodo,
    ...(payload.title !== undefined && { title: payload.title }),
    ...(payload.description !== undefined && { description: payload.description }),
    ...(payload.status !== undefined && { status: payload.status }),
    ...(payload.priority !== undefined && { priority: payload.priority }),
    ...(payload.dueDate !== undefined && { dueDate: payload.dueDate }),
    ...(payload.tags !== undefined && { tags: payload.tags }),
    updatedAt: new Date().toISOString(),
  };

  todos[index] = updatedTodo;
  await setStorageItem(StorageKey.TODOS, todos);

  return updatedTodo;
}

/**
 * Delete todo
 */
export async function deleteTodo(id: string): Promise<boolean> {
  const todos = await getAllTodos();
  const filteredTodos = todos.filter((t) => t.id !== id);

  if (filteredTodos.length === todos.length) {
    return false;
  }

  await setStorageItem(StorageKey.TODOS, filteredTodos);
  return true;
}

/**
 * Toggle todo status (todo -> doing -> done -> todo)
 */
export async function toggleTodoStatus(id: string): Promise<Todo | null> {
  const todo = await getTodoById(id);
  if (!todo) {
    return null;
  }

  const nextStatus = {
    todo: 'doing',
    doing: 'done',
    done: 'todo',
  } as const;

  return updateTodo({
    id,
    status: nextStatus[todo.status],
  });
}

/**
 * Mark todo as done
 */
export async function markTodoAsDone(id: string): Promise<Todo | null> {
  return updateTodo({ id, status: 'done' });
}

/**
 * Get all unique tags
 */
export async function getAllTags(): Promise<string[]> {
  const todos = await getAllTodos();
  const tags = new Set<string>();

  todos.forEach((todo) => {
    todo.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}
