/**
 * Todos Redux Slice
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
import * as repository from '../data/repository';
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

// Load all todos
export const loadTodos = createAsyncThunk(
  'todos/loadTodos',
  async (_, { rejectWithValue }) => {
    try {
      const todos = await repository.getAllTodos();
      const tags = await repository.getAllTags();
      return { todos, tags };
    } catch (error) {
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
      const todo = await repository.createTodo(payload, spaceId);
      return todo;
    } catch (error) {
      return rejectWithValue({ general: 'Errore nella creazione del todo' });
    }
  }
);

// Update todo
export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async (payload: UpdateTodoPayload, { rejectWithValue }) => {
    const errors = validateUpdateTodo(payload);
    if (errors) {
      return rejectWithValue(errors);
    }

    try {
      const todo = await repository.updateTodo(payload);
      if (!todo) {
        return rejectWithValue({ general: 'Todo non trovato' });
      }
      return todo;
    } catch (error) {
      return rejectWithValue({ general: 'Errore nell\'aggiornamento del todo' });
    }
  }
);

// Delete todo
export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await repository.deleteTodo(id);
      if (!success) {
        return rejectWithValue('Todo non trovato');
      }
      return id;
    } catch (error) {
      return rejectWithValue('Errore nell\'eliminazione del todo');
    }
  }
);

// Toggle todo status
export const toggleTodoStatus = createAsyncThunk(
  'todos/toggleStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      const todo = await repository.toggleTodoStatus(id);
      if (!todo) {
        return rejectWithValue('Todo non trovato');
      }
      return todo;
    } catch (error) {
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
      // Create todo
      .addCase(createTodo.fulfilled, (state, action) => {
        state.ids.push(action.payload.id);
        state.entities[action.payload.id] = action.payload;
        // Update available tags
        action.payload.tags.forEach((tag) => {
          if (!state.availableTags.includes(tag)) {
            state.availableTags.push(tag);
          }
        });
      })
      // Update todo
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
      })
      // Delete todo
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.ids = state.ids.filter((id) => id !== action.payload);
        delete state.entities[action.payload];
      })
      // Toggle status
      .addCase(toggleTodoStatus.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
      });
  },
});

export const {
  setStatusFilter,
  setPriorityFilter,
  setTagsFilter,
  setSearchFilter,
  toggleShowCompleted,
  clearFilters,
  clearError,
} = todosSlice.actions;

export const todosReducer = todosSlice.reducer;
