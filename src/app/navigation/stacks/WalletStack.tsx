/**
 * Wallet Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletStackParamList } from '../types';
import { WalletScreen } from '@features/wallet/screens';
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
      {/* TransactionDetail screen can be added later */}
    </Stack.Navigator>
  );
}
