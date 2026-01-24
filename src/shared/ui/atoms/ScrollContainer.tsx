/**
 * ScrollContainer Atom
 * Wrapper per ScrollView e FlatList con API uniforme
 * ATOM: Può usare componenti nativi RN
 */

import React, { ReactNode } from 'react';
import {
  ScrollView,
  FlatList,
  ScrollViewProps,
  FlatListProps,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { spacing, SpacingKey } from '../tokens';
import { useTheme } from '../theme';

// ============ ScrollContainer ============

export interface ScrollContainerProps extends Omit<ScrollViewProps, 'contentContainerStyle'> {
  children: ReactNode;
  /** Padding orizzontale */
  paddingHorizontal?: SpacingKey;
  /** Padding verticale */
  paddingVertical?: SpacingKey;
  /** Padding uniforme */
  padding?: SpacingKey;
  /** Gap tra elementi (per contentContainerStyle) */
  gap?: SpacingKey;
  /** Se true, il contenuto si espande per riempire lo spazio */
  fillHeight?: boolean;
  /** Refresh control */
  refreshing?: boolean;
  /** Callback per refresh */
  onRefresh?: () => void;
}

export function ScrollContainer({
  children,
  paddingHorizontal,
  paddingVertical,
  padding,
  gap,
  fillHeight,
  refreshing,
  onRefresh,
  style,
  ...props
}: ScrollContainerProps): JSX.Element {
  const theme = useTheme();

  const contentStyle = [
    padding !== undefined && { padding: spacing[padding] },
    paddingHorizontal !== undefined && { paddingHorizontal: spacing[paddingHorizontal] },
    paddingVertical !== undefined && { paddingVertical: spacing[paddingVertical] },
    gap !== undefined && { gap: spacing[gap] },
    fillHeight && styles.fillHeight,
  ];

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
}

// ============ HorizontalScroll ============

export interface HorizontalScrollProps extends Omit<ScrollViewProps, 'horizontal'> {
  children: ReactNode;
  /** Padding */
  padding?: SpacingKey;
  /** Gap tra elementi */
  gap?: SpacingKey;
}

export function HorizontalScroll({
  children,
  padding,
  gap,
  style,
  ...props
}: HorizontalScrollProps): JSX.Element {
  const contentStyle = [
    padding !== undefined && { padding: spacing[padding] },
    gap !== undefined && { gap: spacing[gap] },
  ];

  return (
    <ScrollView
      horizontal
      style={style}
      contentContainerStyle={contentStyle}
      showsHorizontalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

// ============ VirtualList ============

export interface VirtualListProps<T> extends Omit<FlatListProps<T>, 'contentContainerStyle'> {
  /** Padding orizzontale */
  paddingHorizontal?: SpacingKey;
  /** Padding verticale */
  paddingVertical?: SpacingKey;
  /** Gap tra elementi */
  gap?: SpacingKey;
  /** Refresh control */
  refreshing?: boolean;
  /** Callback per refresh */
  onRefresh?: () => void;
}

export function VirtualList<T>({
  paddingHorizontal,
  paddingVertical,
  gap,
  refreshing,
  onRefresh,
  style,
  ...props
}: VirtualListProps<T>): JSX.Element {
  const theme = useTheme();

  const contentStyle = [
    paddingHorizontal !== undefined && { paddingHorizontal: spacing[paddingHorizontal] },
    paddingVertical !== undefined && { paddingVertical: spacing[paddingVertical] },
    gap !== undefined && { gap: spacing[gap] },
  ];

  return (
    <FlatList
      style={[styles.container, style]}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fillHeight: {
    flexGrow: 1,
  },
});
