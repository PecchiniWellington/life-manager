/**
 * ReminderPicker Component
 * Selettore per i promemoria dell'evento
 */

import React, { useState } from 'react';
import { Box, Text, Icon, AnimatedPressable } from '@shared/ui';
import { Modal } from '@shared/ui/molecules';
import { ReminderTime, reminderTimeLabels } from '../domain/types';

interface ReminderPickerProps {
  /** Promemoria selezionati */
  value: ReminderTime[];
  /** Callback quando cambiano i promemoria */
  onChange: (reminders: ReminderTime[]) => void;
}

const allReminderOptions: ReminderTime[] = [
  'at_time',
  '5_min',
  '10_min',
  '15_min',
  '30_min',
  '1_hour',
  '2_hours',
  '1_day',
  '2_days',
  '1_week',
];

export function ReminderPicker({ value, onChange }: ReminderPickerProps): JSX.Element {
  const [showModal, setShowModal] = useState(false);

  const toggleReminder = (reminder: ReminderTime) => {
    if (value.includes(reminder)) {
      onChange(value.filter((r) => r !== reminder));
    } else {
      onChange([...value, reminder]);
    }
  };

  const formatSelectedReminders = (): string => {
    if (value.length === 0) return 'Nessun promemoria';
    return value.map((r) => reminderTimeLabels[r]).join(', ');
  };

  return (
    <>
      <AnimatedPressable
        onPress={() => setShowModal(true)}
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
          <Icon name="notifications" size="sm" color="textSecondary" />
          <Box flex={1}>
            <Text
              variant="bodyMedium"
              color={value.length > 0 ? 'textPrimary' : 'textSecondary'}
              numberOfLines={2}
            >
              {formatSelectedReminders()}
            </Text>
          </Box>
          {value.length > 0 && (
            <AnimatedPressable
              onPress={() => onChange([])}
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
        title="Promemoria"
        scrollable
      >
        <Box gap="xs">
          {allReminderOptions.map((reminder) => {
            const isSelected = value.includes(reminder);
            return (
              <AnimatedPressable
                key={reminder}
                onPress={() => toggleReminder(reminder)}
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
                    {reminderTimeLabels[reminder]}
                  </Text>
                  {isSelected && (
                    <Icon name="check" size="sm" color="primary" />
                  )}
                </Box>
              </AnimatedPressable>
            );
          })}
        </Box>
      </Modal>
    </>
  );
}
