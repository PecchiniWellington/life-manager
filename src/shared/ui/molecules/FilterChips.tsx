/**
 * FilterChips Molecule
 * Gruppo di chip per filtri
 */

import React from 'react';
import { ScrollView } from 'react-native';
import { Box, Chip, ChipIntent } from '../atoms';
import { useTheme } from '../theme';

/**
 * Filter option
 */
export interface FilterOption<T = string> {
  /** Valore del filtro */
  value: T;
  /** Label da mostrare */
  label: string;
  /** Intento colore */
  intent?: ChipIntent;
}

/**
 * FilterChips Props
 */
export interface FilterChipsProps<T = string> {
  /** Opzioni disponibili */
  options: FilterOption<T>[];
  /** Valore selezionato */
  value: T | null;
  /** Callback quando cambia la selezione */
  onChange: (value: T | null) => void;
  /** Se true, permette di deselezionare */
  allowDeselect?: boolean;
  /** Label per "tutti" */
  allLabel?: string;
  /** Se true, mostra opzione "tutti" */
  showAll?: boolean;
}

/**
 * FilterChips Component
 */
export function FilterChips<T = string>({
  options,
  value,
  onChange,
  allowDeselect = true,
  allLabel = 'Tutti',
  showAll = true,
}: FilterChipsProps<T>): JSX.Element {
  const theme = useTheme();

  const handlePress = (optionValue: T | null) => {
    if (allowDeselect && value === optionValue) {
      onChange(null);
    } else {
      onChange(optionValue);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.spacing.sm }}
    >
      {showAll && (
        <Chip
          label={allLabel}
          selected={value === null}
          onPress={() => handlePress(null)}
          variant="soft"
        />
      )}
      {options.map((option) => (
        <Chip
          key={String(option.value)}
          label={option.label}
          selected={value === option.value}
          onPress={() => handlePress(option.value)}
          variant="soft"
          intent={option.intent}
        />
      ))}
    </ScrollView>
  );
}

/**
 * MultiFilterChips Props
 */
export interface MultiFilterChipsProps<T = string> {
  /** Opzioni disponibili */
  options: FilterOption<T>[];
  /** Valori selezionati */
  values: T[];
  /** Callback quando cambia la selezione */
  onChange: (values: T[]) => void;
}

/**
 * MultiFilterChips Component
 * Permette selezione multipla
 */
export function MultiFilterChips<T = string>({
  options,
  values,
  onChange,
}: MultiFilterChipsProps<T>): JSX.Element {
  const theme = useTheme();

  const handlePress = (optionValue: T) => {
    if (values.includes(optionValue)) {
      onChange(values.filter((v) => v !== optionValue));
    } else {
      onChange([...values, optionValue]);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.spacing.sm }}
    >
      {options.map((option) => (
        <Chip
          key={String(option.value)}
          label={option.label}
          selected={values.includes(option.value)}
          onPress={() => handlePress(option.value)}
          variant="soft"
          intent={option.intent}
        />
      ))}
    </ScrollView>
  );
}
