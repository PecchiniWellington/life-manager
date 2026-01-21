/**
 * Calendar Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../types';
import { CalendarScreen } from '@features/calendar/screens';
import { useTheme } from '@shared/ui/theme';

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export function CalendarStack(): JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="CalendarMain"
        component={CalendarScreen}
      />
      {/* EventDetail screen can be added later */}
    </Stack.Navigator>
  );
}
