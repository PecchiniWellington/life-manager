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

/**
 * Input sizes
 */
export type InputSize = 'sm' | 'md' | 'lg';

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
  /** Se true, l'input è disabilitato */
  disabled?: boolean;
  /** Icona a sinistra */
  leftIcon?: React.ReactNode;
  /** Icona a destra */
  rightIcon?: React.ReactNode;
  /** Se true, l'input occupa tutta la larghezza */
  fullWidth?: boolean;
}

/**
 * Size configurations
 */
const sizeConfig: Record<InputSize, { height: number; fontSize: number; padding: number }> = {
  sm: { height: 36, fontSize: 14, padding: 8 },
  md: { height: 44, fontSize: 16, padding: 12 },
  lg: { height: 52, fontSize: 18, padding: 16 },
};

/**
 * Input Component
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    size = 'md',
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = true,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const config = sizeConfig[size];

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.borderFocus;
    return theme.colors.border;
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: disabled
      ? theme.colors.backgroundTertiary
      : theme.colors.surface,
    borderWidth: 1,
    borderColor: getBorderColor(),
    borderRadius: theme.radius.md,
    height: config.height,
    paddingHorizontal: config.padding,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: config.fontSize,
    color: disabled ? theme.colors.textDisabled : theme.colors.textPrimary,
    paddingVertical: 0,
    paddingHorizontal: leftIcon || rightIcon ? 8 : 0,
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
  const config = sizeConfig[size];
  // Note: TextArea uses fixed height based on numberOfLines
  // The height calculation happens in the parent container
  const calculatedHeight = config.height * numberOfLines * 0.6;

  return (
    <Box style={{ minHeight: calculatedHeight }}>
      <Input
        ref={ref}
        size={size}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        {...rest}
      />
    </Box>
  );
});
