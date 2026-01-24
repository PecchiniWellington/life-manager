/**
 * Recurring Transactions Firestore Service
 * Persiste le transazioni ricorrenti nella subcollection spaces/{spaceId}/recurringTransactions
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  RecurringTransaction,
  CreateRecurringPayload,
  UpdateRecurringPayload,
  RecurrenceFrequency,
} from '../domain/types';
import { addDays, addWeeks, addMonths, addYears, format, parseISO, isBefore, isToday } from 'date-fns';

/**
 * Get the recurring transactions collection for a specific space
 */
function getRecurringCollection(spaceId: string) {
  return firestore().collection('spaces').doc(spaceId).collection('recurringTransactions');
}

/**
 * Calculate next execution date based on frequency
 */
function calculateNextExecution(currentDate: string, frequency: RecurrenceFrequency): string {
  const date = parseISO(currentDate);
  let nextDate: Date;

  switch (frequency) {
    case 'daily':
      nextDate = addDays(date, 1);
      break;
    case 'weekly':
      nextDate = addWeeks(date, 1);
      break;
    case 'biweekly':
      nextDate = addWeeks(date, 2);
      break;
    case 'monthly':
      nextDate = addMonths(date, 1);
      break;
    case 'yearly':
      nextDate = addYears(date, 1);
      break;
    default:
      nextDate = addMonths(date, 1);
  }

  return format(nextDate, 'yyyy-MM-dd');
}

/**
 * Get all recurring transactions for a space
 */
export async function getRecurringTransactions(spaceId: string): Promise<RecurringTransaction[]> {
  const snapshot = await getRecurringCollection(spaceId)
    .orderBy('nextExecution', 'asc')
    .get();

  const recurring: RecurringTransaction[] = [];
  snapshot.forEach(doc => {
    recurring.push({
      id: doc.id,
      ...doc.data(),
    } as RecurringTransaction);
  });

  return recurring;
}

/**
 * Get active recurring transactions only
 */
export async function getActiveRecurringTransactions(spaceId: string): Promise<RecurringTransaction[]> {
  const all = await getRecurringTransactions(spaceId);
  return all.filter(r => r.isActive);
}

/**
 * Get recurring transactions due for execution (nextExecution <= today)
 */
export async function getDueRecurringTransactions(spaceId: string): Promise<RecurringTransaction[]> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const all = await getRecurringTransactions(spaceId);

  return all.filter(r => {
    if (!r.isActive) return false;
    if (r.nextExecution > today) return false;
    if (r.endDate && r.endDate < today) return false;
    return true;
  });
}

/**
 * Get a single recurring transaction by ID
 */
export async function getRecurringById(spaceId: string, recurringId: string): Promise<RecurringTransaction | null> {
  const doc = await getRecurringCollection(spaceId).doc(recurringId).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as RecurringTransaction;
}

/**
 * Create a new recurring transaction
 */
export async function createRecurring(spaceId: string, payload: CreateRecurringPayload): Promise<RecurringTransaction> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const now = new Date().toISOString();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Calculate first execution
  const startDate = payload.startDate || today;
  let nextExecution = startDate;

  // If start date is in the past, calculate next valid execution
  if (isBefore(parseISO(startDate), new Date()) && !isToday(parseISO(startDate))) {
    let checkDate = startDate;
    while (isBefore(parseISO(checkDate), new Date()) && !isToday(parseISO(checkDate))) {
      checkDate = calculateNextExecution(checkDate, payload.frequency);
    }
    nextExecution = checkDate;
  }

  const recurringData: Omit<RecurringTransaction, 'id'> = {
    spaceId,
    accountId: payload.accountId,
    category: payload.category,
    categoryId: payload.categoryId,
    amount: payload.amount,
    type: payload.type || 'expense',
    note: payload.note || '',
    frequency: payload.frequency,
    startDate,
    endDate: payload.endDate || null,
    lastExecuted: null,
    nextExecution,
    isActive: true,
    createdBy: currentUser.uid,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await getRecurringCollection(spaceId).add(recurringData);

  return {
    id: docRef.id,
    ...recurringData,
  };
}

