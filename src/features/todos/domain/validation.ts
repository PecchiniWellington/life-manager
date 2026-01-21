/**
 * Todo Validation
 */

import { CreateTodoPayload, UpdateTodoPayload, TodoValidationErrors } from './types';

/**
 * Validate todo creation
 */
export function validateCreateTodo(payload: CreateTodoPayload): TodoValidationErrors | null {
  const errors: TodoValidationErrors = {};

  if (!payload.title || payload.title.trim().length === 0) {
    errors.title = 'Il titolo è obbligatorio';
  } else if (payload.title.length > 200) {
    errors.title = 'Il titolo non può superare 200 caratteri';
  }

  if (payload.dueDate) {
    const dueDate = new Date(payload.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.dueDate = 'Data non valida';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validate todo update
 */
export function validateUpdateTodo(payload: UpdateTodoPayload): TodoValidationErrors | null {
  const errors: TodoValidationErrors = {};

  if (payload.title !== undefined) {
    if (payload.title.trim().length === 0) {
      errors.title = 'Il titolo è obbligatorio';
    } else if (payload.title.length > 200) {
      errors.title = 'Il titolo non può superare 200 caratteri';
    }
  }

  if (payload.dueDate) {
    const dueDate = new Date(payload.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.dueDate = 'Data non valida';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
