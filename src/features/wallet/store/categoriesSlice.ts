/**
 * Categories Redux Slice
 * Gestisce lo state delle categorie personalizzate
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../domain/types';
import * as categoriesService from '../data/categoriesService';

/**
 * Categories state
 */
interface CategoriesState {
  items: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

/**
 * Initial state
 */
const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  error: null,
};

/**
 * Async Thunks
 */

// Create category
export const createCategory = createAsyncThunk(
  'categories/create',
  async (payload: CreateCategoryPayload, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const category = await categoriesService.createCategory(spaceId, payload);
      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      return rejectWithValue({ general: 'Errore nella creazione della categoria' });
    }
  }
);

// Update category
export const updateCategory = createAsyncThunk(
  'categories/update',
  async (payload: UpdateCategoryPayload, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const category = await categoriesService.updateCategory(spaceId, payload);
      if (!category) {
        return rejectWithValue({ general: 'Categoria non trovata' });
      }
      return category;
    } catch (error) {
      console.error('Error updating category:', error);
      return rejectWithValue({ general: 'Errore nell\'aggiornamento della categoria' });
    }
  }
);

// Delete category
export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (categoryId: string, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue('Nessuno spazio selezionato');
    }

    try {
      const success = await categoriesService.deleteCategory(spaceId, categoryId);
      if (!success) {
        return rejectWithValue('Categoria non trovata');
      }
      return categoryId;
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      const message = error instanceof Error ? error.message : 'Errore nell\'eliminazione della categoria';
      return rejectWithValue(message);
    }
  }
);

// Reorder categories
export const reorderCategories = createAsyncThunk(
  'categories/reorder',
  async (orderedIds: string[], { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      await categoriesService.reorderCategories(spaceId, orderedIds);
      return orderedIds;
    } catch (error) {
      console.error('Error reordering categories:', error);
      return rejectWithValue({ general: 'Errore nel riordino delle categorie' });
    }
  }
);

// Seed default categories
export const seedDefaultCategories = createAsyncThunk(
  'categories/seedDefaults',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    try {
      const categories = await categoriesService.seedDefaultCategories(spaceId);
      return categories;
    } catch (error) {
      console.error('Error seeding categories:', error);
      return rejectWithValue({ general: 'Errore nella creazione delle categorie predefinite' });
    }
  }
);

/**
 * Categories Slice
 */
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Sync categories from Firestore listener
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.items = action.payload;
      state.status = 'succeeded';
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCategories: (state) => {
      state.items = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Reorder categories
      .addCase(reorderCategories.pending, (state) => {
        state.error = null;
      })
      .addCase(reorderCategories.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(reorderCategories.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Seed defaults
      .addCase(seedDefaultCategories.pending, (state) => {
        state.error = null;
        state.status = 'loading';
      })
      .addCase(seedDefaultCategories.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(seedDefaultCategories.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
        state.status = 'failed';
      });
  },
});

export const {
  setCategories,
  clearError,
  clearCategories,
} = categoriesSlice.actions;

export const categoriesReducer = categoriesSlice.reducer;

/**
 * Selectors
 */
export const selectAllCategories = (state: { categories: CategoriesState }) => state.categories.items;
export const selectExpenseCategories = (state: { categories: CategoriesState }) =>
  state.categories.items.filter(c => c.type === 'expense');
export const selectIncomeCategories = (state: { categories: CategoriesState }) =>
  state.categories.items.filter(c => c.type === 'income');
export const selectCategoryById = (id: string) => (state: { categories: CategoriesState }) =>
  state.categories.items.find(c => c.id === id);
export const selectCategoriesLoading = (state: { categories: CategoriesState }) =>
  state.categories.status === 'loading';
export const selectCategoriesError = (state: { categories: CategoriesState }) => state.categories.error;