/**
 * Update a recurring transaction
 */
export async function updateRecurring(spaceId: string, payload: UpdateRecurringPayload): Promise<RecurringTransaction | null> {
  const recurringRef = getRecurringCollection(spaceId).doc(payload.id);
  const doc = await recurringRef.get();

  if (!doc.exists) return null;

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (payload.accountId !== undefined) updates.accountId = payload.accountId;
  if (payload.category !== undefined) updates.category = payload.category;
  if (payload.categoryId !== undefined) updates.categoryId = payload.categoryId;
  if (payload.amount !== undefined) updates.amount = payload.amount;
  if (payload.type !== undefined) updates.type = payload.type;
  if (payload.note !== undefined) updates.note = payload.note;
  if (payload.frequency !== undefined) updates.frequency = payload.frequency;
  if (payload.startDate !== undefined) updates.startDate = payload.startDate;
  if (payload.endDate !== undefined) updates.endDate = payload.endDate;
  if (payload.isActive !== undefined) updates.isActive = payload.isActive;

  await recurringRef.update(updates);

  const updatedDoc = await recurringRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as RecurringTransaction;
}

/**
 * Mark a recurring transaction as executed and calculate next execution
 */
export async function markAsExecuted(spaceId: string, recurringId: string): Promise<RecurringTransaction | null> {
  const recurringRef = getRecurringCollection(spaceId).doc(recurringId);
  const doc = await recurringRef.get();

  if (!doc.exists) return null;

  const recurring = doc.data() as RecurringTransaction;
  const today = format(new Date(), 'yyyy-MM-dd');
  const nextExecution = calculateNextExecution(today, recurring.frequency);

  // Check if we should deactivate (endDate reached)
  let isActive = recurring.isActive;
  if (recurring.endDate && nextExecution > recurring.endDate) {
    isActive = false;
  }

  await recurringRef.update({
    lastExecuted: today,
    nextExecution,
    isActive,
    updatedAt: new Date().toISOString(),
  });

  const updatedDoc = await recurringRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as RecurringTransaction;
}

/**
 * Pause a recurring transaction
 */
export async function pauseRecurring(spaceId: string, recurringId: string): Promise<RecurringTransaction | null> {
  return updateRecurring(spaceId, { id: recurringId, isActive: false });
}

/**
 * Resume a recurring transaction
 */
export async function resumeRecurring(spaceId: string, recurringId: string): Promise<RecurringTransaction | null> {
  return updateRecurring(spaceId, { id: recurringId, isActive: true });
}

/**
 * Delete a recurring transaction
 */
export async function deleteRecurring(spaceId: string, recurringId: string): Promise<boolean> {
  const recurringRef = getRecurringCollection(spaceId).doc(recurringId);
  const doc = await recurringRef.get();

  if (!doc.exists) return false;

  await recurringRef.delete();
  return true;
}

/**
 * Real-time listener for recurring transactions in a space
 */
export function onRecurringChanged(
  spaceId: string,
  callback: (recurring: RecurringTransaction[]) => void
): () => void {
  return getRecurringCollection(spaceId)
    .orderBy('nextExecution', 'asc')
    .onSnapshot(snapshot => {
      const recurring: RecurringTransaction[] = [];
      snapshot.forEach(doc => {
        recurring.push({
          id: doc.id,
          ...doc.data(),
        } as RecurringTransaction);
      });
      callback(recurring);
    }, error => {
      console.error('Error listening to recurring transactions:', error);
      callback([]);
    });
}

/**
 * Batch delete all recurring transactions in a space (used when deleting a space)
 */
export async function deleteAllRecurringInSpace(spaceId: string): Promise<void> {
  const snapshot = await getRecurringCollection(spaceId).get();

  if (snapshot.empty) return;

  const batch = firestore().batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
