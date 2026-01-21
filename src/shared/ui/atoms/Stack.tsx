/**
 * Stack Atom
 * Layout component per disposizione verticale o orizzontale
 */

import React from 'react';
import { Box, BoxProps } from './Box';
import { SpacingKey } from '../tokens';

/**
 * Stack Props
 */
export interface StackProps extends Omit<BoxProps, 'flexDirection'> {
  /** Direzione dello stack */
  direction?: 'vertical' | 'horizontal';
  /** Spaziatura tra gli elementi */
  spacing?: SpacingKey;
  /** Allineamento sull'asse principale */
  align?: BoxProps['alignItems'];
  /** Distribuzione sull'asse principale */
  justify?: BoxProps['justifyContent'];
  /** Se true, i children si espandono per riempire lo spazio */
  fill?: boolean;
}

/**
 * Stack Component
 * Utility per layout lineari verticali o orizzontali
 */
export function Stack({
  direction = 'vertical',
  spacing = 'sm',
  align,
  justify,
  fill,
  children,
  ...rest
}: StackProps): JSX.Element {
  return (
    <Box
      flexDirection={direction === 'vertical' ? 'column' : 'row'}
      gap={spacing}
      alignItems={align}
      justifyContent={justify}
      flex={fill ? 1 : undefined}
      {...rest}
    >
      {children}
    </Box>
  );
}

/**
 * VStack - Shortcut per Stack verticale
 */
export function VStack(props: Omit<StackProps, 'direction'>): JSX.Element {
  return <Stack direction="vertical" {...props} />;
}

/**
 * HStack - Shortcut per Stack orizzontale
 */
export function HStack(props: Omit<StackProps, 'direction'>): JSX.Element {
  return <Stack direction="horizontal" {...props} />;
}
