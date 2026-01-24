/**
 * Input Atom
 * Componente per input di testo
 */

import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  TextInputProps,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { Box } from './Box';
import { Text, Label } from './Text';
import { useTheme } from '../theme';
import { sizes } from '../tokens';

/**
 * Input sizes
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Input variants
 */
export type InputVariant = 'default' | 'ghost';

/**
 * Input Props
 */
export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Label sopra l'input */
  label?: string;
  /** Messaggio di errore */
  error?: string;
  /** Testo di aiuto */
  helperText?: string;
  /** Dimensione dell'input */
  size?: InputSize;
  /** Variante dell'input */
  variant?: InputVariant;
  /** Se true, l'input è disabilitato */
  disabled?: boolean;
  /** Icona a sinistra */
  leftIcon?: React.ReactNode;
  /** Icona a destra */
  rightIcon?: React.ReactNode;
  /** Se true, l'input occupa tutta la larghezza */
  fullWidth?: boolean;
  /** Stile personalizzato per il TextInput */
  style?: TextStyle;
}

/**
 * Size configurations
 */
const sizeConfig: Record<InputSize, { height: number; fontSize: number; padding: number }> = {
  sm: { height: sizes.input.sm, fontSize: sizes.inputFontSize.sm, padding: sizes.inputPadding.sm },
  md: { height: sizes.input.md, fontSize: sizes.inputFontSize.md, padding: sizes.inputPadding.md },
  lg: { height: sizes.input.lg, fontSize: sizes.inputFontSize.lg, padding: sizes.inputPadding.lg },
};

/**
 * Input Component
 */
export const Input = forwardRef<TextInput, InputProps & { _isMultiline?: boolean }>(function Input(
  {
    label,
    error,
    helperText,
    size = 'md',
    variant = 'default',
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = true,
    onFocus,
    onBlur,
    _isMultiline,
    multiline,
    style,
    ...rest
  },
  ref
) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const config = sizeConfig[size];
  const isMultilineInput = _isMultiline || multiline;
  const isGhost = variant === 'ghost';

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    if (isGhost) return 'transparent';
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.borderFocus;
    return theme.colors.border;
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: isMultilineInput ? 'flex-start' : 'center',
    backgroundColor: isGhost
      ? 'transparent'
      : disabled
        ? theme.colors.backgroundTertiary
        : theme.colors.surface,
    borderWidth: isGhost ? 0 : 1,
    borderColor: getBorderColor(),
    borderRadius: theme.radius.md,
    minHeight: isGhost ? undefined : config.height,
    ...(isMultilineInput || isGhost ? {} : { height: config.height }),
    paddingHorizontal: isGhost ? 0 : config.padding,
    ...(isMultilineInput ? { paddingVertical: config.padding } : {}),
  };

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: config.fontSize,
    color: disabled ? theme.colors.textDisabled : theme.colors.textPrimary,
    paddingVertical: 0,
    paddingHorizontal: leftIcon || rightIcon ? sizes.inputPadding.sm : 0,
    ...(typeof style === 'object' ? style : {}),
  };

  return (
    <Box width={fullWidth ? '100%' : undefined} gap="xs">
      {label && <Label>{label}</Label>}

      <Box style={containerStyle}>
        {leftIcon}
        <TextInput
          ref={ref}
          style={inputStyle}
          placeholderTextColor={theme.colors.textTertiary}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
          accessibilityState={{ disabled }}
          multiline={isMultilineInput}
          {...rest}
        />
        {rightIcon}
      </Box>

      {(error || helperText) && (
        <Text
          variant="caption"
          color={error ? 'error' : 'textTertiary'}
        >
          {error || helperText}
        </Text>
      )}
    </Box>
  );
});

/**
 * TextArea Props
 */
export interface TextAreaProps extends InputProps {
  /** Numero di righe */
  numberOfLines?: number;
}

/**
 * TextArea Component
 */
export const TextArea = forwardRef<TextInput, TextAreaProps>(function TextArea(
  { numberOfLines = 4, size = 'md', ...rest },
  ref
) {
  return (
    <Input
      ref={ref}
      size={size}
      _isMultiline
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...rest}
    />
  );
});
