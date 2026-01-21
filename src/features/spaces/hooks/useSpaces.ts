/**
 * useSpaces Hook
 * Hook per accedere agli spazi e alle azioni correlate
 * NOTA: I listener sono gestiti da SpacesProvider, questo hook serve solo per accedere ai dati
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  createSpaceAsync,
  deleteSpaceAsync,
  inviteToSpaceAsync,
  acceptInviteAsync,
  rejectInviteAsync,
  setCurrentSpaceAsync,
  leaveSpaceAsync,
  clearError,
  selectSpaces,
  selectCurrentSpaceId,
  selectCurrentSpace,
  selectPendingInvites,
  selectSpacesLoading,
  selectSpacesInitialized,
  selectSpacesError,
  selectPersonalSpace,
  selectSharedSpaces,
  selectPendingInvitesCount,
} from '../store';
import { CreateSpacePayload, InviteToSpacePayload } from '../domain/types';

export function useSpaces() {
  const dispatch = useAppDispatch();

  const spaces = useAppSelector(selectSpaces);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const currentSpace = useAppSelector(selectCurrentSpace);
  const pendingInvites = useAppSelector(selectPendingInvites);
  const isLoading = useAppSelector(selectSpacesLoading);
  const isInitialized = useAppSelector(selectSpacesInitialized);
  const error = useAppSelector(selectSpacesError);
  const personalSpace = useAppSelector(selectPersonalSpace);
  const sharedSpaces = useAppSelector(selectSharedSpaces);
  const pendingInvitesCount = useAppSelector(selectPendingInvitesCount);

  // Create Space
  const createSpace = useCallback(
    async (payload: CreateSpacePayload) => {
      const result = await dispatch(createSpaceAsync(payload));
      return createSpaceAsync.fulfilled.match(result);
    },
    [dispatch]
  );

  // Delete Space
  const deleteSpace = useCallback(
    async (spaceId: string) => {
      const result = await dispatch(deleteSpaceAsync(spaceId));
      return deleteSpaceAsync.fulfilled.match(result);
    },
    [dispatch]
  );

  // Invite to Space
  const inviteToSpace = useCallback(
    async (payload: InviteToSpacePayload) => {
      const result = await dispatch(inviteToSpaceAsync(payload));
      return inviteToSpaceAsync.fulfilled.match(result);
    },
    [dispatch]
  );

  // Accept Invite
  const acceptInvite = useCallback(
    async (inviteId: string) => {
      const result = await dispatch(acceptInviteAsync(inviteId));
      return acceptInviteAsync.fulfilled.match(result);
    },
    [dispatch]
  );

  // Reject Invite
  const rejectInvite = useCallback(
    async (inviteId: string) => {
      const result = await dispatch(rejectInviteAsync(inviteId));
      return rejectInviteAsync.fulfilled.match(result);
    },
    [dispatch]
  );

  // Set Current Space
  const switchSpace = useCallback(
    async (spaceId: string) => {
      const result = await dispatch(setCurrentSpaceAsync(spaceId));
      return setCurrentSpaceAsync.fulfilled.match(result);
    },
    [dispatch]
  );

  // Leave Space
  const leaveSpace = useCallback(
    async (spaceId: string) => {
      const result = await dispatch(leaveSpaceAsync(spaceId));
      return leaveSpaceAsync.fulfilled.match(result);
    },
    [dispatch]
  );

  // Clear Error
  const clearSpacesError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    spaces,
    currentSpaceId,
    currentSpace,
    pendingInvites,
    pendingInvitesCount,
    isLoading,
    isInitialized,
    error,
    personalSpace,
    sharedSpaces,
    createSpace,
    deleteSpace,
    inviteToSpace,
    acceptInvite,
    rejectInvite,
    switchSpace,
    leaveSpace,
    clearError: clearSpacesError,
  };
}
