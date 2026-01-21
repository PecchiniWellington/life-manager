/**
 * FormField Molecule
 * Wrapper per campi di form con validazione
 */

import React from 'react';
import { Box, Input, InputProps, TextArea, TextAreaProps, Label, Text } from '../atoms';

/**
 * FormField Props
 */
export interface FormFieldProps extends InputProps {
  /** Nome del campo (per form state) */
  name: string;
  /** Se true, il campo è obbligatorio */
  required?: boolean;
}

/**
 * FormField Component
 */
export function FormField({
  name,
  label,
  required = false,
  ...rest
}: FormFieldProps): JSX.Element {
  const displayLabel = required ? `${label} *` : label;

  return (
    <Input
      label={displayLabel}
      {...rest}
    />
  );
}

/**
 * FormTextArea Props
 */
export interface FormTextAreaProps extends TextAreaProps {
  /** Nome del campo (per form state) */
  name: string;
  /** Se true, il campo è obbligatorio */
  required?: boolean;
}

/**
 * FormTextArea Component
 */
export function FormTextArea({
  name,
  label,
  required = false,
  ...rest
}: FormTextAreaProps): JSX.Element {
  const displayLabel = required ? `${label} *` : label;

  return (
    <TextArea
      label={displayLabel}
      {...rest}
    />
  );
}
