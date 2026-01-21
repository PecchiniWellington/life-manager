/**
 * Wallet Domain Types
 */

/**
 * Transaction type
 */
export type TransactionType = 'expense' | 'income';

/**
 * Expense category
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
  amount: number;
  category: ExpenseCategory;
  type: TransactionType;
  date: string; // ISO date string
  note: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create transaction payload
 */
export interface CreateTransactionPayload {
  amount: number;
  category: ExpenseCategory;
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
  type?: TransactionType;
  date?: string;
  note?: string;
}

/**
 * Wallet filter
 */
export interface WalletFilter {
  category?: ExpenseCategory | null;
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
 * Category labels
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
 * Category icons (using IconName from design system)
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
}
