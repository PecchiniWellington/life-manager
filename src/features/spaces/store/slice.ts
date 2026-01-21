/**
 * Spaces Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Space, SpaceInvite, CreateSpacePayload, InviteToSpacePayload } from '../domain/types';
import * as spacesService from '../data/spacesService';

interface SpacesState {
  spaces: Space[];
  currentSpaceId: string | null;
  pendingInvites: SpaceInvite[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const initialState: SpacesState = {
  spaces: [],
  currentSpaceId: null,
  pendingInvites: [],
  isLoading: false,
  isInitialized: false,
  error: null,
};

// Async Thunks
export const createPersonalSpaceAsync = createAsyncThunk(
  'spaces/createPersonal',
  async ({ userId, email, displayName }: { userId: string; email: string; displayName: string | null }) => {
    return await spacesService.createPersonalSpace(userId, email, displayName);
  }
);

export const createSpaceAsync = createAsyncThunk(
  'spaces/create',
  async (payload: CreateSpacePayload) => {
    return await spacesService.createSpace(payload);
  }
);

export const fetchUserSpacesAsync = createAsyncThunk(
  'spaces/fetchUserSpaces',
  async () => {
    return await spacesService.getUserSpaces();
  }
);

export const deleteSpaceAsync = createAsyncThunk(
  'spaces/delete',
  async (spaceId: string) => {
    await spacesService.deleteSpace(spaceId);
    return spaceId;
  }
);

export const inviteToSpaceAsync = createAsyncThunk(
  'spaces/invite',
  async (payload: InviteToSpacePayload) => {
    return await spacesService.inviteToSpace(payload);
  }
);

export const fetchPendingInvitesAsync = createAsyncThunk(
  'spaces/fetchPendingInvites',
  async () => {
    return await spacesService.getPendingInvites();
  }
);

export const acceptInviteAsync = createAsyncThunk(
  'spaces/acceptInvite',
  async (inviteId: string) => {
    await spacesService.acceptInvite(inviteId);
    return inviteId;
  }
);

export const rejectInviteAsync = createAsyncThunk(
  'spaces/rejectInvite',
  async (inviteId: string) => {
    await spacesService.rejectInvite(inviteId);
    return inviteId;
  }
);

export const setCurrentSpaceAsync = createAsyncThunk(
  'spaces/setCurrent',
  async (spaceId: string) => {
    await spacesService.setCurrentSpace(spaceId);
    return spaceId;
  }
);

export const leaveSpaceAsync = createAsyncThunk(
  'spaces/leave',
  async (spaceId: string) => {
    await spacesService.leaveSpace(spaceId);
    return spaceId;
  }
);

const spacesSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    setSpaces: (state, action: PayloadAction<Space[]>) => {
      // Deduplica per sicurezza (usando Map per mantenere solo l'ultimo per id)
      const uniqueSpaces = Array.from(
        new Map(action.payload.map(s => [s.id, s])).values()
      );
      state.spaces = uniqueSpaces;
      state.isInitialized = true;
    },
    setCurrentSpaceId: (state, action: PayloadAction<string | null>) => {
      state.currentSpaceId = action.payload;
    },
    setPendingInvites: (state, action: PayloadAction<SpaceInvite[]>) => {
      state.pendingInvites = action.payload;
    },
    updateSpace: (state, action: PayloadAction<Space>) => {
      const index = state.spaces.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.spaces[index] = action.payload;
      }
    },
    addSpace: (state, action: PayloadAction<Space>) => {
      state.spaces.push(action.payload);
    },
    removeSpace: (state, action: PayloadAction<string>) => {
      state.spaces = state.spaces.filter(s => s.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSpaces: () => initialState,
  },
  extraReducers: (builder) => {
    // Create Personal Space
    // NON facciamo push qui - il listener Firestore aggiornerà gli spazi
    builder.addCase(createPersonalSpaceAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createPersonalSpaceAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      // Imposta currentSpaceId subito (il listener aggiornerà la lista spaces)
      state.currentSpaceId = action.payload.id;
    });
    builder.addCase(createPersonalSpaceAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Errore nella creazione dello spazio personale';
    });

    // Create Space
    // NON facciamo push qui - il listener Firestore aggiornerà gli spazi
    builder.addCase(createSpaceAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createSpaceAsync.fulfilled, (state) => {
      state.isLoading = false;
      // Il listener Firestore aggiornerà la lista degli spazi
    });
    builder.addCase(createSpaceAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Errore nella creazione dello spazio';
    });

    // Fetch User Spaces
    builder.addCase(fetchUserSpacesAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserSpacesAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.spaces = action.payload;
      state.isInitialized = true;
    });
    builder.addCase(fetchUserSpacesAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Errore nel caricamento degli spazi';
    });

    // Delete Space
    builder.addCase(deleteSpaceAsync.fulfilled, (state, action) => {
      state.spaces = state.spaces.filter(s => s.id !== action.payload);
      if (state.currentSpaceId === action.payload) {
        // Passa allo spazio personale
        const personalSpace = state.spaces.find(s => s.isPersonal);
        state.currentSpaceId = personalSpace?.id || null;
      }
    });

    // Set Current Space
    builder.addCase(setCurrentSpaceAsync.fulfilled, (state, action) => {
      state.currentSpaceId = action.payload;
    });

    // Fetch Pending Invites
    builder.addCase(fetchPendingInvitesAsync.fulfilled, (state, action) => {
      state.pendingInvites = action.payload;
    });

    // Accept Invite
    builder.addCase(acceptInviteAsync.fulfilled, (state, action) => {
      state.pendingInvites = state.pendingInvites.filter(i => i.id !== action.payload);
    });

    // Reject Invite
    builder.addCase(rejectInviteAsync.fulfilled, (state, action) => {
      state.pendingInvites = state.pendingInvites.filter(i => i.id !== action.payload);
    });

    // Leave Space
    builder.addCase(leaveSpaceAsync.fulfilled, (state, action) => {
      state.spaces = state.spaces.filter(s => s.id !== action.payload);
      if (state.currentSpaceId === action.payload) {
        const personalSpace = state.spaces.find(s => s.isPersonal);
        state.currentSpaceId = personalSpace?.id || null;
      }
    });
  },
});

export const {
  setSpaces,
  setCurrentSpaceId,
  setPendingInvites,
  updateSpace,
  addSpace,
  removeSpace,
  clearError,
  resetSpaces,
} = spacesSlice.actions;

export default spacesSlice.reducer;
