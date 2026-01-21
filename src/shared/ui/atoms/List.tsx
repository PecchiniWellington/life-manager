/**
 * List Atom
 * Componenti per liste e list items
 */

import React from 'react';
import { FlatList, FlatListProps, ListRenderItem } from 'react-native';
import { Box, BoxProps } from './Box';
import { Pressable } from './Pressable';
import { Text } from './Text';
import { Divider } from './Divider';
import { useTheme } from '../theme';
import { SpacingKey } from '../tokens';

/**
 * List Props
 */
export interface ListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  /** Dati da renderizzare */
  data: T[];
  /** Funzione per renderizzare ogni item */
  renderItem: ListRenderItem<T>;
  /** Spaziatura tra gli item */
  spacing?: SpacingKey;
  /** Se true, mostra i divisori */
  showDividers?: boolean;
  /** Componente per lista vuota */
  emptyComponent?: React.ReactNode;
  /** Padding del container */
  padding?: SpacingKey;
}

/**
 * List Component
 * Wrapper per FlatList con design system
 */
export function List<T>({
  data,
  renderItem,
  spacing = 'sm',
  showDividers = false,
  emptyComponent,
  padding,
  keyExtractor,
  ...rest
}: ListProps<T>): JSX.Element {
  const theme = useTheme();

  const renderSeparator = () => {
    if (showDividers) {
      return <Divider spacing="none" />;
    }
    return <Box height={theme.spacing[spacing]} />;
  };

  const renderEmpty = () => {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    return (
      <Box padding="xl" alignItems="center">
        <Text color="textTertiary">Nessun elemento</Text>
      </Box>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={renderSeparator}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: padding ? theme.spacing[padding] : 0,
        flexGrow: data.length === 0 ? 1 : undefined,
      }}
      {...rest}
    />
  );
}

/**
 * ListItem Props
 */
export interface ListItemProps {
  /** Titolo principale */
  title: string;
  /** Descrizione secondaria */
  description?: string;
  /** Contenuto a sinistra (icona, avatar) */
  leftContent?: React.ReactNode;
  /** Contenuto a destra (azione, badge) */
  rightContent?: React.ReactNode;
  /** Callback quando premuto */
  onPress?: () => void;
  /** Se true, il list item è disabilitato */
  disabled?: boolean;
  /** Se true, mostra indicatore di navigazione */
  showChevron?: boolean;
}

/**
 * ListItem Component
 */
export function ListItem({
  title,
  description,
  leftContent,
  rightContent,
  onPress,
  disabled = false,
  showChevron = false,
}: ListItemProps): JSX.Element {
  const content = (
    <Box
      flexDirection="row"
      alignItems="center"
      paddingY="md"
      paddingX="lg"
      gap="md"
      backgroundColor="surface"
      opacity={disabled ? 0.5 : 1}
    >
      {leftContent && <Box>{leftContent}</Box>}

      <Box flex={1}>
        <Text variant="bodyMedium" numberOfLines={1}>
          {title}
        </Text>
        {description && (
          <Text variant="bodySmall" color="textSecondary" numberOfLines={2}>
            {description}
          </Text>
        )}
      </Box>

      {rightContent && <Box>{rightContent}</Box>}

      {showChevron && (
        <Text color="textTertiary" variant="bodyLarge">
          ›
        </Text>
      )}
    </Box>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={title}
        accessibilityHint={description}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

/**
 * ListSection Props
 */
export interface ListSectionProps extends BoxProps {
  /** Titolo della sezione */
  title?: string;
  /** Contenuto della sezione */
  children: React.ReactNode;
}

/**
 * ListSection Component
 * Raggruppa list items con un titolo opzionale
 */
export function ListSection({
  title,
  children,
  ...rest
}: ListSectionProps): JSX.Element {
  return (
    <Box {...rest}>
      {title && (
        <Box paddingX="lg" paddingY="sm">
          <Text variant="labelMedium" color="textSecondary" transform="uppercase">
            {title}
          </Text>
        </Box>
      )}
      {children}
    </Box>
  );
}
