/**
 * Wallet Validation
 */

import { CreateTransactionPayload, UpdateTransactionPayload, TransactionValidationErrors } from './types';

/**
 * Validate create transaction
 */
export function validateCreateTransaction(
  payload: CreateTransactionPayload
): TransactionValidationErrors | null {
  const errors: TransactionValidationErrors = {};

  if (payload.amount === undefined || payload.amount === null) {
    errors.amount = 'L\'importo è obbligatorio';
  } else if (payload.amount <= 0) {
    errors.amount = 'L\'importo deve essere maggiore di zero';
  } else if (payload.amount > 1000000) {
    errors.amount = 'L\'importo è troppo grande';
  }

  if (!payload.date) {
    errors.date = 'La data è obbligatoria';
  } else {
    const date = new Date(payload.date);
    if (isNaN(date.getTime())) {
      errors.date = 'Data non valida';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validate update transaction
 */
export function validateUpdateTransaction(
  payload: UpdateTransactionPayload
): TransactionValidationErrors | null {
  const errors: TransactionValidationErrors = {};

  if (payload.amount !== undefined) {
    if (payload.amount <= 0) {
      errors.amount = 'L\'importo deve essere maggiore di zero';
    } else if (payload.amount > 1000000) {
      errors.amount = 'L\'importo è troppo grande';
    }
  }

  if (payload.date !== undefined) {
    const date = new Date(payload.date);
    if (isNaN(date.getTime())) {
      errors.date = 'Data non valida';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
