/**
 * Spacer Atom
 * Componente per aggiungere spazio flessibile o fisso
 */

import React from 'react';
import { Box } from './Box';
import { SpacingKey } from '../tokens';

/**
 * Spacer Props
 */
export interface SpacerProps {
  /** Dimensione fissa (se specificata, non è flessibile) */
  size?: SpacingKey;
  /** Se true, si espande per riempire lo spazio disponibile */
  flex?: boolean;
  /** Direzione dello spacer */
  direction?: 'horizontal' | 'vertical';
}

/**
 * Spacer Component
 * Aggiunge spazio fisso o flessibile tra elementi
 */
export function Spacer({
  size,
  flex = false,
  direction = 'vertical',
}: SpacerProps): JSX.Element {
  if (flex) {
    return <Box flex={1} />;
  }

  if (size) {
    const isVertical = direction === 'vertical';
    return (
      <Box
        height={isVertical ? undefined : undefined}
        width={isVertical ? undefined : undefined}
        paddingTop={isVertical ? size : undefined}
        paddingLeft={isVertical ? undefined : size}
      />
    );
  }

  return <Box flex={1} />;
}
