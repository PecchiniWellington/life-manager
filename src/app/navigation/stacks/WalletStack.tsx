/**
 * Wallet Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletStackParamList } from '../types';
import {
  WalletScreen,
  AccountsScreen,
  BudgetScreen,
  GoalsScreen,
  RecurringScreen,
  CategoriesScreen,
  ReportsScreen,
} from '@features/wallet/screens';
import { useTheme } from '@shared/ui/theme';

const Stack = createNativeStackNavigator<WalletStackParamList>();

export function WalletStack(): JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="WalletMain"
        component={WalletScreen}
      />
      <Stack.Screen
        name="Accounts"
        component={AccountsScreen}
      />
      <Stack.Screen
        name="Budget"
        component={BudgetScreen}
      />
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
      />
      <Stack.Screen
        name="Recurring"
        component={RecurringScreen}
      />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
      />
    </Stack.Navigator>
  );
}
