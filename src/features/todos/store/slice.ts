/**
 * Todos Redux Slice
 * Usa Firestore per la persistenza
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Todo,
  CreateTodoPayload,
  UpdateTodoPayload,
  TodoStatus,
  TodoPriority,
  TodoFilter,
} from '../domain/types';
import { validateCreateTodo, validateUpdateTodo } from '../domain/validation';
import * as firestoreService from '../data/firestoreService';
import { NormalizedState } from '@shared/types';

/**
 * Todos state
 */
interface TodosState extends NormalizedState<Todo> {
  filter: TodoFilter;
  availableTags: string[];
}

/**
 * Initial state
 */
const initialState: TodosState = {
  ids: [],
  entities: {},
  status: 'idle',
  error: null,
  filter: {
    status: null,
    priority: null,
    tags: [],
    search: '',
    showCompleted: true,
  },
  availableTags: [],
};

/**
 * Async Thunks
 */

// Load all todos for current space
export const loadTodos = createAsyncThunk(
  'todos/loadTodos',
  async (spaceId: string, { rejectWithValue }) => {
    try {
      const todos = await firestoreService.getTodos(spaceId);
      const tags = await firestoreService.getAllTags(spaceId);
      return { todos, tags };
    } catch (error) {
      console.error('Error loading todos:', error);
      return rejectWithValue('Errore nel caricamento dei todos');
    }
  }
);

// Create todo
export const createTodo = createAsyncThunk(
  'todos/createTodo',
  async (payload: CreateTodoPayload, { getState, rejectWithValue }) => {
    // Get current space
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    const errors = validateCreateTodo(payload);
    if (errors) {
      return rejectWithValue(errors);
    }

    try {
      const todo = await firestoreService.createTodo(spaceId, payload);
      return todo;
    } catch (error) {
      console.error('Error creating todo:', error);
      return rejectWithValue({ general: 'Errore nella creazione del todo' });
    }
  }
);

// Update todo
export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async (payload: UpdateTodoPayload, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    const errors = validateUpdateTodo(payload);
    if (errors) {
      return rejectWithValue(errors);
    }

    try {
      const todo = await firestoreService.updateTodo(spaceId, payload);
      if (!todo) {
        return rejectWithValue({ general: 'Todo non trovato' });
      }
      return todo;
    } catch (error) {
      console.error('Error updating todo:', error);
      return rejectWithValue({ general: 'Errore nell\'aggiornamento del todo' });
    }
  }
);

// Delete todo
export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id: string, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue('Nessuno spazio selezionato');
    }

    try {
      const success = await firestoreService.deleteTodo(spaceId, id);
      if (!success) {
        return rejectWithValue('Todo non trovato');
      }
      return id;
    } catch (error) {
      console.error('Error deleting todo:', error);
      return rejectWithValue('Errore nell\'eliminazione del todo');
    }
  }
);

// Toggle todo status
export const toggleTodoStatus = createAsyncThunk(
  'todos/toggleStatus',
  async (id: string, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue('Nessuno spazio selezionato');
    }

    try {
      const todo = await firestoreService.toggleTodoStatus(spaceId, id);
      if (!todo) {
        return rejectWithValue('Todo non trovato');
      }
      return todo;
    } catch (error) {
      console.error('Error toggling todo status:', error);
      return rejectWithValue('Errore nel cambio di stato');
    }
  }
);

/**
 * Todos Slice
 */
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // Sync todos from Firestore listener
    setTodos: (state, action: PayloadAction<Todo[]>) => {
      state.ids = action.payload.map((t) => t.id);
      state.entities = action.payload.reduce(
        (acc, todo) => {
          acc[todo.id] = todo;
          return acc;
        },
        {} as Record<string, Todo>
      );
      // Update available tags
      const tags = new Set<string>();
      action.payload.forEach((todo) => {
        todo.tags.forEach((tag) => tags.add(tag));
      });
      state.availableTags = Array.from(tags).sort();
      state.status = 'succeeded';
    },
    setStatusFilter: (state, action: PayloadAction<TodoStatus | null>) => {
      state.filter.status = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<TodoPriority | null>) => {
      state.filter.priority = action.payload;
    },
    setTagsFilter: (state, action: PayloadAction<string[]>) => {
      state.filter.tags = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filter.search = action.payload;
    },
    toggleShowCompleted: (state) => {
      state.filter.showCompleted = !state.filter.showCompleted;
    },
    clearFilters: (state) => {
      state.filter = initialState.filter;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearTodos: (state) => {
      state.ids = [];
      state.entities = {};
      state.availableTags = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Load todos
      .addCase(loadTodos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ids = action.payload.todos.map((t) => t.id);
        state.entities = action.payload.todos.reduce(
          (acc, todo) => {
            acc[todo.id] = todo;
            return acc;
          },
          {} as Record<string, Todo>
        );
        state.availableTags = action.payload.tags;
      })
      .addCase(loadTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create todo - non aggiorniamo lo state, il listener Firestore lo farà
      .addCase(createTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(createTodo.fulfilled, (state) => {
        // Il todo verrà aggiunto dal real-time listener
        state.status = 'succeeded';
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Update todo - non aggiorniamo lo state, il listener Firestore lo farà
      .addCase(updateTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state) => {
        // L'aggiornamento verrà applicato dal real-time listener
        state.status = 'succeeded';
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.error = (action.payload as { general?: string })?.general || 'Errore';
      })
      // Delete todo - non aggiorniamo lo state, il listener Firestore lo farà
      .addCase(deleteTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTodo.fulfilled, (state) => {
        // La rimozione verrà applicata dal real-time listener
        state.status = 'succeeded';
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Toggle status - non aggiorniamo lo state, il listener Firestore lo farà
      .addCase(toggleTodoStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleTodoStatus.fulfilled, (state) => {
        // L'aggiornamento verrà applicato dal real-time listener
        state.status = 'succeeded';
      })
      .addCase(toggleTodoStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setTodos,
  setStatusFilter,
  setPriorityFilter,
  setTagsFilter,
  setSearchFilter,
  toggleShowCompleted,
  clearFilters,
  clearError,
  clearTodos,
} = todosSlice.actions;

export const todosReducer = todosSlice.reducer;
