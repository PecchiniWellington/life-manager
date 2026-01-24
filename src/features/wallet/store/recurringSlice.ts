/**
 * Recurring Transactions Redux Slice
 * Gestisce lo state delle transazioni ricorrenti
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  RecurringTransaction,
  CreateRecurringPayload,
  UpdateRecurringPayload,
} from '../domain/types';
import * as recurringService from '../data/recurringService';

/**
 * Recurring state
 */
interface RecurringState {
  items: RecurringTransaction[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

/**
 * Initial state
 */
const initialState: RecurringState = {
  items: [],
  status: 'idle',
  error: null,
};

/**
 * Async Thunks
 */

// Create recurring
export const createRecurring = createAsyncThunk(
  'recurring/create',
  async (payload: CreateRecurringPayload, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const recurring = await recurringService.createRecurring(spaceId, payload);
      return recurring;
    } catch (error) {
      console.error('Error creating recurring:', error);
      return rejectWithValue({ general: 'Errore nella creazione della transazione ricorrente' });
    }
  }
);

// Update recurring
export const updateRecurring = createAsyncThunk(
  'recurring/update',
  async (payload: UpdateRecurringPayload, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const recurring = await recurringService.updateRecurring(spaceId, payload);
      if (!recurring) {
        return rejectWithValue({ general: 'Transazione ricorrente non trovata' });
      }
      return recurring;
    } catch (error) {
      console.error('Error updating recurring:', error);
      return rejectWithValue({ general: 'Errore nell\'aggiornamento' });
    }
  }
);

// Pause recurring
export const pauseRecurring = createAsyncThunk(
  'recurring/pause',
  async (recurringId: string, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const recurring = await recurringService.pauseRecurring(spaceId, recurringId);
      if (!recurring) {
        return rejectWithValue({ general: 'Transazione ricorrente non trovata' });
      }
      return recurring;
    } catch (error) {
      console.error('Error pausing recurring:', error);
      return rejectWithValue({ general: 'Errore nella pausa' });
    }
  }
);

// Resume recurring
export const resumeRecurring = createAsyncThunk(
  'recurring/resume',
  async (recurringId: string, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const recurring = await recurringService.resumeRecurring(spaceId, recurringId);
      if (!recurring) {
        return rejectWithValue({ general: 'Transazione ricorrente non trovata' });
      }
      return recurring;
    } catch (error) {
      console.error('Error resuming recurring:', error);
      return rejectWithValue({ general: 'Errore nella riattivazione' });
    }
  }
);

// Delete recurring
export const deleteRecurring = createAsyncThunk(
  'recurring/delete',
  async (recurringId: string, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue('Nessuno spazio selezionato');
    }

    try {
      const success = await recurringService.deleteRecurring(spaceId, recurringId);
      if (!success) {
        return rejectWithValue('Transazione ricorrente non trovata');
      }
      return recurringId;
    } catch (error) {
      console.error('Error deleting recurring:', error);
      return rejectWithValue('Errore nell\'eliminazione');
    }
  }
);

/**
 * Recurring Slice
 */
const recurringSlice = createSlice({
  name: 'recurring',
  initialState,
  reducers: {
    // Sync recurring from Firestore listener
    setRecurring: (state, action: PayloadAction<RecurringTransaction[]>) => {
      state.items = action.payload;
      state.status = 'succeeded';
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRecurring: (state) => {
      state.items = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Create recurring
      .addCase(createRecurring.pending, (state) => {
        state.error = null;
      })
      .addCase(createRecurring.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createRecurring.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Update recurring
      .addCase(updateRecurring.pending, (state) => {
        state.error = null;
      })
      .addCase(updateRecurring.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(updateRecurring.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Pause recurring
      .addCase(pauseRecurring.pending, (state) => {
        state.error = null;
      })
      .addCase(pauseRecurring.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(pauseRecurring.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Resume recurring
      .addCase(resumeRecurring.pending, (state) => {
        state.error = null;
      })
      .addCase(resumeRecurring.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(resumeRecurring.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Delete recurring
      .addCase(deleteRecurring.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteRecurring.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(deleteRecurring.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setRecurring,
  clearError,
  clearRecurring,
} = recurringSlice.actions;

export const recurringReducer = recurringSlice.reducer;

/**
 * Selectors
 */
export const selectAllRecurring = (state: { recurring: RecurringState }) => state.recurring.items;
export const selectActiveRecurring = (state: { recurring: RecurringState }) =>
  state.recurring.items.filter(r => r.isActive);
export const selectPausedRecurring = (state: { recurring: RecurringState }) =>
  state.recurring.items.filter(r => !r.isActive);
export const selectRecurringById = (id: string) => (state: { recurring: RecurringState }) =>
  state.recurring.items.find(r => r.id === id);
export const selectRecurringLoading = (state: { recurring: RecurringState }) =>
  state.recurring.status === 'loading';
export const selectRecurringError = (state: { recurring: RecurringState }) => state.recurring.error;
export const selectDueRecurring = (state: { recurring: RecurringState }) => {
  const today = new Date().toISOString().split('T')[0];
  return state.recurring.items.filter(r => r.isActive && r.nextExecution <= today);
};
export const selectMonthlyRecurringTotal = (state: { recurring: RecurringState }): { expenses: number; income: number } => {
  const active = state.recurring.items.filter(r => r.isActive);

  const calculateMonthly = (item: RecurringTransaction): number => {
    switch (item.frequency) {
      case 'daily': return item.amount * 30;
      case 'weekly': return item.amount * 4;
      case 'biweekly': return item.amount * 2;
      case 'monthly': return item.amount;
      case 'yearly': return item.amount / 12;
      default: return item.amount;
    }
  };

  const expenses = active
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + calculateMonthly(r), 0);

  const income = active
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + calculateMonthly(r), 0);

  return { expenses, income };
};
