import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Pressable, PressableProps } from './Pressable';
import { Text } from './Text';
import { Box } from './Box';
import { useTheme } from '../theme';
import { SemanticColorKey, SpacingKey } from '../tokens';

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button Props
 */
export interface ButtonProps extends Omit<PressableProps, 'padding' | 'paddingX' | 'paddingY'> {
  /** Variante del bottone */
  variant?: ButtonVariant;
  /** Dimensione del bottone */
  size?: ButtonSize;
  /** Testo del bottone */
  title: string;
  /** Se true, mostra uno spinner */
  loading?: boolean;
  /** Se true, il bottone occupa tutta la larghezza */
  fullWidth?: boolean;
  /** Icona a sinistra */
  leftIcon?: React.ReactNode;
  /** Icona a destra */
  rightIcon?: React.ReactNode;
}

/**
 * Size configurations
 */
const sizeConfig: Record<
  ButtonSize,
  { paddingX: SpacingKey; paddingY: SpacingKey; minHeight: number }
> = {
  sm: { paddingX: 'md', paddingY: 'xs', minHeight: 32 },
  md: { paddingX: 'lg', paddingY: 'sm', minHeight: 44 },
  lg: { paddingX: 'xl', paddingY: 'md', minHeight: 52 },
};

/**
 * Button Component
 */
export function Button({
  variant = 'primary',
  size = 'md',
  title,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  accessibilityLabel,
  ...rest
}: ButtonProps): JSX.Element {
  const theme = useTheme();
  const config = sizeConfig[size];

  // Compute colors based on variant
  const getColors = (): {
    backgroundColor: SemanticColorKey | undefined;
    textColor: SemanticColorKey;
    borderColor: SemanticColorKey | undefined;
  } => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'primary',
          textColor: 'onPrimary',
          borderColor: undefined,
        };
      case 'secondary':
        return {
          backgroundColor: 'secondary',
          textColor: 'onSecondary',
          borderColor: undefined,
        };
      case 'outline':
        return {
          backgroundColor: undefined,
          textColor: 'primary',
          borderColor: 'primary',
        };
      case 'ghost':
        return {
          backgroundColor: undefined,
          textColor: 'primary',
          borderColor: undefined,
        };
      case 'danger':
        return {
          backgroundColor: 'error',
          textColor: 'onError',
          borderColor: undefined,
        };
      default:
        return {
          backgroundColor: 'primary',
          textColor: 'onPrimary',
          borderColor: undefined,
        };
    }
  };

  const colors = getColors();

  const textVariant = size === 'sm' ? 'labelSmall' : size === 'lg' ? 'labelLarge' : 'labelMedium';

  return (
    <Pressable
      paddingX={config.paddingX}
      paddingY={config.paddingY}
      minHeight={config.minHeight}
      backgroundColor={colors.backgroundColor}
      borderRadius="md"
      borderWidth={colors.borderColor ? 1 : 0}
      borderColor={colors.borderColor}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      width={fullWidth ? '100%' : undefined}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors[colors.textColor]} />
      ) : (
        <Box flexDirection="row" alignItems="center" gap="xs">
          {leftIcon}
          <Text variant={textVariant} color={colors.textColor} weight="medium">
            {title}
          </Text>
          {rightIcon}
        </Box>
      )}
    </Pressable>
  );
}

/**
 * IconButton Props
 */
export interface IconButtonProps extends Omit<PressableProps, 'children'> {
  /** Icona da mostrare */
  icon: React.ReactNode;
  /** Dimensione del bottone */
  size?: ButtonSize;
  /** Variante del bottone */
  variant?: ButtonVariant;
}

/**
 * IconButton sizes
 */
const iconButtonSizes: Record<ButtonSize, number> = {
  sm: 32,
  md: 44,
  lg: 52,
};

/**
 * IconButton Component
 */
export function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  accessibilityLabel,
  ...rest
}: IconButtonProps): JSX.Element {
  const buttonSize = iconButtonSizes[size];

  const getBackgroundColor = (): SemanticColorKey | undefined => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'danger':
        return 'error';
      default:
        return undefined;
    }
  };

  return (
    <Pressable
      width={buttonSize}
      height={buttonSize}
      borderRadius="full"
      backgroundColor={getBackgroundColor()}
      alignItems="center"
      justifyContent="center"
      accessibilityLabel={accessibilityLabel}
      {...rest}
    >
      {icon}
    </Pressable>
  );
}
