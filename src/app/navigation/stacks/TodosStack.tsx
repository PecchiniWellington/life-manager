/**
 * Todos Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodosStackParamList } from '../types';
import { TodosScreen } from '@features/todos/screens';
import { useTheme } from '@shared/ui/theme';

const Stack = createNativeStackNavigator<TodosStackParamList>();

export function TodosStack(): JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="TodosMain"
        component={TodosScreen}
      />
      {/* TodoDetail screen can be added later */}
    </Stack.Navigator>
  );
}
