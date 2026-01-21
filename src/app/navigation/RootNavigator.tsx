/**
 * Root Navigator
 * Gestisce la navigazione tra Auth e Main app
 */

import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@features/auth/hooks';
import { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import { AuthStack } from './stacks';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Loading screen while checking auth state
 */
function LoadingScreen(): JSX.Element {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

export function RootNavigator(): JSX.Element {
  const { isAuthenticated, isInitialized } = useAuth();

  // Show loading while checking auth state
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
});
