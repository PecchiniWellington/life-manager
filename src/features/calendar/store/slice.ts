/**
 * Calendar Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  CalendarEvent,
  CreateEventPayload,
  UpdateEventPayload,
  CalendarViewMode,
} from '../domain/types';
import { validateCreateEvent, validateUpdateEvent } from '../domain/validation';
import * as repository from '../data/repository';
import { NormalizedState } from '@shared/types';

/**
 * Calendar state
 */
interface CalendarState extends NormalizedState<CalendarEvent> {
  selectedDate: string;
  viewMode: CalendarViewMode;
  selectedEventId: string | null;
}

/**
 * Initial state
 */
const initialState: CalendarState = {
  ids: [],
  entities: {},
  status: 'idle',
  error: null,
  selectedDate: new Date().toISOString(),
  viewMode: 'month',
  selectedEventId: null,
};

/**
 * Async Thunks
 */

// Load all events
export const loadEvents = createAsyncThunk(
  'calendar/loadEvents',
  async (_, { rejectWithValue }) => {
    try {
      const events = await repository.getAllEvents();
      return events;
    } catch (error) {
      return rejectWithValue('Errore nel caricamento degli eventi');
    }
  }
);

// Create event
export const createEvent = createAsyncThunk(
  'calendar/createEvent',
  async (payload: CreateEventPayload, { rejectWithValue }) => {
    // Validate
    const errors = validateCreateEvent(payload);
    if (errors) {
      return rejectWithValue(errors);
    }

    try {
      const event = await repository.createEvent(payload);
      return event;
    } catch (error) {
      return rejectWithValue({ general: 'Errore nella creazione dell\'evento' });
    }
  }
);

// Update event
export const updateEvent = createAsyncThunk(
  'calendar/updateEvent',
  async (payload: UpdateEventPayload, { getState, rejectWithValue }) => {
    const state = getState() as { calendar: CalendarState };
    const existingEvent = state.calendar.entities[payload.id];

    if (!existingEvent) {
      return rejectWithValue({ general: 'Evento non trovato' });
    }

    // Validate
    const errors = validateUpdateEvent(payload, existingEvent);
    if (errors) {
      return rejectWithValue(errors);
    }

    try {
      const event = await repository.updateEvent(payload);
      if (!event) {
        return rejectWithValue({ general: 'Evento non trovato' });
      }
      return event;
    } catch (error) {
      return rejectWithValue({ general: 'Errore nell\'aggiornamento dell\'evento' });
    }
  }
);

// Delete event
export const deleteEvent = createAsyncThunk(
  'calendar/deleteEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await repository.deleteEvent(id);
      if (!success) {
        return rejectWithValue('Evento non trovato');
      }
      return id;
    } catch (error) {
      return rejectWithValue('Errore nell\'eliminazione dell\'evento');
    }
  }
);

/**
 * Calendar Slice
 */
const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setViewMode: (state, action: PayloadAction<CalendarViewMode>) => {
      state.viewMode = action.payload;
    },
    setSelectedEvent: (state, action: PayloadAction<string | null>) => {
      state.selectedEventId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load events
      .addCase(loadEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ids = action.payload.map((e) => e.id);
        state.entities = action.payload.reduce(
          (acc, event) => {
            acc[event.id] = event;
            return acc;
          },
          {} as Record<string, CalendarEvent>
        );
      })
      .addCase(loadEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ids.push(action.payload.id);
        state.entities[action.payload.id] = action.payload;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = JSON.stringify(action.payload);
      })
      // Update event
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
      })
      // Delete event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.ids = state.ids.filter((id) => id !== action.payload);
        delete state.entities[action.payload];
        if (state.selectedEventId === action.payload) {
          state.selectedEventId = null;
        }
      });
  },
});

export const {
  setSelectedDate,
  setViewMode,
  setSelectedEvent,
  clearError,
} = calendarSlice.actions;

export const calendarReducer = calendarSlice.reducer;
