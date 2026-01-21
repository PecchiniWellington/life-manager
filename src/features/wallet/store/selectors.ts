/**
 * Wallet Selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@app/store';
import { Transaction, ExpenseCategory } from '../domain/types';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Base selectors
 */
export const selectAllTransactionIds = (state: RootState) => state.wallet.ids;
export const selectTransactionEntities = (state: RootState) => state.wallet.entities;
export const selectWalletFilter = (state: RootState) => state.wallet.filter;
export const selectSelectedMonth = (state: RootState) => state.wallet.selectedMonth;
export const selectMonthlySummary = (state: RootState) => state.wallet.monthlySummary;
export const selectWalletStatus = (state: RootState) => state.wallet.status;
export const selectWalletError = (state: RootState) => state.wallet.error;

/**
 * Select all transactions as array
 */
export const selectAllTransactions = createSelector(
  [selectAllTransactionIds, selectTransactionEntities],
  (ids, entities): Transaction[] => ids.map((id) => entities[id])
);

/**
 * Select transactions for selected month
 */
export const selectTransactionsForSelectedMonth = createSelector(
  [selectAllTransactions, selectSelectedMonth],
  (transactions, selectedMonth): Transaction[] => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1, 1));
    const monthEnd = endOfMonth(monthStart);

    return transactions
      .filter((t) => {
        const date = parseISO(t.date);
        return date >= monthStart && date <= monthEnd;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
);

/**
 * Select filtered transactions for selected month
 */
export const selectFilteredTransactionsForMonth = createSelector(
  [selectTransactionsForSelectedMonth, selectWalletFilter],
  (transactions, filter): Transaction[] => {
    let filtered = transactions;

    if (filter.category) {
      filtered = filtered.filter((t) => t.category === filter.category);
    }

    if (filter.type) {
      filtered = filtered.filter((t) => t.type === filter.type);
    }

    return filtered;
  }
);

/**
 * Select total expenses for month
 */
export const selectMonthlyTotalExpenses = createSelector(
  [selectMonthlySummary],
  (summary): number => summary?.totalExpenses || 0
);

/**
 * Select expenses by category
 */
export const selectExpensesByCategory = createSelector(
  [selectMonthlySummary],
  (summary): Record<ExpenseCategory, number> => {
    return (
      summary?.byCategory || {
        food: 0,
        transport: 0,
        entertainment: 0,
        shopping: 0,
        health: 0,
        bills: 0,
        other: 0,
      }
    );
  }
);

/**
 * Select top categories
 */
export const selectTopCategories = createSelector(
  [selectExpensesByCategory],
  (byCategory): Array<{ category: ExpenseCategory; amount: number }> => {
    return Object.entries(byCategory)
      .map(([category, amount]) => ({ category: category as ExpenseCategory, amount }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }
);

/**
 * Select if wallet is loading
 */
export const selectIsWalletLoading = createSelector(
  [selectWalletStatus],
  (status) => status === 'loading'
);

/**
 * Select transaction by ID
 */
export const selectTransactionById = (id: string) =>
  createSelector([selectTransactionEntities], (entities) => entities[id] || null);
