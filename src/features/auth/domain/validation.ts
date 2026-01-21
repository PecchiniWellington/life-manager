/**
 * Auth Validation
 */

import { LoginPayload, RegisterPayload, AuthValidationErrors } from './types';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Validate login payload
 */
export function validateLogin(payload: LoginPayload): AuthValidationErrors {
  const errors: AuthValidationErrors = {};

  if (!payload.email.trim()) {
    errors.email = 'Email obbligatoria';
  } else if (!isValidEmail(payload.email)) {
    errors.email = 'Email non valida';
  }

  if (!payload.password) {
    errors.password = 'Password obbligatoria';
  } else if (!isValidPassword(payload.password)) {
    errors.password = 'Password troppo corta (minimo 6 caratteri)';
  }

  return errors;
}

/**
 * Validate register payload
 */
export function validateRegister(payload: RegisterPayload): AuthValidationErrors {
  const errors: AuthValidationErrors = {};

  if (!payload.displayName.trim()) {
    errors.displayName = 'Nome obbligatorio';
  } else if (payload.displayName.trim().length < 2) {
    errors.displayName = 'Nome troppo corto';
  }

  if (!payload.email.trim()) {
    errors.email = 'Email obbligatoria';
  } else if (!isValidEmail(payload.email)) {
    errors.email = 'Email non valida';
  }

  if (!payload.password) {
    errors.password = 'Password obbligatoria';
  } else if (!isValidPassword(payload.password)) {
    errors.password = 'Password troppo corta (minimo 6 caratteri)';
  }

  return errors;
}

/**
 * Check if there are any validation errors
 */
export function hasErrors(errors: AuthValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
