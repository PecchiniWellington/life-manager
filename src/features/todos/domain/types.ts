/**
 * Todos Domain Types
 */

/**
 * Todo status
 */
export type TodoStatus = 'todo' | 'doing' | 'done';

/**
 * Todo priority
 */
export type TodoPriority = 'low' | 'medium' | 'high';

/**
 * Todo entity
 */
export interface Todo {
  id: string;
  spaceId: string; // Space a cui appartiene il todo
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string | null; // ISO date string or null
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Todo creation payload
 */
export interface CreateTodoPayload {
  title: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string | null;
  tags?: string[];
}

/**
 * Todo update payload
 */
export interface UpdateTodoPayload {
  id: string;
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string | null;
  tags?: string[];
}

/**
 * Todo filter
 */
export interface TodoFilter {
  status?: TodoStatus | null;
  priority?: TodoPriority | null;
  tags?: string[];
  search?: string;
  showCompleted?: boolean;
}

/**
 * Todo validation errors
 */
export interface TodoValidationErrors {
  title?: string;
  dueDate?: string;
  general?: string;
}

/**
 * Status labels
 */
export const statusLabels: Record<TodoStatus, string> = {
  todo: 'Da fare',
  doing: 'In corso',
  done: 'Completato',
};

/**
 * Priority labels
 */
export const priorityLabels: Record<TodoPriority, string> = {
  low: 'Bassa',
  medium: 'Media',
  high: 'Alta',
};
