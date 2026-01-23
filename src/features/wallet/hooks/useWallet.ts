/**
 * useWallet Hook
 * I dati vengono sincronizzati automaticamente via SpacesProvider
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
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
import { selectCurrentSpaceId } from '@features/spaces/store';
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
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);

  // Note: I dati vengono caricati automaticamente dal SpacesProvider
  // tramite real-time listener quando cambia lo spazio corrente

  // Load monthly summary when month or space changes
  useEffect(() => {
    if (currentSpaceId) {
      dispatch(loadMonthlySummary({ spaceId: currentSpaceId, monthString: selectedMonth }));
    }
  }, [dispatch, selectedMonth, currentSpaceId]);

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
