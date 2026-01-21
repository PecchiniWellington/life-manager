/**
 * Screen Atom
 * Wrapper per le schermate con SafeArea e scroll
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, BoxProps } from './Box';
import { useTheme } from '../theme';
import { SpacingKey } from '../tokens';

// Tab bar height constant
const TAB_BAR_HEIGHT = 49;

/**
 * Screen Props
 */
export interface ScreenProps extends Omit<BoxProps, 'padding'> {
  /** Se true, il contenuto è scrollabile */
  scroll?: boolean;
  /** Se true, gestisce la tastiera */
  keyboardAvoiding?: boolean;
  /** Padding orizzontale */
  paddingHorizontal?: SpacingKey;
  /** Padding verticale */
  paddingVertical?: SpacingKey;
  /** Se true, nasconde la status bar */
  hideStatusBar?: boolean;
  /** Stile della status bar */
  statusBarStyle?: 'light-content' | 'dark-content';
  /** Se true, include SafeArea edges */
  safeArea?: boolean;
  /** SafeArea edges da includere */
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Callback per pull-to-refresh */
  onRefresh?: () => void;
  /** Se true, mostra l'indicatore di refresh */
  refreshing?: boolean;
  /** Contenuto header fisso (non scrolla) */
  header?: React.ReactNode;
  /** Contenuto footer fisso (non scrolla) */
  footer?: React.ReactNode;
  /** Se true, aggiunge padding per la tab bar */
  withTabBar?: boolean;
  children?: React.ReactNode;
}

/**
 * Screen Component
 * Wrapper completo per schermate
 */
export function Screen({
  scroll = false,
  keyboardAvoiding = true,
  paddingHorizontal = 'lg',
  paddingVertical = 'lg',
  hideStatusBar = false,
  statusBarStyle,
  safeArea = true,
  safeAreaEdges = ['top', 'bottom'],
  onRefresh,
  refreshing = false,
  header,
  footer,
  withTabBar = true,
  children,
  ...rest
}: ScreenProps): JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Calculate bottom padding for tab bar
  const tabBarPadding = withTabBar ? TAB_BAR_HEIGHT + insets.bottom : 0;

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: theme.spacing[paddingHorizontal],
  };

  const scrollContentStyle: ViewStyle = {
    flexGrow: 1,
    paddingVertical: theme.spacing[paddingVertical],
    paddingBottom: theme.spacing[paddingVertical] + tabBarPadding,
  };

  const nonScrollContentStyle: ViewStyle = {
    flex: 1,
    paddingVertical: theme.spacing[paddingVertical],
    paddingBottom: theme.spacing[paddingVertical] + tabBarPadding,
  };

  // Determine status bar style
  const computedStatusBarStyle =
    statusBarStyle || (theme.isDark ? 'light-content' : 'dark-content');

  // Build SafeArea edges style
  const safeAreaStyle: ViewStyle = {};
  if (safeArea) {
    if (safeAreaEdges.includes('top')) {
      safeAreaStyle.paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
    }
  }

  const renderContent = () => {
    if (scroll) {
      return (
        <ScrollView
          style={contentStyle}
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <Box style={{ ...contentStyle, ...nonScrollContentStyle }} {...rest}>
        {children}
      </Box>
    );
  };

  const renderWithKeyboardAvoiding = (content: React.ReactNode) => {
    if (!keyboardAvoiding) return content;

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {content}
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar
        hidden={hideStatusBar}
        barStyle={computedStatusBarStyle}
        backgroundColor={theme.colors.background}
      />
      {header}
      {renderWithKeyboardAvoiding(renderContent())}
      {footer}
    </SafeAreaView>
  );
}

/**
 * ScreenHeader Props
 */
export interface ScreenHeaderProps {
  /** Titolo */
  title?: string;
  /** Sottotitolo */
  subtitle?: string;
  /** Azione a sinistra */
  leftAction?: React.ReactNode;
  /** Azione a destra */
  rightAction?: React.ReactNode;
}
