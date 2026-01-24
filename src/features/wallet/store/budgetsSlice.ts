/**
 * Budgets Redux Slice
 * Gestisce lo state dei budget
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Budget,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '../domain/types';
import * as budgetsService from '../data/budgetsService';

/**
 * Budgets state
 */
interface BudgetsState {
  items: Budget[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

/**
 * Initial state
 */
const initialState: BudgetsState = {
  items: [],
  status: 'idle',
  error: null,
};

/**
 * Async Thunks
 */

// Create or update budget
export const upsertBudget = createAsyncThunk(
  'budgets/upsert',
  async (payload: CreateBudgetPayload, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const budget = await budgetsService.upsertBudget(spaceId, payload);
      return budget;
    } catch (error) {
      console.error('Error upserting budget:', error);
      return rejectWithValue({ general: 'Errore nel salvataggio del budget' });
    }
  }
);

// Update budget
export const updateBudget = createAsyncThunk(
  'budgets/update',
  async (payload: UpdateBudgetPayload, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const budget = await budgetsService.updateBudget(spaceId, payload);
      if (!budget) {
        return rejectWithValue({ general: 'Budget non trovato' });
      }
      return budget;
    } catch (error) {
      console.error('Error updating budget:', error);
      return rejectWithValue({ general: 'Errore nell\'aggiornamento del budget' });
    }
  }
);

// Update category limit
export const updateCategoryLimit = createAsyncThunk(
  'budgets/updateCategoryLimit',
  async (
    { budgetId, categoryId, limit }: { budgetId: string; categoryId: string; limit: number },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const budget = await budgetsService.updateCategoryLimit(spaceId, budgetId, categoryId, limit);
      if (!budget) {
        return rejectWithValue({ general: 'Budget non trovato' });
      }
      return budget;
    } catch (error) {
      console.error('Error updating category limit:', error);
      return rejectWithValue({ general: 'Errore nell\'aggiornamento del limite' });
    }
  }
);

// Delete budget
export const deleteBudget = createAsyncThunk(
  'budgets/delete',
  async (budgetId: string, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue('Nessuno spazio selezionato');
    }

    try {
      const success = await budgetsService.deleteBudget(spaceId, budgetId);
      if (!success) {
        return rejectWithValue('Budget non trovato');
      }
      return budgetId;
    } catch (error) {
      console.error('Error deleting budget:', error);
      return rejectWithValue('Errore nell\'eliminazione del budget');
    }
  }
);

// Copy budget from previous month
export const copyBudgetFromPrevious = createAsyncThunk(
  'budgets/copyFromPrevious',
  async (targetMonth: string, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const budget = await budgetsService.copyBudgetFromPreviousMonth(spaceId, targetMonth);
      if (!budget) {
        return rejectWithValue({ general: 'Nessun budget nel mese precedente' });
      }
      return budget;
    } catch (error) {
      console.error('Error copying budget:', error);
      return rejectWithValue({ general: 'Errore nella copia del budget' });
    }
  }
);

/**
 * Budgets Slice
 */
const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    // Sync budgets from Firestore listener
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.items = action.payload;
      state.status = 'succeeded';
    },
    clearError: (state) => {
      state.error = null;
    },
    clearBudgets: (state) => {
      state.items = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Upsert budget
      .addCase(upsertBudget.pending, (state) => {
        state.error = null;
      })
      .addCase(upsertBudget.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(upsertBudget.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Update budget
      .addCase(updateBudget.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Update category limit
      .addCase(updateCategoryLimit.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCategoryLimit.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(updateCategoryLimit.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Delete budget
      .addCase(deleteBudget.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Copy from previous
      .addCase(copyBudgetFromPrevious.pending, (state) => {
        state.error = null;
      })
      .addCase(copyBudgetFromPrevious.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(copyBudgetFromPrevious.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      });
  },
});

export const {
  setBudgets,
  clearError,
  clearBudgets,
} = budgetsSlice.actions;

export const budgetsReducer = budgetsSlice.reducer;

/**
 * Selectors
 */
export const selectAllBudgets = (state: { budgets: BudgetsState }) => state.budgets.items;
export const selectBudgetForMonth = (month: string) => (state: { budgets: BudgetsState }) =>
  state.budgets.items.find(b => b.month === month);
export const selectBudgetsLoading = (state: { budgets: BudgetsState }) =>
  state.budgets.status === 'loading';
export const selectBudgetsError = (state: { budgets: BudgetsState }) => state.budgets.error;
