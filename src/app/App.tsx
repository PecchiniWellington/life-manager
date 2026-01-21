/**
 * App Component
 * Entry point dell'applicazione
 */

import 'react-native-gesture-handler';
import React from 'react';
import { LogBox } from 'react-native';

// Silenzio warning di deprecazione Firebase (funziona ancora, sarà sistemato in v22)
LogBox.ignoreLogs([
  'This method is deprecated',
  'Method called was `onAuthStateChanged`',
]);
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from './providers';
import { RootNavigator } from './navigation';
import { useTheme } from '@shared/ui/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

/**
 * App Content with theme awareness
 */
function AppContent(): JSX.Element {
  const theme = useTheme();

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

/**
 * Main App Component
 */
export default function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
