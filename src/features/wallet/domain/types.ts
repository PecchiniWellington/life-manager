/**
 * Wallet Domain Types
 */

// ============================================================
// TRANSACTION TYPES
// ============================================================

/**
 * Transaction type
 */
export type TransactionType = 'expense' | 'income';

/**
 * Legacy expense category (per retrocompatibilità)
 */
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'bills'
  | 'other';

/**
 * Transaction entity
 */
export interface Transaction {
  id: string;
  spaceId: string;
  amount: number;
  category: ExpenseCategory; // Legacy field per retrocompatibilità
  categoryId?: string; // Nuovo campo per categorie custom
  accountId?: string; // Nuovo campo per conti multipli
  type: TransactionType;
  date: string; // ISO date string
  monthYear?: string; // YYYY-MM for efficient queries
  note: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create transaction payload
 */
export interface CreateTransactionPayload {
  amount: number;
  category: ExpenseCategory;
  categoryId?: string;
  accountId?: string;
  type?: TransactionType;
  date: string;
  note?: string;
}

/**
 * Update transaction payload
 */
export interface UpdateTransactionPayload {
  id: string;
  amount?: number;
  category?: ExpenseCategory;
  categoryId?: string;
  accountId?: string;
  type?: TransactionType;
  date?: string;
  note?: string;
}

/**
 * Wallet filter
 */
export interface WalletFilter {
  category?: ExpenseCategory | null;
  categoryId?: string | null;
  accountId?: string | null;
  type?: TransactionType | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

/**
 * Validation errors
 */
export interface TransactionValidationErrors {
  amount?: string;
  date?: string;
  general?: string;
}

/**
 * Legacy category labels
 */
export const categoryLabels: Record<ExpenseCategory, string> = {
  food: 'Cibo',
  transport: 'Trasporti',
  entertainment: 'Svago',
  shopping: 'Shopping',
  health: 'Salute',
  bills: 'Bollette',
  other: 'Altro',
};

/**
 * Legacy category icons
 */
export const categoryIcons: Record<ExpenseCategory, string> = {
  food: 'food',
  transport: 'transport',
  entertainment: 'entertainment',
  shopping: 'shopping',
  health: 'health',
  bills: 'bills',
  other: 'other',
};

/**
 * Monthly summary
 */
export interface MonthlySummary {
  month: string;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  byCategory: Record<ExpenseCategory, number>;
  byCategoryId?: Record<string, number>;
  byAccount?: Record<string, number>;
}

// ============================================================
// ACCOUNTS
// ============================================================

/**
 * Account type
 */
export type AccountType = 'cash' | 'bank' | 'card' | 'savings' | 'investment';

/**
 * Account type labels
 */
export const accountTypeLabels: Record<AccountType, string> = {
  cash: 'Contanti',
  bank: 'Conto Corrente',
  card: 'Carta',
  savings: 'Risparmio',
  investment: 'Investimenti',
};

/**
 * Account type icons
 */
export const accountTypeIcons: Record<AccountType, string> = {
  cash: 'wallet',
  bank: 'bank',
  card: 'card',
  savings: 'savings',
  investment: 'trending',
};

/**
 * Account entity
 */
export interface Account {
  id: string;
  spaceId: string;
  name: string;
  type: AccountType;
  icon: string;
  color: string;
  initialBalance: number;
  isDefault: boolean;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create account payload
 */
export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  icon?: string;
  color?: string;
  initialBalance?: number;
  isDefault?: boolean;
}

/**
 * Update account payload
 */
export interface UpdateAccountPayload {
  id: string;
  name?: string;
  type?: AccountType;
  icon?: string;
  color?: string;
  initialBalance?: number;
  isDefault?: boolean;
  isArchived?: boolean;
}

/**
 * Account with calculated balance
 */
export interface AccountWithBalance extends Account {
  currentBalance: number;
}

// ============================================================
// BUDGET
// ============================================================

/**
 * Budget entity - one per month
 */
export interface Budget {
  id: string;
  spaceId: string;
  month: string; // YYYY-MM
  globalLimit: number;
  categoryLimits: Record<string, number>; // categoryId/category -> limit
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create budget payload
 */
export interface CreateBudgetPayload {
  month: string;
  globalLimit: number;
  categoryLimits?: Record<string, number>;
}

/**
 * Update budget payload
 */
export interface UpdateBudgetPayload {
  id: string;
  globalLimit?: number;
  categoryLimits?: Record<string, number>;
}

/**
 * Budget progress info
 */
export interface BudgetProgressInfo {
  budget: Budget;
  globalSpent: number;
  globalRemaining: number;
  globalPercentage: number;
  categoryProgress: Array<{
    categoryId: string;
    categoryName: string;
    limit: number;
    spent: number;
    remaining: number;
    percentage: number;
  }>;
}

// ============================================================
// SAVINGS GOALS
// ============================================================

/**
 * Goal status
 */
export type GoalStatus = 'active' | 'completed' | 'cancelled';

/**
 * Savings goal entity
 */
export interface SavingsGoal {
  id: string;
  spaceId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  icon: string;
  color: string;
  status: GoalStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create goal payload
 */
export interface CreateGoalPayload {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string | null;
  icon?: string;
  color?: string;
}

/**
 * Update goal payload
 */
export interface UpdateGoalPayload {
  id: string;
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string | null;
  icon?: string;
  color?: string;
  status?: GoalStatus;
}

/**
 * Goal with progress
 */
export interface GoalWithProgress extends SavingsGoal {
  percentage: number;
  remaining: number;
  daysLeft: number | null;
}

// ============================================================
// RECURRING TRANSACTIONS
// ============================================================

/**
 * Recurrence frequency
 */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

/**
 * Frequency labels
 */
export const frequencyLabels: Record<RecurrenceFrequency, string> = {
  daily: 'Giornaliero',
  weekly: 'Settimanale',
  biweekly: 'Bisettimanale',
  monthly: 'Mensile',
  yearly: 'Annuale',
};

/**
 * Recurring transaction entity
 */
export interface RecurringTransaction {
  id: string;
  spaceId: string;
  accountId: string;
  category?: ExpenseCategory | string;
  categoryId?: string;
  amount: number;
  type: TransactionType;
  note: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate: string | null;
  lastExecuted: string | null;
  nextExecution: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create recurring payload
 */
export interface CreateRecurringPayload {
  accountId: string;
  category?: ExpenseCategory | string;
  categoryId?: string;
  amount: number;
  type?: TransactionType;
  note?: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string | null;
}

/**
 * Update recurring payload
 */
export interface UpdateRecurringPayload {
  id: string;
  accountId?: string;
  category?: ExpenseCategory | string;
  categoryId?: string;
  amount?: number;
  type?: TransactionType;
  note?: string;
  frequency?: RecurrenceFrequency;
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
}

// ============================================================
// CUSTOM CATEGORIES
// ============================================================

/**
 * Custom category entity
 */
export interface Category {
  id: string;
  spaceId: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType; // expense o income
  isDefault: boolean;
  sortOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create category payload
 */
export interface CreateCategoryPayload {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  sortOrder?: number;
}

/**
 * Update category payload
 */
export interface UpdateCategoryPayload {
  id: string;
  name?: string;
  icon?: string;
  color?: string;
  type?: TransactionType;
  sortOrder?: number;
}

/**
 * Default categories to seed
 */
export const DEFAULT_EXPENSE_CATEGORIES: Omit<CreateCategoryPayload, 'sortOrder'>[] = [
  { name: 'Cibo', icon: 'food', color: '#FF9500', type: 'expense' },
  { name: 'Trasporti', icon: 'transport', color: '#007AFF', type: 'expense' },
  { name: 'Svago', icon: 'entertainment', color: '#FF2D55', type: 'expense' },
  { name: 'Shopping', icon: 'shopping', color: '#AF52DE', type: 'expense' },
  { name: 'Salute', icon: 'health', color: '#34C759', type: 'expense' },
  { name: 'Bollette', icon: 'bills', color: '#FF3B30', type: 'expense' },
  { name: 'Casa', icon: 'home', color: '#5856D6', type: 'expense' },
  { name: 'Abbonamenti', icon: 'subscription', color: '#00C7BE', type: 'expense' },
  { name: 'Altro', icon: 'other', color: '#8E8E93', type: 'expense' },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<CreateCategoryPayload, 'sortOrder'>[] = [
  { name: 'Stipendio', icon: 'salary', color: '#34C759', type: 'income' },
  { name: 'Freelance', icon: 'freelance', color: '#007AFF', type: 'income' },
  { name: 'Investimenti', icon: 'trending', color: '#FF9500', type: 'income' },
  { name: 'Regalo', icon: 'gift', color: '#FF2D55', type: 'income' },
  { name: 'Altro', icon: 'other', color: '#8E8E93', type: 'income' },
];

// ============================================================
// REPORT TYPES
// ============================================================

/**
 * Time period for reports
 */
export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

/**
 * Report data point
 */
export interface ReportDataPoint {
  label: string;
  value: number;
  date?: string;
}

/**
 * Category report
 */
export interface CategoryReport {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
  percentage: number;
  transactions: number;
}

/**
 * Trend report
 */
export interface TrendReport {
  period: ReportPeriod;
  data: ReportDataPoint[];
  totalExpenses: number;
  totalIncome: number;
  averageExpenses: number;
  averageIncome: number;
}
