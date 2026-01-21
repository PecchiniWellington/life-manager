/**
 * Auth Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  User,
  AuthStatus,
  LoginPayload,
  RegisterPayload,
  getAuthErrorMessage,
} from '../domain/types';
import { authService } from '../data/authService';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  isInitialized: false,
};

/**
 * Login async thunk
 */
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const user = await authService.login(payload.email, payload.password);
      return user;
    } catch (error: any) {
      const errorCode = error.code || 'default';
      return rejectWithValue(getAuthErrorMessage(errorCode));
    }
  }
);

/**
 * Register async thunk
 */
export const registerAsync = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const user = await authService.register(
        payload.email,
        payload.password,
        payload.displayName
      );
      return user;
    } catch (error: any) {
      const errorCode = error.code || 'default';
      return rejectWithValue(getAuthErrorMessage(errorCode));
    }
  }
);

/**
 * Logout async thunk
 */
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      return rejectWithValue('Errore durante il logout');
    }
  }
);

/**
 * Auth slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
      state.isInitialized = true;
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.status = 'unauthenticated';
        state.user = null;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setInitialized, clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
