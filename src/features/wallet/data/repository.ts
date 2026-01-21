/**
 * Wallet Repository
 */

import { getStorageItem, setStorageItem, StorageKey } from '@shared/lib/storage';
import { generateId } from '@shared/lib/id';
import {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  ExpenseCategory,
  MonthlySummary,
} from '../domain/types';
import { startOfMonth, endOfMonth, parseISO, format } from 'date-fns';

/**
 * Get all transactions
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  const transactions = await getStorageItem<Transaction[]>(StorageKey.WALLET_TRANSACTIONS);
  return transactions || [];
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(id: string): Promise<Transaction | null> {
  const transactions = await getAllTransactions();
  return transactions.find((t) => t.id === id) || null;
}

/**
 * Create transaction
 */
export async function createTransaction(
  payload: CreateTransactionPayload,
  spaceId: string
): Promise<Transaction> {
  const transactions = await getAllTransactions();
  const now = new Date().toISOString();

  const newTransaction: Transaction = {
    id: generateId(),
    spaceId,
    amount: payload.amount,
    category: payload.category,
    type: payload.type || 'expense',
    date: payload.date,
    note: payload.note || '',
    createdAt: now,
    updatedAt: now,
  };

  const updatedTransactions = [...transactions, newTransaction];
  await setStorageItem(StorageKey.WALLET_TRANSACTIONS, updatedTransactions);

  return newTransaction;
}

/**
 * Update transaction
 */
export async function updateTransaction(
  payload: UpdateTransactionPayload
): Promise<Transaction | null> {
  const transactions = await getAllTransactions();
  const index = transactions.findIndex((t) => t.id === payload.id);

  if (index === -1) {
    return null;
  }

  const existingTransaction = transactions[index];
  const updatedTransaction: Transaction = {
    ...existingTransaction,
    ...(payload.amount !== undefined && { amount: payload.amount }),
    ...(payload.category !== undefined && { category: payload.category }),
    ...(payload.type !== undefined && { type: payload.type }),
    ...(payload.date !== undefined && { date: payload.date }),
    ...(payload.note !== undefined && { note: payload.note }),
    updatedAt: new Date().toISOString(),
  };

  transactions[index] = updatedTransaction;
  await setStorageItem(StorageKey.WALLET_TRANSACTIONS, transactions);

  return updatedTransaction;
}

/**
 * Delete transaction
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  const transactions = await getAllTransactions();
  const filteredTransactions = transactions.filter((t) => t.id !== id);

  if (filteredTransactions.length === transactions.length) {
    return false;
  }

  await setStorageItem(StorageKey.WALLET_TRANSACTIONS, filteredTransactions);
  return true;
}

/**
 * Get transactions for a specific month
 */
export async function getTransactionsForMonth(monthDate: Date): Promise<Transaction[]> {
  const transactions = await getAllTransactions();
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  return transactions.filter((t) => {
    const date = parseISO(t.date);
    return date >= monthStart && date <= monthEnd;
  });
}

/**
 * Calculate monthly summary
 */
export async function getMonthlySummary(monthDate: Date): Promise<MonthlySummary> {
  const transactions = await getTransactionsForMonth(monthDate);

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
