/**
 * Toggle Atom
 * Switch/Toggle component per abilitare/disabilitare opzioni
 * ATOM: Può usare tag nativi React Native
 */

import React from 'react';
import { Switch, SwitchProps } from 'react-native';
import { useTheme } from '../theme';
import { palette } from '../tokens';

export interface ToggleProps extends Omit<SwitchProps, 'trackColor' | 'thumbColor'> {
  /** Whether the toggle is on */
  value: boolean;
  /** Callback when value changes */
  onValueChange: (value: boolean) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

export function Toggle({
  value,
  onValueChange,
  disabled = false,
  size = 'md',
  ...rest
}: ToggleProps): JSX.Element {
  const { colors } = useTheme();

  // Scale transform based on size
  const scale = size === 'sm' ? 0.8 : 1;

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: colors.border,
        true: colors.primary,
      }}
      thumbColor={palette.white}
      ios_backgroundColor={colors.border}
      style={{
        transform: [{ scale }],
        opacity: disabled ? 0.5 : 1,
      }}
      {...rest}
    />
  );
}
