/**
 * EmptyState Molecule
 * Componente per stati vuoti
 */

import React from 'react';
import { Box, Text, Heading, Button, Icon, IconName } from '../atoms';

/**
 * EmptyState Props
 */
export interface EmptyStateProps {
  /** Icona da mostrare */
  icon?: IconName;
  /** Titolo */
  title: string;
  /** Descrizione */
  description?: string;
  /** Testo del bottone di azione */
  actionLabel?: string;
  /** Callback per l'azione */
  onAction?: () => void;
}

/**
 * EmptyState Component
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps): JSX.Element {
  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      padding="xl"
      gap="md"
    >
      {icon && (
        <Box marginBottom="sm">
          <Icon name={icon} size="xl" color="textTertiary" />
        </Box>
      )}

      <Heading level={5} align="center">
        {title}
      </Heading>

      {description && (
        <Text color="textSecondary" align="center">
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Box marginTop="md">
          <Button
            title={actionLabel}
            onPress={onAction}
            accessibilityLabel={actionLabel}
          />
        </Box>
      )}
    </Box>
  );
}
