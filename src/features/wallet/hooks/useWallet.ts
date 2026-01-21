/**
 * useWallet Hook
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  loadTransactions,
  loadMonthlySummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  setSelectedMonth,
  setCategoryFilter,
  clearFilters,
  clearError,
  selectFilteredTransactionsForMonth,
  selectWalletFilter,
  selectSelectedMonth,
  selectMonthlySummary,
  selectIsWalletLoading,
  selectWalletError,
  selectTopCategories,
  selectMonthlyTotalExpenses,
} from '../store';
import { CreateTransactionPayload, UpdateTransactionPayload, ExpenseCategory } from '../domain/types';
import { addMonths, subMonths, format } from 'date-fns';

export function useWallet() {
  const dispatch = useAppDispatch();

  // Selectors
  const transactions = useAppSelector(selectFilteredTransactionsForMonth);
  const filter = useAppSelector(selectWalletFilter);
  const selectedMonth = useAppSelector(selectSelectedMonth);
  const monthlySummary = useAppSelector(selectMonthlySummary);
  const isLoading = useAppSelector(selectIsWalletLoading);
  const error = useAppSelector(selectWalletError);
  const topCategories = useAppSelector(selectTopCategories);
  const totalExpenses = useAppSelector(selectMonthlyTotalExpenses);

  // Load data on mount
  useEffect(() => {
    dispatch(loadTransactions());
  }, [dispatch]);

  // Load monthly summary when month changes
  useEffect(() => {
    dispatch(loadMonthlySummary(selectedMonth));
  }, [dispatch, selectedMonth]);

  // Actions
  const handleCreateTransaction = useCallback(
    async (payload: CreateTransactionPayload) => {
      const result = await dispatch(createTransaction(payload));
      return createTransaction.fulfilled.match(result);
    },
    [dispatch]
  );

  const handleUpdateTransaction = useCallback(
    async (payload: UpdateTransactionPayload) => {
      const result = await dispatch(updateTransaction(payload));
      return updateTransaction.fulfilled.match(result);
    },
    [dispatch]
  );

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteTransaction(id));
      return deleteTransaction.fulfilled.match(result);
    },
    [dispatch]
  );

  // Month navigation
  const goToNextMonth = useCallback(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const currentDate = new Date(year, month - 1, 1);
    const nextMonth = addMonths(currentDate, 1);
    dispatch(setSelectedMonth(format(nextMonth, 'yyyy-MM')));
  }, [dispatch, selectedMonth]);

  const goToPrevMonth = useCallback(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const currentDate = new Date(year, month - 1, 1);
    const prevMonth = subMonths(currentDate, 1);
    dispatch(setSelectedMonth(format(prevMonth, 'yyyy-MM')));
  }, [dispatch, selectedMonth]);

  const goToCurrentMonth = useCallback(() => {
    dispatch(setSelectedMonth(format(new Date(), 'yyyy-MM')));
  }, [dispatch]);

  // Filter actions
  const handleSetCategoryFilter = useCallback(
    (category: ExpenseCategory | null) => {
      dispatch(setCategoryFilter(category));
    },
    [dispatch]
  );

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    transactions,
    filter,
    selectedMonth,
    monthlySummary,
    isLoading,
    error,
    topCategories,
    totalExpenses,

    // Actions
    createTransaction: handleCreateTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,

    // Navigation
    goToNextMonth,
    goToPrevMonth,
    goToCurrentMonth,

    // Filters
    setCategoryFilter: handleSetCategoryFilter,
    clearFilters: handleClearFilters,
    clearError: handleClearError,
  };
}
