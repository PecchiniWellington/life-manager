/**
 * Badge Atom
 * Indicatore numerico o di stato
 */

import React from 'react';
import { Box } from './Box';
import { Text } from './Text';
import { SemanticColorKey, sizes } from '../tokens';

/**
 * Badge variants
 */
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Badge sizes
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Badge Props
 */
export interface BadgeProps {
  /** Contenuto del badge (numero o testo breve) */
  content?: string | number;
  /** Variante colore */
  variant?: BadgeVariant;
  /** Dimensione */
  size?: BadgeSize;
  /** Se true, mostra solo un dot senza contenuto */
  dot?: boolean;
  /** Valore massimo (per numeri) */
  max?: number;
}

const variantColors: Record<BadgeVariant, SemanticColorKey> = {
  default: 'secondary',
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
};

const variantTextColors: Record<BadgeVariant, SemanticColorKey> = {
  default: 'textPrimary',
  primary: 'onPrimary',
  success: 'onSuccess',
  warning: 'onWarning',
  error: 'onError',
  info: 'onInfo',
};

const sizeConfig: Record<BadgeSize, { minWidth: number; height: number; paddingX: number; dotSize: number }> = {
  sm: { minWidth: sizes.badge.sm, height: sizes.badge.sm, paddingX: sizes.badgePaddingX.sm, dotSize: sizes.badgeDot.sm },
  md: { minWidth: sizes.badge.md, height: sizes.badge.md, paddingX: sizes.badgePaddingX.md, dotSize: sizes.badgeDot.md },
  lg: { minWidth: sizes.badge.lg, height: sizes.badge.lg, paddingX: sizes.badgePaddingX.lg, dotSize: sizes.badgeDot.lg },
};

/**
 * Badge Component
 */
export function Badge({
  content,
  variant = 'error',
  size = 'md',
  dot = false,
  max = 99,
}: BadgeProps): JSX.Element {
  const config = sizeConfig[size];

  // Format content
  let displayContent = content;
  if (typeof content === 'number' && content > max) {
    displayContent = `${max}+`;
  }

  if (dot) {
    return (
      <Box
        width={config.dotSize}
        height={config.dotSize}
        borderRadius="full"
        backgroundColor={variantColors[variant]}
      />
    );
  }

  return (
    <Box
      minWidth={config.minWidth}
      height={config.height}
      paddingX="xs"
      borderRadius="full"
      backgroundColor={variantColors[variant]}
      alignItems="center"
      justifyContent="center"
    >
      <Text
        variant={size === 'sm' ? 'caption' : 'labelSmall'}
        color={variantTextColors[variant]}
      >
        {displayContent}
      </Text>
    </Box>
  );
}

/**
 * BadgeContainer Props
 * Wrapper per posizionare un badge sopra un altro elemento
 */
export interface BadgeContainerProps {
  children: React.ReactNode;
  badge: React.ReactNode;
  /** Posizione del badge */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Offset dal bordo */
  offset?: number;
}

/**
 * BadgeContainer Component
 */
export function BadgeContainer({
  children,
  badge,
  position = 'top-right',
  offset = -4,
}: BadgeContainerProps): JSX.Element {
  const positionStyle = {
    'top-right': { top: offset, right: offset },
    'top-left': { top: offset, left: offset },
    'bottom-right': { bottom: offset, right: offset },
    'bottom-left': { bottom: offset, left: offset },
  };

  const pos = positionStyle[position];

  return (
    <Box position="relative">
      {children}
      <Box
        position="absolute"
        top={'top' in pos ? pos.top : undefined}
        right={'right' in pos ? pos.right : undefined}
        left={'left' in pos ? pos.left : undefined}
        bottom={'bottom' in pos ? pos.bottom : undefined}
      >
        {badge}
      </Box>
    </Box>
  );
}
