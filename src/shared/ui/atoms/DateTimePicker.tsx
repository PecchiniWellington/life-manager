/**
 * DateTimePicker
 * Wrapper per picker date/time nativo con UI Apple-style
 */

import React, { useState, useCallback } from 'react';
import { Platform, StyleSheet, View, Modal as RNModal } from 'react-native';
import RNDateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Box } from './Box';
import { Text } from './Text';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon } from './Icon';
import { useTheme } from '../theme';
import { radius, spacing } from '../tokens';

export type DateTimePickerMode = 'date' | 'time' | 'datetime';

export interface DateTimePickerProps {
  /** Valore corrente */
  value: Date | null;
  /** Callback cambio valore */
  onChange: (date: Date | null) => void;
  /** Modalita picker */
  mode?: DateTimePickerMode;
  /** Label */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Data minima */
  minimumDate?: Date;
  /** Data massima */
  maximumDate?: Date;
  /** Errore */
  error?: string;
  /** Disabilitato */
  disabled?: boolean;
  /** Permetti clear */
  clearable?: boolean;
  /** Visibilita controllata (per uso inline) */
  visible?: boolean;
  /** Callback annulla (per uso inline) */
  onCancel?: () => void;
}

/**
 * Format date based on mode
 */
function formatValue(date: Date | null, mode: DateTimePickerMode): string | null {
  if (!date) return null;

  switch (mode) {
    case 'date':
      return format(date, 'd MMMM yyyy', { locale: it });
    case 'time':
      return format(date, 'HH:mm', { locale: it });
    case 'datetime':
      return format(date, 'd MMM yyyy, HH:mm', { locale: it });
    default:
      return null;
  }
}

/**
 * DateTimePicker Component
 */
export function DateTimePicker({
  value,
  onChange,
  mode = 'date',
  label,
  placeholder = 'Seleziona',
  minimumDate,
  maximumDate,
  error,
  disabled = false,
  clearable = true,
  visible,
  onCancel,
}: DateTimePickerProps): JSX.Element {
  const theme = useTheme();
  const [internalShow, setInternalShow] = useState(false);
  const [tempValue, setTempValue] = useState<Date>(value || new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>(
    mode === 'time' ? 'time' : 'date'
  );

  // Use controlled visibility if provided
  const show = visible !== undefined ? visible : internalShow;
  const setShow = visible !== undefined
    ? (val: boolean) => { if (!val && onCancel) onCancel(); }
    : setInternalShow;

  const formattedValue = formatValue(value, mode);

  // Handle native picker change
  const handleChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === 'android') {
        setShow(false);
        if (event.type === 'set' && date) {
          // For datetime mode on Android, show time picker after date
          if (mode === 'datetime' && pickerMode === 'date') {
            setTempValue(date);
            setPickerMode('time');
            setShow(true);
          } else {
            const finalDate =
              mode === 'datetime' && pickerMode === 'time'
                ? new Date(
                    tempValue.getFullYear(),
                    tempValue.getMonth(),
                    tempValue.getDate(),
                    date.getHours(),
                    date.getMinutes()
                  )
                : date;
            onChange(finalDate);
            setPickerMode(mode === 'time' ? 'time' : 'date');
          }
        }
      } else {
        // iOS - update temp value
        if (date) {
          setTempValue(date);
        }
      }
    },
    [mode, pickerMode, tempValue, onChange]
  );

  // Confirm selection (iOS)
  const handleConfirm = useCallback(() => {
    setShow(false);
    onChange(tempValue);
  }, [tempValue, onChange]);

  // Cancel selection
  const handleCancel = useCallback(() => {
    if (visible !== undefined && onCancel) {
      onCancel();
    } else {
      setInternalShow(false);
    }
    setTempValue(value || new Date());
  }, [value, visible, onCancel]);

  // Clear value
  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  // Open picker
  const handleOpen = useCallback(() => {
    if (disabled) return;
    setTempValue(value || new Date());
    setPickerMode(mode === 'time' ? 'time' : 'date');
    setShow(true);
  }, [disabled, value, mode]);

  // If using controlled visibility (inline mode), don't render the trigger
  const isControlledMode = visible !== undefined;

  return (
    <>
      {/* Only render trigger UI when NOT in controlled mode */}
      {!isControlledMode && (
        <Box gap="xs">
          {label && (
            <Text variant="labelMedium" color="textSecondary">
              {label}
            </Text>
          )}

          <AnimatedPressable
            onPress={handleOpen}
            disabled={disabled}
            haptic="light"
            style={[
              styles.trigger,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: radius.input,
                borderColor: error ? theme.colors.error : theme.colors.border,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <Text
              variant="bodyMedium"
              color={formattedValue ? 'textPrimary' : 'textTertiary'}
              style={styles.value}
            >
              {formattedValue || placeholder}
            </Text>

            <Box flexDirection="row" alignItems="center" gap="sm">
              {clearable && value && !disabled && (
                <AnimatedPressable
                  onPress={handleClear}
                  haptic="light"
                  style={styles.clearButton}
                >
                  <Icon name="close" size="xs" color="textTertiary" />
                </AnimatedPressable>
              )}
              <Icon
                name={mode === 'time' ? 'clock' : 'calendar'}
                size="sm"
                color="textSecondary"
              />
            </Box>
          </AnimatedPressable>

          {error && (
            <Text variant="caption" color="error">
              {error}
            </Text>
          )}
        </Box>
      )}

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && show && (
        <RNModal
          visible={show}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <AnimatedPressable
              style={styles.backdrop}
              onPress={handleCancel}
              haptic="none"
            />
            <View
              style={[
                styles.pickerContainer,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              {/* Header */}
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                paddingX="lg"
                paddingY="md"
                borderBottomWidth={1}
                borderColor="separator"
              >
                <AnimatedPressable onPress={handleCancel} haptic="light">
                  <Text color="textSecondary">Annulla</Text>
                </AnimatedPressable>

                <Text variant="labelLarge" weight="semibold">
                  {mode === 'time'
                    ? 'Seleziona ora'
                    : mode === 'datetime'
                    ? 'Seleziona data e ora'
                    : 'Seleziona data'}
                </Text>

                <AnimatedPressable onPress={handleConfirm} haptic="light">
                  <Text color="primary" weight="semibold">
                    Conferma
                  </Text>
                </AnimatedPressable>
              </Box>

              {/* Picker */}
              <RNDateTimePicker
                value={tempValue}
                mode={mode === 'datetime' ? 'datetime' : mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale="it-IT"
                textColor={theme.colors.textPrimary}
                style={styles.picker}
              />
            </View>
          </View>
        </RNModal>
      )}

      {/* Android Picker */}
      {Platform.OS === 'android' && show && (
        <RNDateTimePicker
          value={tempValue}
          mode={pickerMode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  value: {
    flex: 1,
  },
  clearButton: {
    padding: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  pickerContainer: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingBottom: spacing['4xl'], // Safe area approximation
  },
  picker: {
    height: 216,
  },
});

export default DateTimePicker;
