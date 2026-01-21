/**
 * Auth Selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@app/store';

const selectAuthState = (state: RootState) => state.auth;

export const selectUser = createSelector(
  selectAuthState,
  (auth) => auth.user
);

export const selectAuthStatus = createSelector(
  selectAuthState,
  (auth) => auth.status
);

export const selectAuthError = createSelector(
  selectAuthState,
  (auth) => auth.error
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (auth) => auth.status === 'authenticated' && !!auth.user
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (auth) => auth.status === 'loading'
);

export const selectIsInitialized = createSelector(
  selectAuthState,
  (auth) => auth.isInitialized
);
