/**
 * Goals Redux Slice
 * Gestisce lo state degli obiettivi di risparmio
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  SavingsGoal,
  CreateGoalPayload,
  UpdateGoalPayload,
} from '../domain/types';
import * as goalsService from '../data/goalsService';

/**
 * Goals state
 */
interface GoalsState {
  items: SavingsGoal[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

/**
 * Initial state
 */
const initialState: GoalsState = {
  items: [],
  status: 'idle',
  error: null,
};

/**
 * Async Thunks
 */

// Create goal
export const createGoal = createAsyncThunk(
  'goals/create',
  async (payload: CreateGoalPayload, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const goal = await goalsService.createGoal(spaceId, payload);
      return goal;
    } catch (error) {
      console.error('Error creating goal:', error);
      return rejectWithValue({ general: 'Errore nella creazione dell\'obiettivo' });
    }
  }
);

// Update goal
export const updateGoal = createAsyncThunk(
  'goals/update',
  async (payload: UpdateGoalPayload, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const goal = await goalsService.updateGoal(spaceId, payload);
      if (!goal) {
        return rejectWithValue({ general: 'Obiettivo non trovato' });
      }
      return goal;
    } catch (error) {
      console.error('Error updating goal:', error);
      return rejectWithValue({ general: 'Errore nell\'aggiornamento dell\'obiettivo' });
    }
  }
);

// Add to goal
export const addToGoal = createAsyncThunk(
  'goals/addAmount',
  async ({ goalId, amount }: { goalId: string; amount: number }, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const goal = await goalsService.addToGoal(spaceId, goalId, amount);
      if (!goal) {
        return rejectWithValue({ general: 'Obiettivo non trovato' });
      }
      return goal;
    } catch (error) {
      console.error('Error adding to goal:', error);
      return rejectWithValue({ general: 'Errore nell\'aggiunta all\'obiettivo' });
    }
  }
);

// Withdraw from goal
export const withdrawFromGoal = createAsyncThunk(
  'goals/withdrawAmount',
  async ({ goalId, amount }: { goalId: string; amount: number }, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const goal = await goalsService.withdrawFromGoal(spaceId, goalId, amount);
      if (!goal) {
        return rejectWithValue({ general: 'Obiettivo non trovato' });
      }
      return goal;
    } catch (error) {
      console.error('Error withdrawing from goal:', error);
      return rejectWithValue({ general: 'Errore nel prelievo dall\'obiettivo' });
    }
  }
);

// Delete goal
export const deleteGoal = createAsyncThunk(
  'goals/delete',
  async (goalId: string, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue('Nessuno spazio selezionato');
    }

    try {
      const success = await goalsService.deleteGoal(spaceId, goalId);
      if (!success) {
        return rejectWithValue('Obiettivo non trovato');
      }
      return goalId;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return rejectWithValue('Errore nell\'eliminazione dell\'obiettivo');
    }
  }
);

/**
 * Goals Slice
 */
const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    // Sync goals from Firestore listener
    setGoals: (state, action: PayloadAction<SavingsGoal[]>) => {
      state.items = action.payload;
      state.status = 'succeeded';
    },
    clearError: (state) => {
      state.error = null;
    },
    clearGoals: (state) => {
      state.items = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Create goal
      .addCase(createGoal.pending, (state) => {
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Update goal
      .addCase(updateGoal.pending, (state) => {
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Add to goal
      .addCase(addToGoal.pending, (state) => {
        state.error = null;
      })
      .addCase(addToGoal.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(addToGoal.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Withdraw from goal
      .addCase(withdrawFromGoal.pending, (state) => {
        state.error = null;
      })
      .addCase(withdrawFromGoal.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(withdrawFromGoal.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Delete goal
      .addCase(deleteGoal.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setGoals,
  clearError,
  clearGoals,
} = goalsSlice.actions;

export const goalsReducer = goalsSlice.reducer;

/**
 * Selectors
 */
import { createSelector } from '@reduxjs/toolkit';

export const selectAllGoals = (state: { goals: GoalsState }) => state.goals.items;
export const selectGoalsStatus = (state: { goals: GoalsState }) => state.goals.status;
export const selectGoalsError = (state: { goals: GoalsState }) => state.goals.error;

export const selectActiveGoals = createSelector(
  [selectAllGoals],
  (goals) => goals.filter(g => g.status === 'active')
);

export const selectCompletedGoals = createSelector(
  [selectAllGoals],
  (goals) => goals.filter(g => g.status === 'completed')
);

export const selectGoalById = (id: string) => createSelector(
  [selectAllGoals],
  (goals) => goals.find(g => g.id === id)
);

export const selectGoalsLoading = createSelector(
  [selectGoalsStatus],
  (status) => status === 'loading'
);

export const selectTotalSavings = createSelector(
  [selectActiveGoals],
  (activeGoals) => activeGoals.reduce((sum, g) => sum + g.currentAmount, 0)
);
