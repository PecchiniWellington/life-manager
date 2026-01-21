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
import { calendarReducer } from '@features/calendar/store';
import { todosReducer } from '@features/todos/store';
import { walletReducer } from '@features/wallet/store';

// API slice (predisposto per RTK Query)
import { api } from './api';

/**
 * Root reducer combining all feature reducers
 */
const rootReducer = combineReducers({
  calendar: calendarReducer,
  todos: todosReducer,
  wallet: walletReducer,
  // RTK Query API reducer
  [api.reducerPath]: api.reducer,
});

/**
 * Persist configuration
 */
const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  // Whitelist specific reducers to persist
  whitelist: ['calendar', 'todos', 'wallet'],
  // Blacklist API cache (will be rehydrated from server when backend is added)
  blacklist: [api.reducerPath],
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
