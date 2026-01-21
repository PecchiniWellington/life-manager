/**
 * Header Molecule
 * Componente per header delle schermate
 */

import React from 'react';
import { Box, Heading, Text, Pressable, Icon, IconName } from '../atoms';

/**
 * Header Props
 */
export interface HeaderProps {
  /** Titolo */
  title: string;
  /** Sottotitolo */
  subtitle?: string;
  /** Mostra pulsante indietro */
  showBack?: boolean;
  /** Callback per pulsante indietro */
  onBack?: () => void;
  /** Azione a destra */
  rightAction?: {
    icon: IconName;
    onPress: () => void;
    accessibilityLabel: string;
  };
  /** Azione secondaria a destra */
  secondaryRightAction?: {
    icon: IconName;
    onPress: () => void;
    accessibilityLabel: string;
  };
}

/**
 * Header Component
 */
export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  secondaryRightAction,
}: HeaderProps): JSX.Element {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingX="lg"
      paddingY="md"
      backgroundColor="background"
    >
      {/* Left Section */}
      <Box flexDirection="row" alignItems="center" flex={1}>
        {showBack && onBack && (
          <Box marginRight="sm">
            <Pressable
              onPress={onBack}
              accessibilityLabel="Torna indietro"
              padding="xs"
            >
              <Icon name="arrowBack" size="md" />
            </Pressable>
          </Box>
        )}
        <Box flex={1}>
          <Heading level={5} numberOfLines={1}>
            {title}
          </Heading>
          {subtitle && (
            <Text variant="bodySmall" color="textSecondary" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </Box>
      </Box>

      {/* Right Section */}
      <Box flexDirection="row" alignItems="center" gap="sm">
        {secondaryRightAction && (
          <Pressable
            onPress={secondaryRightAction.onPress}
            accessibilityLabel={secondaryRightAction.accessibilityLabel}
            padding="xs"
          >
            <Icon name={secondaryRightAction.icon} size="md" />
          </Pressable>
        )}
        {rightAction && (
          <Pressable
            onPress={rightAction.onPress}
            accessibilityLabel={rightAction.accessibilityLabel}
            padding="xs"
          >
            <Icon name={rightAction.icon} size="md" />
          </Pressable>
        )}
      </Box>
    </Box>
  );
}

/**
 * ScreenTitle Props
 * Titolo grande per inizio schermata
 */
export interface ScreenTitleProps {
  /** Titolo */
  title: string;
  /** Sottotitolo */
  subtitle?: string;
  /** Azione a destra */
  rightAction?: React.ReactNode;
  /** Contenuto sopra il titolo (es. SpaceSelector) */
  topContent?: React.ReactNode;
}

/**
 * ScreenTitle Component
 */
export function ScreenTitle({
  title,
  subtitle,
  rightAction,
  topContent,
}: ScreenTitleProps): JSX.Element {
  return (
    <Box marginBottom="lg">
      {topContent && <Box marginBottom="sm">{topContent}</Box>}
      <Box
        flexDirection="row"
        alignItems="flex-start"
        justifyContent="space-between"
      >
        <Box flex={1}>
          <Heading level={3}>{title}</Heading>
          {subtitle && (
            <Text color="textSecondary" variant="bodyMedium">
              {subtitle}
            </Text>
          )}
        </Box>
        {rightAction}
      </Box>
    </Box>
  );
}
