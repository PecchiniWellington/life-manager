/**
 * Spaces Selectors
 */

import { RootState } from '@app/store';

export const selectSpaces = (state: RootState) => state.spaces.spaces;
export const selectCurrentSpaceId = (state: RootState) => state.spaces.currentSpaceId;
export const selectPendingInvites = (state: RootState) => state.spaces.pendingInvites;
export const selectSpacesLoading = (state: RootState) => state.spaces.isLoading;
export const selectSpacesInitialized = (state: RootState) => state.spaces.isInitialized;
export const selectSpacesError = (state: RootState) => state.spaces.error;

export const selectCurrentSpace = (state: RootState) => {
  const { spaces, currentSpaceId } = state.spaces;
  return spaces.find(s => s.id === currentSpaceId) || null;
};

export const selectPersonalSpace = (state: RootState) => {
  return state.spaces.spaces.find(s => s.isPersonal) || null;
};

export const selectSharedSpaces = (state: RootState) => {
  return state.spaces.spaces.filter(s => !s.isPersonal);
};

export const selectPendingInvitesCount = (state: RootState) => {
  return state.spaces.pendingInvites.length;
};
