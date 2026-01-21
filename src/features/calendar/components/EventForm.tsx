/**
 * EventForm Component
 * Form per creazione/modifica eventi - NO TAG NATIVI
 * MOLECULE: Usa solo atoms del design system
 * Features: BottomSheet, DateTimePicker, AnimatedPressable
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  HStack,
  VStack,
  Button,
  Input,
  TextArea,
  Text,
  Icon,
  AnimatedPressable,
  DateTimePicker,
} from '@shared/ui';
import { Modal } from '@shared/ui/molecules';
import { CalendarEvent, CreateEventPayload, EventValidationErrors } from '../domain/types';
import { EventColor, eventColors } from '@shared/ui/tokens';

interface EventFormProps {
  /** Se il form è visibile */
  visible: boolean;
  /** Callback chiusura */
  onClose: () => void;
  /** Callback submit */
  onSubmit: (payload: CreateEventPayload) => Promise<boolean>;
  /** Dati iniziali per edit */
  initialData?: CalendarEvent | null;
  /** Data selezionata */
  selectedDate?: string;
}

const colorOptions: EventColor[] = ['blue', 'green', 'red', 'yellow', 'purple', 'orange'];

export function EventForm({
  visible,
  onClose,
  onSubmit,
  initialData,
  selectedDate,
}: EventFormProps): JSX.Element {
  const isEditing = !!initialData;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<EventColor>('blue');
  const [allDay, setAllDay] = useState(false);
  const [startDateTime, setStartDateTime] = useState<Date>(new Date());
  const [endDateTime, setEndDateTime] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [errors, setErrors] = useState<EventValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with data
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setColor(initialData.color);
        setAllDay(initialData.allDay);
        setStartDateTime(new Date(initialData.startAt));
        setEndDateTime(new Date(initialData.endAt));
      } else if (selectedDate) {
        const baseDate = new Date(selectedDate);
        baseDate.setHours(9, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(10, 0, 0, 0);

        setTitle('');
        setDescription('');
        setColor('blue');
        setAllDay(false);
        setStartDateTime(baseDate);
        setEndDateTime(endDate);
      }
      setErrors({});
    }
  }, [visible, initialData, selectedDate]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTimeDisplay = (date: Date): string => {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartDateChange = useCallback((date: Date | null) => {
    if (!date) return;
    const newStart = new Date(startDateTime);
    newStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setStartDateTime(newStart);

    // Adjust end date if needed
    if (newStart > endDateTime) {
      const newEnd = new Date(newStart);
      newEnd.setHours(newStart.getHours() + 1);
      setEndDateTime(newEnd);
    }
    setShowStartDatePicker(false);
  }, [startDateTime, endDateTime]);

  const handleStartTimeChange = useCallback((date: Date | null) => {
    if (!date) return;
    const newStart = new Date(startDateTime);
    newStart.setHours(date.getHours(), date.getMinutes());
    setStartDateTime(newStart);

    // Adjust end time if needed
    if (newStart >= endDateTime) {
      const newEnd = new Date(newStart);
      newEnd.setHours(newStart.getHours() + 1);
      setEndDateTime(newEnd);
    }
    setShowStartTimePicker(false);
  }, [startDateTime, endDateTime]);

  const handleEndDateChange = useCallback((date: Date | null) => {
    if (!date) return;
    const newEnd = new Date(endDateTime);
    newEnd.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setEndDateTime(newEnd);
    setShowEndDatePicker(false);
  }, [endDateTime]);

  const handleEndTimeChange = useCallback((date: Date | null) => {
    if (!date) return;
    const newEnd = new Date(endDateTime);
    newEnd.setHours(date.getHours(), date.getMinutes());
    setEndDateTime(newEnd);
    setShowEndTimePicker(false);
  }, [endDateTime]);

  const toggleAllDay = useCallback(() => {
    setAllDay((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrors({});
    setIsSubmitting(true);

    // Build ISO strings
    const startAt = allDay
      ? new Date(startDateTime.setHours(0, 0, 0, 0)).toISOString()
      : startDateTime.toISOString();
    const endAt = allDay
      ? new Date(endDateTime.setHours(23, 59, 59, 999)).toISOString()
      : endDateTime.toISOString();

    const payload: CreateEventPayload = {
      title: title.trim(),
      description: description.trim(),
      startAt,
      endAt,
      color,
      allDay,
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  }, [title, description, color, allDay, startDateTime, endDateTime, onSubmit, onClose]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Modifica evento' : 'Nuovo evento'}
      scrollable
      dismissOnBackdrop={false}
    >
      <VStack spacing="lg" paddingBottom="xl">
        {/* Title */}
        <Input
          label="Titolo"
          placeholder="Nome dell'evento"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
          autoFocus
          size="lg"
        />

        {/* Description */}
        <Box gap="xs">
          <Text variant="labelMedium" color="textSecondary">
            Descrizione
          </Text>
          <TextArea
            placeholder="Descrizione opzionale..."
            value={description}
            onChangeText={setDescription}
            numberOfLines={2}
          />
        </Box>

        {/* Color picker */}
        <Box gap="xs">
          <Text variant="labelMedium" color="textSecondary">
            Colore
          </Text>
          <Box flexDirection="row" gap="sm" flexWrap="wrap">
            {colorOptions.map((c) => (
              <AnimatedPressable
                key={c}
                onPress={() => setColor(c)}
                haptic="selection"
                pressScale={0.9}
              >
                <Box
                  width={40}
                  height={40}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={color === c ? 3 : 0}
                  borderColor="primary"
                  style={{ backgroundColor: eventColors[c] }}
                >
                  {color === c && (
                    <Icon name="check" size="sm" color="onPrimary" />
                  )}
                </Box>
              </AnimatedPressable>
            ))}
          </Box>
        </Box>

        {/* All day toggle */}
        <AnimatedPressable
          onPress={toggleAllDay}
          haptic="selection"
          pressScale={0.98}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            padding="md"
            backgroundColor={allDay ? 'primaryLight' : 'surfaceSecondary'}
            borderRadius="input"
          >
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Icon name="calendar" size="sm" color={allDay ? 'primary' : 'textSecondary'} />
              <Text
                variant="bodyMedium"
                color={allDay ? 'primary' : 'textPrimary'}
                weight={allDay ? 'semibold' : 'regular'}
              >
                Tutto il giorno
              </Text>
            </Box>
            <Box
              width={24}
              height={24}
              borderRadius="sm"
              backgroundColor={allDay ? 'primary' : 'transparent'}
              borderWidth={allDay ? 0 : 2}
              borderColor="border"
              alignItems="center"
              justifyContent="center"
            >
              {allDay && <Icon name="check" size="xs" color="onPrimary" />}
            </Box>
          </Box>
        </AnimatedPressable>

        {/* Start Date/Time */}
        <Box gap="xs">
          <Text variant="labelMedium" color="textSecondary">
            Inizio
          </Text>
          <HStack spacing="sm">
            <AnimatedPressable
              onPress={() => setShowStartDatePicker(true)}
              haptic="light"
              pressScale={0.98}
              style={{ flex: 1 }}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                padding="md"
                backgroundColor="surfaceSecondary"
                borderRadius="input"
                gap="sm"
              >
                <Icon name="calendar" size="sm" color="textSecondary" />
                <Text variant="bodyMedium">{formatDate(startDateTime)}</Text>
              </Box>
            </AnimatedPressable>

            {!allDay && (
              <AnimatedPressable
                onPress={() => setShowStartTimePicker(true)}
                haptic="light"
                pressScale={0.98}
                style={{ flex: 1 }}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  padding="md"
                  backgroundColor="surfaceSecondary"
                  borderRadius="input"
                  gap="sm"
                >
                  <Icon name="time" size="sm" color="textSecondary" />
                  <Text variant="bodyMedium">{formatTimeDisplay(startDateTime)}</Text>
                </Box>
              </AnimatedPressable>
            )}
          </HStack>
        </Box>

        {/* End Date/Time */}
        <Box gap="xs">
          <Text variant="labelMedium" color="textSecondary">
            Fine
          </Text>
          <HStack spacing="sm">
            <AnimatedPressable
              onPress={() => setShowEndDatePicker(true)}
              haptic="light"
              pressScale={0.98}
              style={{ flex: 1 }}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                padding="md"
                backgroundColor="surfaceSecondary"
                borderRadius="input"
                gap="sm"
              >
                <Icon name="calendar" size="sm" color="textSecondary" />
                <Text variant="bodyMedium">{formatDate(endDateTime)}</Text>
              </Box>
            </AnimatedPressable>

            {!allDay && (
              <AnimatedPressable
                onPress={() => setShowEndTimePicker(true)}
                haptic="light"
                pressScale={0.98}
                style={{ flex: 1 }}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  padding="md"
                  backgroundColor="surfaceSecondary"
                  borderRadius="input"
                  gap="sm"
                >
                  <Icon name="time" size="sm" color="textSecondary" />
                  <Text variant="bodyMedium">{formatTimeDisplay(endDateTime)}</Text>
                </Box>
              </AnimatedPressable>
            )}
          </HStack>
        </Box>

        {/* DateTimePickers */}
        <DateTimePicker
          visible={showStartDatePicker}
          value={startDateTime}
          mode="date"
          onChange={handleStartDateChange}
          onCancel={() => setShowStartDatePicker(false)}
        />
        <DateTimePicker
          visible={showStartTimePicker}
          value={startDateTime}
          mode="time"
          onChange={handleStartTimeChange}
          onCancel={() => setShowStartTimePicker(false)}
        />
        <DateTimePicker
          visible={showEndDatePicker}
          value={endDateTime}
          mode="date"
          onChange={handleEndDateChange}
          onCancel={() => setShowEndDatePicker(false)}
          minimumDate={startDateTime}
        />
        <DateTimePicker
          visible={showEndTimePicker}
          value={endDateTime}
          mode="time"
          onChange={handleEndTimeChange}
          onCancel={() => setShowEndTimePicker(false)}
        />

        {/* Error message */}
        {errors.general && (
          <Box
            flexDirection="row"
            alignItems="center"
            padding="sm"
            backgroundColor="error"
            borderRadius="md"
            gap="sm"
          >
            <Icon name="error" size="sm" color="onError" />
            <Text color="onError" variant="bodySmall">
              {errors.general}
            </Text>
          </Box>
        )}

        {/* Actions */}
        <HStack spacing="md" marginTop="md">
          <Box flex={1}>
            <Button
              title="Annulla"
              variant="secondary"
              onPress={onClose}
              accessibilityLabel="Annulla"
              fullWidth
            />
          </Box>
          <Box flex={1}>
            <Button
              title={isEditing ? 'Salva' : 'Crea'}
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!title.trim()}
              accessibilityLabel={isEditing ? 'Salva evento' : 'Crea evento'}
              fullWidth
            />
          </Box>
        </HStack>
      </VStack>
    </Modal>
  );
}
