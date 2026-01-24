/**
 * Accounts Redux Slice
 * Gestisce lo state dei conti
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Account,
  CreateAccountPayload,
  UpdateAccountPayload,
} from '../domain/types';
import * as accountsService from '../data/accountsService';

/**
 * Accounts state
 */
interface AccountsState {
  items: Account[];
  selectedAccountId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

/**
 * Initial state
 */
const initialState: AccountsState = {
  items: [],
  selectedAccountId: null,
  status: 'idle',
  error: null,
};

/**
 * Async Thunks
 */

// Create account
export const createAccount = createAsyncThunk(
  'accounts/create',
  async (payload: CreateAccountPayload, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const account = await accountsService.createAccount(spaceId, payload);
      return account;
    } catch (error) {
      console.error('Error creating account:', error);
      return rejectWithValue({ general: 'Errore nella creazione del conto' });
    }
  }
);

// Update account
export const updateAccount = createAsyncThunk(
  'accounts/update',
  async (payload: UpdateAccountPayload, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const account = await accountsService.updateAccount(spaceId, payload);
      if (!account) {
        return rejectWithValue({ general: 'Conto non trovato' });
      }
      return account;
    } catch (error) {
      console.error('Error updating account:', error);
      return rejectWithValue({ general: 'Errore nell\'aggiornamento del conto' });
    }
  }
);

// Delete account
export const deleteAccount = createAsyncThunk(
  'accounts/delete',
  async (accountId: string, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue('Nessuno spazio selezionato');
    }

    try {
      const success = await accountsService.deleteAccount(spaceId, accountId);
      if (!success) {
        return rejectWithValue('Conto non trovato');
      }
      return accountId;
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      const message = error instanceof Error ? error.message : 'Errore nell\'eliminazione del conto';
      return rejectWithValue(message);
    }
  }
);

/**
 * Accounts Slice
 */
const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    // Sync accounts from Firestore listener
    setAccounts: (state, action: PayloadAction<Account[]>) => {
      state.items = action.payload;
      state.status = 'succeeded';

      // Auto-select default account if none selected
      if (!state.selectedAccountId && action.payload.length > 0) {
        const defaultAccount = action.payload.find(a => a.isDefault);
        state.selectedAccountId = defaultAccount?.id || action.payload[0].id;
      }
    },
    setSelectedAccount: (state, action: PayloadAction<string | null>) => {
      state.selectedAccountId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAccounts: (state) => {
      state.items = [];
      state.selectedAccountId = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Create account
      .addCase(createAccount.pending, (state) => {
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Update account
      .addCase(updateAccount.pending, (state) => {
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setAccounts,
  setSelectedAccount,
  clearError,
  clearAccounts,
} = accountsSlice.actions;

export const accountsReducer = accountsSlice.reducer;

/**
 * Selectors
 */
export const selectAllAccounts = (state: { accounts: AccountsState }) => state.accounts.items;
export const selectSelectedAccountId = (state: { accounts: AccountsState }) => state.accounts.selectedAccountId;
export const selectSelectedAccount = (state: { accounts: AccountsState }) => {
  const id = state.accounts.selectedAccountId;
  return id ? state.accounts.items.find(a => a.id === id) : null;
};
export const selectDefaultAccount = (state: { accounts: AccountsState }) =>
  state.accounts.items.find(a => a.isDefault);
export const selectAccountById = (id: string) => (state: { accounts: AccountsState }) =>
  state.accounts.items.find(a => a.id === id);
export const selectAccountsLoading = (state: { accounts: AccountsState }) =>
  state.accounts.status === 'loading';
export const selectAccountsError = (state: { accounts: AccountsState }) => state.accounts.error;
