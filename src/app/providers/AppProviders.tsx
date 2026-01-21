/**
 * App Providers
 * Wrapper con tutti i providers dell'applicazione
 */

import React from 'react';
import { View, Text as RNText, StyleSheet, ActivityIndicator } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { store, persistor } from '../store';
import { ThemeProvider } from '@shared/ui/theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
});

/**
 * Loading component for PersistGate
 * Usa componenti RN nativi perché viene renderizzato prima del ThemeProvider
 */
function LoadingScreen(): JSX.Element {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <RNText style={styles.loadingText}>Caricamento...</RNText>
    </View>
  );
}

/**
 * AppProviders Component
 * Wraps the app with all necessary providers
 */
export function AppProviders({ children }: AppProvidersProps): JSX.Element {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <SafeAreaProvider>
          <ThemeProvider>
            <NavigationContainer>
              <BottomSheetModalProvider>
                {children}
              </BottomSheetModalProvider>
            </NavigationContainer>
          </ThemeProvider>
        </SafeAreaProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
