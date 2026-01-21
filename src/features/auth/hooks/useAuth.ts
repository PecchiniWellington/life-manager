/**
 * useAuth Hook
 * Hook per gestire autenticazione
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  loginAsync,
  registerAsync,
  logoutAsync,
  setUser,
  setInitialized,
  clearError,
  selectUser,
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsInitialized,
} from '../store';
import { LoginPayload, RegisterPayload } from '../domain/types';
import { authService } from '../data/authService';

export function useAuth() {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const isInitialized = useAppSelector(selectIsInitialized);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      dispatch(setUser(firebaseUser));
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Login
  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await dispatch(loginAsync(payload));
      return loginAsync.fulfilled.match(result);
    },
    [dispatch]
  );

  // Register
  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await dispatch(registerAsync(payload));
      return registerAsync.fulfilled.match(result);
    },
    [dispatch]
  );

  // Logout
  const logout = useCallback(async () => {
    await dispatch(logoutAsync());
  }, [dispatch]);

  // Clear error
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    status,
    error,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    register,
    logout,
    clearError: clearAuthError,
  };
}
