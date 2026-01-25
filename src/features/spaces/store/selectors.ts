/**
 * Spaces Selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@app/store';

export const selectSpaces = (state: RootState) => state.spaces.spaces;
export const selectCurrentSpaceId = (state: RootState) => state.spaces.currentSpaceId;
export const selectPendingInvites = (state: RootState) => state.spaces.pendingInvites;
export const selectSpacesLoading = (state: RootState) => state.spaces.isLoading;
export const selectSpacesInitialized = (state: RootState) => state.spaces.isInitialized;
export const selectSpacesError = (state: RootState) => state.spaces.error;

export const selectCurrentSpace = createSelector(
  [selectSpaces, selectCurrentSpaceId],
  (spaces, currentSpaceId) => spaces.find(s => s.id === currentSpaceId) || null
);

export const selectPersonalSpace = createSelector(
  [selectSpaces],
  (spaces) => spaces.find(s => s.isPersonal) || null
);

export const selectSharedSpaces = createSelector(
  [selectSpaces],
  (spaces) => spaces.filter(s => !s.isPersonal)
);

export const selectPendingInvitesCount = createSelector(
  [selectPendingInvites],
  (pendingInvites) => pendingInvites.length
);
