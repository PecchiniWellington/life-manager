/**
 * Text Atom
 * Componente base per tutto il testo dell'applicazione
 */

import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme';
import { TypographyVariant, SemanticColorKey, fontWeights, FontWeightKey } from '../tokens';

/**
 * Text Props
 */
export interface TextProps extends Omit<RNTextProps, 'style'> {
  /** Variante tipografica */
  variant?: TypographyVariant;
  /** Colore del testo */
  color?: SemanticColorKey;
  /** Peso del font (override della variante) */
  weight?: FontWeightKey;
  /** Allineamento del testo */
  align?: TextStyle['textAlign'];
  /** Decorazione del testo */
  decoration?: TextStyle['textDecorationLine'];
  /** Trasformazione del testo */
  transform?: TextStyle['textTransform'];
  /** Numero massimo di righe */
  numberOfLines?: number;
  /** Se true, il testo può essere selezionato */
  selectable?: boolean;
  /** Style override (use sparingly) */
  style?: TextStyle;
  children?: React.ReactNode;
}

/**
 * Text Component
 * Atom base per tutto il contenuto testuale
 */
export function Text({
  variant = 'bodyMedium',
  color = 'textPrimary',
  weight,
  align,
  decoration,
  transform,
  numberOfLines,
  selectable,
  style,
  children,
  ...rest
}: TextProps): JSX.Element {
  const theme = useTheme();
  const typographyStyle = theme.typography[variant];

  const computedStyle: TextStyle = {
    ...typographyStyle,
    color: theme.colors[color],
    ...(weight !== undefined && { fontWeight: fontWeights[weight] }),
    ...(align !== undefined && { textAlign: align }),
    ...(decoration !== undefined && { textDecorationLine: decoration }),
    ...(transform !== undefined && { textTransform: transform }),
  };

  return (
    <RNText
      style={[computedStyle, style]}
      numberOfLines={numberOfLines}
      selectable={selectable}
      accessibilityRole="text"
      {...rest}
    >
      {children}
    </RNText>
  );
}

/**
 * Heading Props
 */
export interface HeadingProps extends Omit<TextProps, 'variant'> {
  /** Livello del heading (1-6) */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const headingVariants: Record<number, TypographyVariant> = {
  1: 'displayLarge',
  2: 'displayMedium',
  3: 'displaySmall',
  4: 'headingLarge',
  5: 'headingMedium',
  6: 'headingSmall',
};

/**
 * Heading Component
 * Specializzazione di Text per titoli
 */
export function Heading({
  level = 1,
  ...rest
}: HeadingProps): JSX.Element {
  const variant = headingVariants[level] || 'headingLarge';

  return (
    <Text
      variant={variant}
      accessibilityRole="header"
      {...rest}
    />
  );
}

/**
 * Label Component
 * Specializzazione di Text per etichette
 */
export interface LabelProps extends Omit<TextProps, 'variant'> {
  size?: 'sm' | 'md' | 'lg';
}

export function Label({
  size = 'md',
  color = 'textSecondary',
  ...rest
}: LabelProps): JSX.Element {
  const variants: Record<string, TypographyVariant> = {
    sm: 'labelSmall',
    md: 'labelMedium',
    lg: 'labelLarge',
  };

  return <Text variant={variants[size]} color={color} {...rest} />;
}

/**
 * Caption Component
 * Specializzazione di Text per didascalie
 */
export function Caption(props: Omit<TextProps, 'variant'>): JSX.Element {
  return <Text variant="caption" color="textTertiary" {...props} />;
}
