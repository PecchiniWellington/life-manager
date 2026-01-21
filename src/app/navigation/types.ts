/**
 * Navigation Types
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

/**
 * Root Stack (per modali e schermate globali)
 */
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  // Future modals here
};

/**
 * Main Tab Navigator
 */
export type MainTabParamList = {
  CalendarTab: NavigatorScreenParams<CalendarStackParamList>;
  TodosTab: NavigatorScreenParams<TodosStackParamList>;
  WalletTab: NavigatorScreenParams<WalletStackParamList>;
};

/**
 * Calendar Stack
 */
export type CalendarStackParamList = {
  CalendarMain: undefined;
  EventDetail: { eventId: string };
};

/**
 * Todos Stack
 */
export type TodosStackParamList = {
  TodosMain: undefined;
  TodoDetail: { todoId: string };
};

/**
 * Wallet Stack
 */
export type WalletStackParamList = {
  WalletMain: undefined;
  TransactionDetail: { transactionId: string };
};

/**
 * Screen Props Types
 */

// Root Stack
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Tab screens
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Calendar Stack
export type CalendarStackScreenProps<T extends keyof CalendarStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<CalendarStackParamList, T>,
    MainTabScreenProps<'CalendarTab'>
  >;

// Todos Stack
export type TodosStackScreenProps<T extends keyof TodosStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<TodosStackParamList, T>,
    MainTabScreenProps<'TodosTab'>
  >;

// Wallet Stack
export type WalletStackScreenProps<T extends keyof WalletStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<WalletStackParamList, T>,
    MainTabScreenProps<'WalletTab'>
  >;

/**
 * Global declaration for useNavigation
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
