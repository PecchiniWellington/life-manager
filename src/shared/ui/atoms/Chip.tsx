/**
 * Chip/Tag Atom
 * Componente per tag, filtri e categorizzazione
 */

import React from 'react';
import { Box } from './Box';
import { Text } from './Text';
import { Pressable } from './Pressable';
import { useTheme } from '../theme';
import { SemanticColorKey } from '../tokens';

/**
 * Chip variants
 */
export type ChipVariant = 'filled' | 'outlined' | 'soft';

/**
 * Chip sizes
 */
export type ChipSize = 'sm' | 'md';

/**
 * Chip intent (semantic meaning)
 */
export type ChipIntent = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Chip Props
 */
export interface ChipProps {
  /** Testo del chip */
  label: string;
  /** Variante visiva */
  variant?: ChipVariant;
  /** Dimensione */
  size?: ChipSize;
  /** Intento semantico */
  intent?: ChipIntent;
  /** Se true, il chip è selezionato */
  selected?: boolean;
  /** Se true, il chip è disabilitato */
  disabled?: boolean;
  /** Callback quando premuto */
  onPress?: () => void;
  /** Icona a sinistra */
  leftIcon?: React.ReactNode;
  /** Callback per rimuovere (mostra X) */
  onRemove?: () => void;
}

/**
 * Get colors based on intent and variant
 */
function getChipColors(
  intent: ChipIntent,
  variant: ChipVariant,
  selected: boolean
): {
  backgroundColor: SemanticColorKey | undefined;
  textColor: SemanticColorKey;
  borderColor: SemanticColorKey | undefined;
} {
  if (selected) {
    return {
      backgroundColor: 'primary',
      textColor: 'onPrimary',
      borderColor: 'primary',
    };
  }

  const intentColors: Record<
    ChipIntent,
    { bg: SemanticColorKey; text: SemanticColorKey; softBg: SemanticColorKey }
  > = {
    default: { bg: 'secondary', text: 'textPrimary', softBg: 'backgroundSecondary' },
    primary: { bg: 'primary', text: 'onPrimary', softBg: 'infoBackground' },
    success: { bg: 'success', text: 'onSuccess', softBg: 'successBackground' },
    warning: { bg: 'warning', text: 'onWarning', softBg: 'warningBackground' },
    error: { bg: 'error', text: 'onError', softBg: 'errorBackground' },
    info: { bg: 'info', text: 'onInfo', softBg: 'infoBackground' },
  };

  const colors = intentColors[intent];

  switch (variant) {
    case 'filled':
      return {
        backgroundColor: colors.bg,
        textColor: colors.text,
        borderColor: undefined,
      };
    case 'outlined':
      return {
        backgroundColor: undefined,
        textColor: intent === 'default' ? 'textPrimary' : colors.bg,
        borderColor: intent === 'default' ? 'border' : colors.bg,
      };
    case 'soft':
      return {
        backgroundColor: colors.softBg,
        textColor: intent === 'default' ? 'textPrimary' : colors.bg,
        borderColor: undefined,
      };
    default:
      return {
        backgroundColor: colors.bg,
        textColor: colors.text,
        borderColor: undefined,
      };
  }
}

/**
 * Chip Component
 */
export function Chip({
  label,
  variant = 'soft',
  size = 'md',
  intent = 'default',
  selected = false,
  disabled = false,
  onPress,
  leftIcon,
  onRemove,
}: ChipProps): JSX.Element {
  const theme = useTheme();
  const colors = getChipColors(intent, variant, selected);

  const paddingY = size === 'sm' ? 'xxs' : 'xs';
  const paddingX = size === 'sm' ? 'sm' : 'md';
  const textVariant = size === 'sm' ? 'labelSmall' : 'labelMedium';

  const content = (
    <Box
      flexDirection="row"
      alignItems="center"
      gap="xs"
      backgroundColor={colors.backgroundColor}
      borderRadius="full"
      borderWidth={colors.borderColor ? 1 : 0}
      borderColor={colors.borderColor}
      paddingX={paddingX}
      paddingY={paddingY}
      opacity={disabled ? 0.5 : 1}
    >
      {leftIcon}
      <Text variant={textVariant} color={colors.textColor}>
        {label}
      </Text>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          accessibilityLabel={`Remove ${label}`}
          padding="xxs"
        >
          <Text variant={textVariant} color={colors.textColor}>
            ×
          </Text>
        </Pressable>
      )}
    </Box>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

/**
 * Tag Component
 * Alias per Chip con variant soft di default
 */
export function Tag(props: ChipProps): JSX.Element {
  return <Chip variant="soft" {...props} />;
}
