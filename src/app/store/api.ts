/**
 * RTK Query API Configuration
 * Predisposto per quando verrà aggiunto il backend
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Base API configuration
 * Per ora configurato con un baseUrl placeholder
 * Da aggiornare quando verrà implementato il backend
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api', // Placeholder - da configurare con il vero URL del backend
    prepareHeaders: (headers) => {
      // Qui si aggiungeranno gli headers di autenticazione quando implementati
      // const token = getToken();
      // if (token) {
      //   headers.set('authorization', `Bearer ${token}`);
      // }
      return headers;
    },
  }),
  // Tag types per invalidazione cache
  tagTypes: ['CalendarEvent', 'Todo', 'Transaction'],
  // Endpoints vuoti - da popolare quando si implementa il backend
  endpoints: () => ({}),
});

/**
 * Export hooks generati automaticamente da RTK Query
 * Quando aggiungerai endpoints, qui verranno esportati gli hooks
 *
 * Esempio futuro:
 * export const {
 *   useGetEventsQuery,
 *   useCreateEventMutation,
 *   useGetTodosQuery,
 *   useGetTransactionsQuery,
 * } = api;
 */
