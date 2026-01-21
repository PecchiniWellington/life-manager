/**
 * Spaces Provider
 * Inizializza i listener per gli spazi e crea lo spazio personale se necessario
 */

import React, { ReactNode, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  createPersonalSpaceAsync,
  setSpaces,
  setCurrentSpaceId,
  setPendingInvites,
  selectCurrentSpace,
} from '../store';
import * as spacesService from '../data/spacesService';
import { useAuth } from '@features/auth/hooks';
import { useThemeContext } from '@shared/ui/theme';

interface SpacesProviderProps {
  children: ReactNode;
}

// Flag globale per evitare creazioni multiple
let isCreatingPersonalSpace = false;

/**
 * Componente che sincronizza il colore dello spazio con il tema
 */
function SpaceThemeSynchronizer(): null {
  const currentSpace = useAppSelector(selectCurrentSpace);
  const { setAccentColor } = useThemeContext();

  useEffect(() => {
    // Aggiorna il colore accento quando cambia lo spazio
    if (currentSpace?.color) {
      setAccentColor(currentSpace.color);
    } else {
      setAccentColor(null); // Usa colore default
    }
  }, [currentSpace?.color, setAccentColor]);

  return null;
}

/**
 * SpacesProvider - Inizializza i listener UNA SOLA VOLTA
 */
export function SpacesProvider({ children }: SpacesProviderProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const hasAttemptedCreation = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Reset quando l'utente si disconnette
      hasAttemptedCreation.current = false;
      isCreatingPersonalSpace = false;
      return;
    }

    // Listener per gli spazi
    const unsubscribeSpaces = spacesService.onUserSpacesChanged(user.id, async (updatedSpaces) => {
      dispatch(setSpaces(updatedSpaces));

      // Controlla se creare lo spazio personale
      const hasPersonalSpace = updatedSpaces.some((s) => s.isPersonal);

      if (!hasPersonalSpace && !isCreatingPersonalSpace && !hasAttemptedCreation.current) {
        // Setta i flag PRIMA di fare qualsiasi cosa
        hasAttemptedCreation.current = true;
        isCreatingPersonalSpace = true;

        try {
          await dispatch(
            createPersonalSpaceAsync({
              userId: user.id,
              email: user.email || '',
              displayName: user.displayName,
            })
          );
        } catch (error) {
          console.error('Errore creazione spazio personale:', error);
        }
        // Non resettiamo isCreatingPersonalSpace - il service controlla in Firestore
      }
    });

    // Listener per lo spazio corrente
    const unsubscribeCurrentSpace = spacesService.onCurrentSpaceChanged(user.id, (spaceId) => {
      dispatch(setCurrentSpaceId(spaceId));
    });

    // Listener per gli inviti pendenti
    const unsubscribeInvites = user.email
      ? spacesService.onPendingInvitesChanged(user.email, (invites) => {
          dispatch(setPendingInvites(invites));
        })
      : () => {};

    return () => {
      unsubscribeSpaces();
      unsubscribeCurrentSpace();
      unsubscribeInvites();
    };
  }, [isAuthenticated, user, dispatch]);

  return (
    <>
      <SpaceThemeSynchronizer />
      {children}
    </>
  );
}
