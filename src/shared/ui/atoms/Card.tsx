/**
 * Card Atom
 * Componente per contenuti raggruppati
 */

import React from 'react';
import { Box, BoxProps } from './Box';
import { Pressable, PressableProps } from './Pressable';
import { ShadowKey, RadiusKey, SpacingKey } from '../tokens';

/**
 * Card Props
 */
export interface CardProps extends Omit<BoxProps, 'shadow' | 'borderRadius'> {
  /** Livello di elevazione */
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  /** Border radius */
  radius?: RadiusKey;
  /** Se true, mostra il bordo */
  bordered?: boolean;
  /** Padding interno */
  padding?: SpacingKey;
}

const elevationMap: Record<string, ShadowKey> = {
  none: 'none',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

/**
 * Card Component
 */
export function Card({
  elevation = 'sm',
  radius = 'md',
  bordered = false,
  padding = 'lg',
  children,
  ...rest
}: CardProps): JSX.Element {
  return (
    <Box
      backgroundColor="surface"
      borderRadius={radius}
      shadow={elevationMap[elevation]}
      borderWidth={bordered ? 1 : 0}
      borderColor="border"
      padding={padding}
      {...rest}
    >
      {children}
    </Box>
  );
}

/**
 * PressableCard Props
 */
export interface PressableCardProps extends Omit<PressableProps, 'borderRadius'> {
  /** Livello di elevazione */
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  /** Border radius */
  radius?: RadiusKey;
  /** Se true, mostra il bordo */
  bordered?: boolean;
}

/**
 * PressableCard Component
 * Card interattiva
 */
export function PressableCard({
  elevation = 'sm',
  radius = 'md',
  bordered = false,
  children,
  ...rest
}: PressableCardProps): JSX.Element {
  return (
    <Pressable
      backgroundColor="surface"
      borderRadius={radius}
      borderWidth={bordered ? 1 : 0}
      borderColor="border"
      padding="lg"
      {...rest}
    >
      <Box shadow={elevationMap[elevation]}>{children}</Box>
    </Pressable>
  );
}
