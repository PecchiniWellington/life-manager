/**
 * Wallet Firestore Service
 * Persiste le transazioni nella subcollection spaces/{spaceId}/transactions
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  ExpenseCategory,
  MonthlySummary,
} from '../domain/types';
import { parseISO, format } from 'date-fns';

/**
 * Get the transactions collection for a specific space
 */
function getTransactionsCollection(spaceId: string) {
  return firestore().collection('spaces').doc(spaceId).collection('transactions');
}

/**
 * Get all transactions for a space
 */
export async function getTransactions(spaceId: string): Promise<Transaction[]> {
  const snapshot = await getTransactionsCollection(spaceId).orderBy('date', 'desc').get();

  const transactions: Transaction[] = [];
  snapshot.forEach(doc => {
    transactions.push({
      id: doc.id,
      ...doc.data(),
    } as Transaction);
  });

  return transactions;
}

/**
 * Get a single transaction by ID
 */
export async function getTransactionById(spaceId: string, transactionId: string): Promise<Transaction | null> {
  const doc = await getTransactionsCollection(spaceId).doc(transactionId).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as Transaction;
}

/**
 * Create a new transaction
 */
export async function createTransaction(spaceId: string, payload: CreateTransactionPayload): Promise<Transaction> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const now = new Date().toISOString();

  // Extract month/year for efficient queries
  const dateObj = parseISO(payload.date);
  const monthYear = format(dateObj, 'yyyy-MM');

  const transactionData = {
    spaceId,
    amount: payload.amount,
    category: payload.category,
    type: payload.type || 'expense',
    date: payload.date,
    monthYear, // For efficient monthly queries
    note: payload.note || '',
    createdBy: currentUser.uid,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await getTransactionsCollection(spaceId).add(transactionData);

  return {
    id: docRef.id,
    ...transactionData,
  };
}

/**
 * Update a transaction
 */
export async function updateTransaction(spaceId: string, payload: UpdateTransactionPayload): Promise<Transaction | null> {
  const transactionRef = getTransactionsCollection(spaceId).doc(payload.id);
  const doc = await transactionRef.get();

  if (!doc.exists) return null;

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (payload.amount !== undefined) updates.amount = payload.amount;
  if (payload.category !== undefined) updates.category = payload.category;
  if (payload.type !== undefined) updates.type = payload.type;
  if (payload.date !== undefined) {
    updates.date = payload.date;
    // Update monthYear if date changes
    const dateObj = parseISO(payload.date);
    updates.monthYear = format(dateObj, 'yyyy-MM');
  }
  if (payload.note !== undefined) updates.note = payload.note;

  await transactionRef.update(updates);

  const updatedDoc = await transactionRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as Transaction;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(spaceId: string, transactionId: string): Promise<boolean> {
  const transactionRef = getTransactionsCollection(spaceId).doc(transactionId);
  const doc = await transactionRef.get();

  if (!doc.exists) return false;

  await transactionRef.delete();
  return true;
}

/**
 * Get transactions for a specific month
 */
export async function getTransactionsForMonth(spaceId: string, monthDate: Date): Promise<Transaction[]> {
  const monthYear = format(monthDate, 'yyyy-MM');

  const snapshot = await getTransactionsCollection(spaceId)
    .where('monthYear', '==', monthYear)
    .get();

  const transactions: Transaction[] = [];
  snapshot.forEach(doc => {
    transactions.push({
      id: doc.id,
      ...doc.data(),
    } as Transaction);
  });

  // Sort client-side by date descending
  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Calculate monthly summary
 */
export async function getMonthlySummary(spaceId: string, monthDate: Date): Promise<MonthlySummary> {
  const transactions = await getTransactionsForMonth(spaceId, monthDate);

  const byCategory: Record<ExpenseCategory, number> = {
    food: 0,
    transport: 0,
    entertainment: 0,
    shopping: 0,
    health: 0,
    bills: 0,
    other: 0,
  };

  let totalExpenses = 0;
  let totalIncome = 0;

  transactions.forEach((t) => {
    if (t.type === 'expense') {
      totalExpenses += t.amount;
      byCategory[t.category] += t.amount;
    } else {
      totalIncome += t.amount;
    }
  });

  return {
    month: format(monthDate, 'yyyy-MM'),
    totalExpenses,
    totalIncome,
    balance: totalIncome - totalExpenses,
    byCategory,
  };
}

/**
 * Real-time listener for transactions in a space
 */
export function onTransactionsChanged(
  spaceId: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  return getTransactionsCollection(spaceId)
    .orderBy('date', 'desc')
    .onSnapshot(snapshot => {
      const transactions: Transaction[] = [];
      snapshot.forEach(doc => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
        } as Transaction);
      });
      callback(transactions);
    }, error => {
      console.error('Error listening to transactions:', error);
      callback([]);
    });
}

/**
 * Batch delete all transactions in a space (used when deleting a space)
 */
export async function deleteAllTransactionsInSpace(spaceId: string): Promise<void> {
  const snapshot = await getTransactionsCollection(spaceId).get();

  if (snapshot.empty) return;

  const batch = firestore().batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
