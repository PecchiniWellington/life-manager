/**
 * Wallet Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  WalletFilter,
  ExpenseCategory,
  MonthlySummary,
} from '../domain/types';
import { validateCreateTransaction, validateUpdateTransaction } from '../domain/validation';
import * as repository from '../data/repository';
import { NormalizedState } from '@shared/types';

/**
 * Wallet state
 */
interface WalletState extends NormalizedState<Transaction> {
  filter: WalletFilter;
  selectedMonth: string; // YYYY-MM format
  monthlySummary: MonthlySummary | null;
}

/**
 * Initial state
 */
const now = new Date();
const initialState: WalletState = {
  ids: [],
  entities: {},
  status: 'idle',
  error: null,
  filter: {
    category: null,
    type: null,
    dateFrom: null,
    dateTo: null,
  },
  selectedMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  monthlySummary: null,
};

/**
 * Async Thunks
 */

// Load transactions
export const loadTransactions = createAsyncThunk(
  'wallet/loadTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const transactions = await repository.getAllTransactions();
      return transactions;
    } catch (error) {
      return rejectWithValue('Errore nel caricamento delle transazioni');
    }
  }
);

// Load monthly summary
export const loadMonthlySummary = createAsyncThunk(
  'wallet/loadMonthlySummary',
  async (monthString: string, { rejectWithValue }) => {
    try {
      const [year, month] = monthString.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      const summary = await repository.getMonthlySummary(date);
      return summary;
    } catch (error) {
      return rejectWithValue('Errore nel caricamento del riepilogo');
    }
  }
);

// Create transaction
export const createTransaction = createAsyncThunk(
  'wallet/createTransaction',
  async (payload: CreateTransactionPayload, { dispatch, getState, rejectWithValue }) => {
    // Get current space
    const state = getState() as { wallet: WalletState; spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    const errors = validateCreateTransaction(payload);
    if (errors) {
      return rejectWithValue(errors);
    }

    try {
      const transaction = await repository.createTransaction(payload, spaceId);
      // Reload monthly summary
      dispatch(loadMonthlySummary(state.wallet.selectedMonth));
      return transaction;
    } catch (error) {
      return rejectWithValue({ general: 'Errore nella creazione della transazione' });
    }
  }
);

// Update transaction
export const updateTransaction = createAsyncThunk(
  'wallet/updateTransaction',
  async (payload: UpdateTransactionPayload, { dispatch, getState, rejectWithValue }) => {
    const errors = validateUpdateTransaction(payload);
    if (errors) {
      return rejectWithValue(errors);
    }

    try {
      const transaction = await repository.updateTransaction(payload);
      if (!transaction) {
        return rejectWithValue({ general: 'Transazione non trovata' });
      }
      // Reload monthly summary
      const state = getState() as { wallet: WalletState };
      dispatch(loadMonthlySummary(state.wallet.selectedMonth));
      return transaction;
    } catch (error) {
      return rejectWithValue({ general: 'Errore nell\'aggiornamento della transazione' });
    }
  }
);

// Delete transaction
export const deleteTransaction = createAsyncThunk(
  'wallet/deleteTransaction',
  async (id: string, { dispatch, getState, rejectWithValue }) => {
    try {
      const success = await repository.deleteTransaction(id);
      if (!success) {
        return rejectWithValue('Transazione non trovata');
      }
      // Reload monthly summary
      const state = getState() as { wallet: WalletState };
      dispatch(loadMonthlySummary(state.wallet.selectedMonth));
      return id;
    } catch (error) {
      return rejectWithValue('Errore nell\'eliminazione della transazione');
    }
  }
);

/**
 * Wallet Slice
 */
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<ExpenseCategory | null>) => {
      state.filter.category = action.payload;
    },
    clearFilters: (state) => {
      state.filter = initialState.filter;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load transactions
      .addCase(loadTransactions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ids = action.payload.map((t) => t.id);
        state.entities = action.payload.reduce(
          (acc, transaction) => {
            acc[transaction.id] = transaction;
            return acc;
          },
          {} as Record<string, Transaction>
        );
      })
      .addCase(loadTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Load monthly summary
      .addCase(loadMonthlySummary.fulfilled, (state, action) => {
        state.monthlySummary = action.payload;
      })
      // Create transaction
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.ids.push(action.payload.id);
        state.entities[action.payload.id] = action.payload;
      })
      // Update transaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
      })
      // Delete transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.ids = state.ids.filter((id) => id !== action.payload);
        delete state.entities[action.payload];
      });
  },
});

export const {
  setSelectedMonth,
  setCategoryFilter,
  clearFilters,
  clearError,
} = walletSlice.actions;

export const walletReducer = walletSlice.reducer;
