/**
 * RecurrencePicker Component
 * Selettore per la ricorrenza dell'evento
 */

import React, { useState } from 'react';
import { Box, Text, Icon, AnimatedPressable, Input } from '@shared/ui';
import { Modal } from '@shared/ui/molecules';
import { RecurrenceRule, RecurrenceFrequency, recurrenceFrequencyLabels } from '../domain/types';

interface RecurrencePickerProps {
  /** Regola di ricorrenza */
  value: RecurrenceRule | undefined;
  /** Callback quando cambia la ricorrenza */
  onChange: (recurrence: RecurrenceRule | undefined) => void;
}

const frequencyOptions: RecurrenceFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];

export function RecurrencePicker({ value, onChange }: RecurrencePickerProps): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const [localFrequency, setLocalFrequency] = useState<RecurrenceFrequency>(
    value?.frequency || 'weekly'
  );
  const [localInterval, setLocalInterval] = useState(value?.interval?.toString() || '1');

  const handleOpen = () => {
    setLocalFrequency(value?.frequency || 'weekly');
    setLocalInterval(value?.interval?.toString() || '1');
    setShowModal(true);
  };

  const handleSave = () => {
    const interval = parseInt(localInterval, 10) || 1;
    onChange({
      frequency: localFrequency,
      interval: Math.max(1, interval),
    });
    setShowModal(false);
  };

  const handleRemove = () => {
    onChange(undefined);
    setShowModal(false);
  };

  const formatRecurrence = (): string => {
    if (!value) return 'Non si ripete';

    switch (value.frequency) {
      case 'daily':
        return value.interval > 1 ? `Ogni ${value.interval} giorni` : 'Ogni giorno';
      case 'weekly':
        return value.interval > 1 ? `Ogni ${value.interval} settimane` : 'Ogni settimana';
      case 'monthly':
        return value.interval > 1 ? `Ogni ${value.interval} mesi` : 'Ogni mese';
      case 'yearly':
        return value.interval > 1 ? `Ogni ${value.interval} anni` : 'Ogni anno';
      default:
        return 'Non si ripete';
    }
  };

  return (
    <>
      <AnimatedPressable
        onPress={handleOpen}
        haptic="light"
        pressScale={0.98}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          padding="md"
          backgroundColor="surfaceSecondary"
          borderRadius="input"
          gap="sm"
        >
          <Icon name="sync" size="sm" color="textSecondary" />
          <Box flex={1}>
            <Text
              variant="bodyMedium"
              color={value ? 'textPrimary' : 'textSecondary'}
            >
              {formatRecurrence()}
            </Text>
          </Box>
          {value && (
            <AnimatedPressable
              onPress={() => onChange(undefined)}
              haptic="light"
              pressScale={0.9}
            >
              <Icon name="close" size="xs" color="textTertiary" />
            </AnimatedPressable>
          )}
          <Icon name="chevronRight" size="sm" color="textTertiary" />
        </Box>
      </AnimatedPressable>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Ripeti"
        scrollable
      >
        <Box gap="lg">
          {/* Frequency selection */}
          <Box gap="xs">
            <Text variant="labelMedium" color="textSecondary">
              Frequenza
            </Text>
            <Box gap="xs">
              {frequencyOptions.map((freq) => {
                const isSelected = localFrequency === freq;
                return (
                  <AnimatedPressable
                    key={freq}
                    onPress={() => setLocalFrequency(freq)}
                    haptic="selection"
                    pressScale={0.98}
                  >
                    <Box
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      padding="md"
                      backgroundColor={isSelected ? 'primaryLight' : 'surfaceSecondary'}
                      borderRadius="md"
                    >
                      <Text
                        variant="bodyMedium"
                        color={isSelected ? 'primary' : 'textPrimary'}
                        weight={isSelected ? 'semibold' : 'regular'}
                      >
                        {recurrenceFrequencyLabels[freq]}
                      </Text>
                      {isSelected && (
                        <Icon name="check" size="sm" color="primary" />
                      )}
                    </Box>
                  </AnimatedPressable>
                );
              })}
            </Box>
          </Box>

          {/* Interval */}
          <Input
            label="Ogni quanti"
            value={localInterval}
            onChangeText={setLocalInterval}
            keyboardType="number-pad"
            placeholder="1"
          />

          {/* Actions */}
          <Box flexDirection="row" gap="md">
            {value && (
              <Box flex={1}>
                <AnimatedPressable
                  onPress={handleRemove}
                  haptic="light"
                  pressScale={0.98}
                >
                  <Box
                    padding="md"
                    backgroundColor="errorLight"
                    borderRadius="md"
                    alignItems="center"
                  >
                    <Text variant="bodyMedium" color="error" weight="semibold">
                      Rimuovi
                    </Text>
                  </Box>
                </AnimatedPressable>
              </Box>
            )}
            <Box flex={1}>
              <AnimatedPressable
                onPress={handleSave}
                haptic="light"
                pressScale={0.98}
              >
                <Box
                  padding="md"
                  backgroundColor="primary"
                  borderRadius="md"
                  alignItems="center"
                >
                  <Text variant="bodyMedium" color="onPrimary" weight="semibold">
                    Salva
                  </Text>
                </Box>
              </AnimatedPressable>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
