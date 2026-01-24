/**
 * Wallet Store Exports
 */

// Main wallet slice (transactions)
export {
  walletReducer,
  loadTransactions,
  loadMonthlySummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  setTransactions,
  setSelectedMonth,
  setCategoryFilter,
  clearFilters,
  clearError,
  clearTransactions,
} from './slice';

// Accounts slice
export {
  accountsReducer,
  createAccount,
  updateAccount,
  deleteAccount,
  setAccounts,
  setSelectedAccount,
  clearAccounts,
  clearError as clearAccountsError,
  selectAllAccounts,
  selectSelectedAccountId,
  selectSelectedAccount,
  selectDefaultAccount,
  selectAccountById,
  selectAccountsLoading,
  selectAccountsError,
} from './accountsSlice';

// Budgets slice
export {
  budgetsReducer,
  upsertBudget,
  updateBudget,
  updateCategoryLimit,
  deleteBudget,
  copyBudgetFromPrevious,
  setBudgets,
  clearBudgets,
  clearError as clearBudgetsError,
  selectAllBudgets,
  selectBudgetForMonth,
  selectBudgetsLoading,
  selectBudgetsError,
} from './budgetsSlice';

// Goals slice
export {
  goalsReducer,
  createGoal,
  updateGoal,
  addToGoal,
  withdrawFromGoal,
  deleteGoal,
  setGoals,
  clearGoals,
  clearError as clearGoalsError,
  selectAllGoals,
  selectActiveGoals,
  selectCompletedGoals,
  selectGoalById,
  selectGoalsLoading,
  selectGoalsError,
  selectTotalSavings,
} from './goalsSlice';

// Recurring slice
export {
  recurringReducer,
  createRecurring,
  updateRecurring,
  pauseRecurring,
  resumeRecurring,
  deleteRecurring,
  setRecurring,
  clearRecurring,
  clearError as clearRecurringError,
  selectAllRecurring,
  selectActiveRecurring,
  selectPausedRecurring,
  selectRecurringById,
  selectRecurringLoading,
  selectRecurringError,
  selectDueRecurring,
  selectMonthlyRecurringTotal,
} from './recurringSlice';

// Categories slice
export {
  categoriesReducer,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  seedDefaultCategories,
  setCategories,
  clearCategories,
  clearError as clearCategoriesError,
  selectAllCategories,
  selectExpenseCategories,
  selectIncomeCategories,
  selectCategoryById,
  selectCategoriesLoading,
  selectCategoriesError,
} from './categoriesSlice';

// Selectors
export * from './selectors';
