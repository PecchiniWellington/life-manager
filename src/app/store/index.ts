/**
 * Redux Store Configuration
 * Setup centralizzato dello store con persistenza
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Feature reducers
import { authReducer } from '@features/auth/store';
import { calendarReducer } from '@features/calendar/store';
import { todosReducer } from '@features/todos/store';
import {
  walletReducer,
  accountsReducer,
  budgetsReducer,
  goalsReducer,
  recurringReducer,
  categoriesReducer,
} from '@features/wallet/store';
import { spacesReducer } from '@features/spaces/store';

// API slice (predisposto per RTK Query)
import { api } from './api';

/**
 * Root reducer combining all feature reducers
 */
const rootReducer = combineReducers({
  auth: authReducer,
  calendar: calendarReducer,
  todos: todosReducer,
  wallet: walletReducer,
  accounts: accountsReducer,
  budgets: budgetsReducer,
  goals: goalsReducer,
  recurring: recurringReducer,
  categories: categoriesReducer,
  spaces: spacesReducer,
  // RTK Query API reducer
  [api.reducerPath]: api.reducer,
});

/**
 * Persist configuration
 * Note: calendar, todos, wallet sono ora sincronizzati con Firestore
 * e non necessitano più di persistenza locale
 */
const persistConfig = {
  key: 'root',
  version: 2, // Incrementato per invalidare la cache precedente
  storage: AsyncStorage,
  // Non persistiamo più i dati sincronizzati con Firestore
  whitelist: [],
  // Blacklist API cache and Firestore-synced data
  blacklist: [
    api.reducerPath,
    'calendar',
    'todos',
    'wallet',
    'accounts',
    'budgets',
    'goals',
    'recurring',
    'categories',
  ],
};

/**
 * Persisted reducer
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Store instance
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
  devTools: __DEV__,
});

/**
 * Persistor for PersistGate
 */
export const persistor = persistStore(store);

/**
 * Type exports
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
