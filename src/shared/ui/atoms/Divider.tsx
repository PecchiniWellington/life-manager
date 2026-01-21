/**
 * Divider Atom
 * Separatore visivo
 */

import React from 'react';
import { Box, BoxProps } from './Box';
import { SpacingKey, SemanticColorKey } from '../tokens';

/**
 * Divider Props
 */
export interface DividerProps {
  /** Orientamento */
  orientation?: 'horizontal' | 'vertical';
  /** Spessore */
  thickness?: number;
  /** Colore */
  color?: SemanticColorKey;
  /** Margine */
  spacing?: SpacingKey;
}

/**
 * Divider Component
 */
export function Divider({
  orientation = 'horizontal',
  thickness = 1,
  color = 'border',
  spacing = 'none',
}: DividerProps): JSX.Element {
  const isHorizontal = orientation === 'horizontal';

  return (
    <Box
      backgroundColor={color}
      width={isHorizontal ? '100%' : thickness}
      height={isHorizontal ? thickness : '100%'}
      marginY={isHorizontal ? spacing : 'none'}
      marginX={isHorizontal ? 'none' : spacing}
    />
  );
}
