/**
 * Calendar Redux Slice
 * Usa Firestore per la persistenza
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  CalendarEvent,
  CreateEventPayload,
  UpdateEventPayload,
  CalendarViewMode,
} from '../domain/types';
import { validateCreateEvent, validateUpdateEvent } from '../domain/validation';
import * as firestoreService from '../data/firestoreService';
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

// Load all events for current space
export const loadEvents = createAsyncThunk(
  'calendar/loadEvents',
  async (spaceId: string, { rejectWithValue }) => {
    try {
      const events = await firestoreService.getEvents(spaceId);
      return events;
    } catch (error) {
      console.error('Error loading events:', error);
      return rejectWithValue('Errore nel caricamento degli eventi');
    }
  }
);

// Create event
export const createEvent = createAsyncThunk(
  'calendar/createEvent',
  async (payload: CreateEventPayload, { getState, rejectWithValue }) => {
    // Get current space
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    // Validate
    const errors = validateCreateEvent(payload);
    if (errors) {
      return rejectWithValue(errors);
    }

    try {
      const event = await firestoreService.createEvent(spaceId, payload);
      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      return rejectWithValue({ general: 'Errore nella creazione dell\'evento' });
    }
  }
);

// Update event
export const updateEvent = createAsyncThunk(
  'calendar/updateEvent',
  async (payload: UpdateEventPayload, { getState, rejectWithValue }) => {
    const state = getState() as {
      calendar: CalendarState;
      spaces: { currentSpaceId: string | null };
    };
    const spaceId = state.spaces.currentSpaceId;
    const existingEvent = state.calendar.entities[payload.id];

    if (!spaceId) {
      return rejectWithValue({ general: 'Nessuno spazio selezionato' });
    }

    if (!existingEvent) {
      return rejectWithValue({ general: 'Evento non trovato' });
    }

    // Validate
    const errors = validateUpdateEvent(payload, existingEvent);
    if (errors) {
      return rejectWithValue(errors);
    }

    try {
      const event = await firestoreService.updateEvent(spaceId, payload);
      if (!event) {
        return rejectWithValue({ general: 'Evento non trovato' });
      }
      return event;
    } catch (error) {
      console.error('Error updating event:', error);
      return rejectWithValue({ general: 'Errore nell\'aggiornamento dell\'evento' });
    }
  }
);

// Delete event
export const deleteEvent = createAsyncThunk(
  'calendar/deleteEvent',
  async (id: string, { getState, rejectWithValue }) => {
    const state = getState() as { spaces: { currentSpaceId: string | null } };
    const spaceId = state.spaces.currentSpaceId;

    if (!spaceId) {
      return rejectWithValue('Nessuno spazio selezionato');
    }

    try {
      const success = await firestoreService.deleteEvent(spaceId, id);
      if (!success) {
        return rejectWithValue('Evento non trovato');
      }
      return id;
    } catch (error) {
      console.error('Error deleting event:', error);
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
    // Sync events from Firestore listener
    setEvents: (state, action: PayloadAction<CalendarEvent[]>) => {
      state.ids = action.payload.map((e) => e.id);
      state.entities = action.payload.reduce(
        (acc, event) => {
          acc[event.id] = event;
          return acc;
        },
        {} as Record<string, CalendarEvent>
      );
      state.status = 'succeeded';
    },
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
    clearEvents: (state) => {
      state.ids = [];
      state.entities = {};
      state.status = 'idle';
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
      // Create event - non aggiungiamo allo state, il listener Firestore lo farà
      .addCase(createEvent.pending, (state) => {
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state) => {
        // L'evento verrà aggiunto dal real-time listener
        state.status = 'succeeded';
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = JSON.stringify(action.payload);
      })
      // Update event - non aggiorniamo lo state, il listener Firestore lo farà
      .addCase(updateEvent.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      // Delete event - non rimuoviamo dallo state, il listener Firestore lo farà
      .addCase(deleteEvent.fulfilled, (state, action) => {
        if (state.selectedEventId === action.payload) {
          state.selectedEventId = null;
        }
      });
  },
});

export const {
  setEvents,
  setSelectedDate,
  setViewMode,
  setSelectedEvent,
  clearError,
  clearEvents,
} = calendarSlice.actions;

export const calendarReducer = calendarSlice.reducer;
