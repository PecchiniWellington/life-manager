/**
 * Spaces Provider
 * Inizializza i listener per gli spazi e sincronizza tutti i dati con Firestore
 */

import React, { ReactNode, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  createPersonalSpaceAsync,
  setSpaces,
  setCurrentSpaceId,
  setPendingInvites,
  selectCurrentSpace,
  selectCurrentSpaceId,
} from '../store';
import * as spacesService from '../data/spacesService';
import * as todosService from '@features/todos/data/firestoreService';
import * as calendarService from '@features/calendar/data/firestoreService';
import * as walletService from '@features/wallet/data/firestoreService';
import * as accountsService from '@features/wallet/data/accountsService';
import * as budgetsService from '@features/wallet/data/budgetsService';
import * as goalsService from '@features/wallet/data/goalsService';
import * as recurringService from '@features/wallet/data/recurringService';
import * as categoriesService from '@features/wallet/data/categoriesService';
import { setTodos, clearTodos } from '@features/todos/store/slice';
import { setEvents, clearEvents } from '@features/calendar/store/slice';
import { setTransactions, clearTransactions } from '@features/wallet/store/slice';
import {
  setAccounts,
  clearAccounts,
  setBudgets,
  clearBudgets,
  setGoals,
  clearGoals,
  setRecurring,
  clearRecurring,
  setCategories,
  clearCategories,
} from '@features/wallet/store';
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
 * Componente che sincronizza i dati dello spazio corrente
 */
function SpaceDataSynchronizer(): null {
  const dispatch = useAppDispatch();
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const previousSpaceIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Se non c'è spazio selezionato, pulisci tutto
    if (!currentSpaceId) {
      dispatch(clearTodos());
      dispatch(clearEvents());
      dispatch(clearTransactions());
      dispatch(clearAccounts());
      dispatch(clearBudgets());
      dispatch(clearGoals());
      dispatch(clearRecurring());
      dispatch(clearCategories());
      previousSpaceIdRef.current = null;
      return;
    }

    // Se lo spazio è cambiato, pulisci i dati vecchi prima di caricare i nuovi
    if (previousSpaceIdRef.current && previousSpaceIdRef.current !== currentSpaceId) {
      dispatch(clearTodos());
      dispatch(clearEvents());
      dispatch(clearTransactions());
      dispatch(clearAccounts());
      dispatch(clearBudgets());
      dispatch(clearGoals());
      dispatch(clearRecurring());
      dispatch(clearCategories());
    }
    previousSpaceIdRef.current = currentSpaceId;

    // Setup real-time listeners per lo spazio corrente

    // Todos listener
    const unsubscribeTodos = todosService.onTodosChanged(currentSpaceId, (todos) => {
      dispatch(setTodos(todos));
    });

    // Calendar events listener
    const unsubscribeEvents = calendarService.onEventsChanged(currentSpaceId, (events) => {
      dispatch(setEvents(events));
    });

    // Transactions listener
    const unsubscribeTransactions = walletService.onTransactionsChanged(currentSpaceId, (transactions) => {
      dispatch(setTransactions(transactions));
    });

    // Accounts listener
    const unsubscribeAccounts = accountsService.onAccountsChanged(currentSpaceId, (accounts) => {
      dispatch(setAccounts(accounts));
    });

    // Budgets listener
    const unsubscribeBudgets = budgetsService.onBudgetsChanged(currentSpaceId, (budgets) => {
      dispatch(setBudgets(budgets));
    });

    // Goals listener
    const unsubscribeGoals = goalsService.onGoalsChanged(currentSpaceId, (goals) => {
      dispatch(setGoals(goals));
    });

    // Recurring transactions listener
    const unsubscribeRecurring = recurringService.onRecurringChanged(currentSpaceId, (recurring) => {
      dispatch(setRecurring(recurring));
    });

    // Categories listener
    const unsubscribeCategories = categoriesService.onCategoriesChanged(currentSpaceId, (categories) => {
      dispatch(setCategories(categories));
    });

    return () => {
      unsubscribeTodos();
      unsubscribeEvents();
      unsubscribeTransactions();
      unsubscribeAccounts();
      unsubscribeBudgets();
      unsubscribeGoals();
      unsubscribeRecurring();
      unsubscribeCategories();
    };
  }, [currentSpaceId, dispatch]);

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
      // Pulisci tutti i dati
      dispatch(clearTodos());
      dispatch(clearEvents());
      dispatch(clearTransactions());
      dispatch(clearAccounts());
      dispatch(clearBudgets());
      dispatch(clearGoals());
      dispatch(clearRecurring());
      dispatch(clearCategories());
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
      <SpaceDataSynchronizer />
      {children}
    </>
  );
}
