/**
 * Wallet Redux Slice
 * Usa Firestore per la persistenza
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
import * as firestoreService from '../data/firestoreService';
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

// Load transactions for current space
export const loadTransactions = createAsyncThunk(
  'wallet/loadTransactions',
  async (spaceId: string, { rejectWithValue }) => {
    try {
      const transactions = await firestoreService.getTransactions(spaceId);
      return transactions;
    } catch (error) {
      console.error('Error loading transactions:', error);
      return rejectWithValue('Errore nel caricamento delle transazioni');
    }
  }
);

// Load monthly summary
export const loadMonthlySummary = createAsyncThunk(
  'wallet/loadMonthlySummary',
  async ({ spaceId, monthString }: { spaceId: string; monthString: string }, { rejectWithValue }) => {
    try {
      const [year, month] = monthString.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      const summary = await firestoreService.getMonthlySummary(spaceId, date);
      return summary;
    } catch (error) {
      console.error('Error loading monthly summary:', error);
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
      const transaction = await firestoreService.createTransaction(spaceId, payload);
      // Reload monthly summary
      dispatch(loadMonthlySummary({ spaceId, monthString: state.wallet.selectedMonth }));
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return rejectWithValue({ general: 'Errore nella creazione della transazione' });
    }
  }
);

// Update transaction
export const updateTransaction = createAsyncThunk(
  'wallet/updateTransaction',
  async (payload: UpdateTransactionPayload, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as { wallet: WalletState; spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    const errors = validateUpdateTransaction(payload);
    if (errors) {
      return rejectWithValue(errors);
    }

    try {
      const transaction = await firestoreService.updateTransaction(spaceId, payload);
      if (!transaction) {
        return rejectWithValue({ general: 'Transazione non trovata' });
      }
      // Reload monthly summary
      dispatch(loadMonthlySummary({ spaceId, monthString: state.wallet.selectedMonth }));
      return transaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return rejectWithValue({ general: 'Errore nell\'aggiornamento della transazione' });
    }
  }
);

// Delete transaction
export const deleteTransaction = createAsyncThunk(
  'wallet/deleteTransaction',
  async (id: string, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as { wallet: WalletState; spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue('Nessuno spazio selezionato');
    }

    try {
      const success = await firestoreService.deleteTransaction(spaceId, id);
      if (!success) {
        return rejectWithValue('Transazione non trovata');
      }
      // Reload monthly summary
      dispatch(loadMonthlySummary({ spaceId, monthString: state.wallet.selectedMonth }));
      return id;
    } catch (error) {
      console.error('Error deleting transaction:', error);
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
    // Sync transactions from Firestore listener
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.ids = action.payload.map((t) => t.id);
      state.entities = action.payload.reduce(
        (acc, transaction) => {
          acc[transaction.id] = transaction;
          return acc;
        },
        {} as Record<string, Transaction>
      );
      state.status = 'succeeded';
    },
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
    clearTransactions: (state) => {
      state.ids = [];
      state.entities = {};
      state.monthlySummary = null;
      state.status = 'idle';
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
      // Create transaction - non aggiorniamo lo state, il listener Firestore lo farà
      .addCase(createTransaction.pending, (state) => {
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state) => {
        // La transazione verrà aggiunta dal real-time listener
        state.status = 'succeeded';
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Update transaction - non aggiorniamo lo state, il listener Firestore lo farà
      .addCase(updateTransaction.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state) => {
        // L'aggiornamento verrà applicato dal real-time listener
        state.status = 'succeeded';
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Delete transaction - non aggiorniamo lo state, il listener Firestore lo farà
      .addCase(deleteTransaction.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state) => {
        // La rimozione verrà applicata dal real-time listener
        state.status = 'succeeded';
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setTransactions,
  setSelectedMonth,
  setCategoryFilter,
  clearFilters,
  clearError,
  clearTransactions,
} = walletSlice.actions;

export const walletReducer = walletSlice.reducer;
