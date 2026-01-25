/**
 * EventForm Component
 * Form per creazione/modifica eventi - TimeTree style
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
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
import {
  CalendarEvent,
  CreateEventPayload,
  UpdateEventPayload,
  EventValidationErrors,
  ReminderTime,
  RecurrenceRule,
  ChecklistItem,
} from '../domain/types';
import { EventColor, eventColors, sizes, spacing, typography } from '@shared/ui/tokens';
import { ReminderPicker } from './ReminderPicker';
import { RecurrencePicker } from './RecurrencePicker';
import { ChecklistEditor } from './ChecklistEditor';
import { EventSpaceSelector } from './EventSpaceSelector';
import { useSpaces } from '@features/spaces/hooks';

interface EventFormProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (payload: CreateEventPayload) => Promise<boolean>;
  onUpdate: (payload: UpdateEventPayload) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  initialData?: CalendarEvent | null;
  selectedDate?: string;
}

const colorOptions: EventColor[] = ['blue', 'green', 'red', 'yellow', 'purple', 'orange'];

export function EventForm({
  visible,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  initialData,
  selectedDate,
}: EventFormProps): JSX.Element {
  const isEditing = !!initialData;
  const { currentSpace } = useSpaces();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
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

  // New TimeTree fields
  const [isFloating, setIsFloating] = useState(false);
  const [spaceId, setSpaceId] = useState('');
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [reminders, setReminders] = useState<ReminderTime[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>(undefined);

  // Additional fields visibility
  const [showLocation, setShowLocation] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

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
        setSpaceId(initialData.spaceId);
        setIsFloating(initialData.isFloating || false);
        setLocation(initialData.location || '');
        setUrl(initialData.url || '');
        setNotes(initialData.notes || '');
        setChecklist(initialData.checklist || []);
        setReminders(initialData.reminders || []);
        setRecurrence(initialData.recurrence);
        // Show fields if they have content
        setShowLocation(!!initialData.location);
        setShowUrl(!!initialData.url);
        setShowNotes(!!initialData.notes);
        setShowChecklist((initialData.checklist?.length || 0) > 0);
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
        setSpaceId(currentSpace?.id || '');
        setIsFloating(false);
        setLocation('');
        setUrl('');
        setNotes('');
        setChecklist([]);
        setReminders([]);
        setRecurrence(undefined);
        setShowLocation(false);
        setShowUrl(false);
        setShowNotes(false);
        setShowChecklist(false);
      }
      setErrors({});
    }
  }, [visible, initialData, selectedDate, currentSpace]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  const toggleFloating = useCallback(() => {
    setIsFloating((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrors({});
    setIsSubmitting(true);

    const startAt = allDay
      ? new Date(new Date(startDateTime).setHours(0, 0, 0, 0)).toISOString()
      : startDateTime.toISOString();
    const endAt = allDay
      ? new Date(new Date(endDateTime).setHours(23, 59, 59, 999)).toISOString()
      : endDateTime.toISOString();

    let success: boolean;

    const commonPayload = {
      title: title.trim(),
      description: description.trim(),
      startAt,
      endAt,
      color,
      allDay,
      isFloating,
      location: location.trim() || undefined,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      checklist: checklist.length > 0 ? checklist : undefined,
      reminders: reminders.length > 0 ? reminders : undefined,
      recurrence,
    };

    if (isEditing && initialData) {
      const payload: UpdateEventPayload = {
        id: initialData.id,
        ...commonPayload,
      };
      success = await onUpdate(payload);
    } else {
      const payload: CreateEventPayload = commonPayload;
      success = await onCreate(payload);
    }

    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  }, [
    title, description, color, allDay, startDateTime, endDateTime,
    isFloating, location, url, notes, checklist, reminders, recurrence,
    isEditing, initialData, onCreate, onUpdate, onClose,
  ]);

  const handleDelete = useCallback(async () => {
    if (!initialData) return;

    setIsDeleting(true);
    const success = await onDelete(initialData.id);
    setIsDeleting(false);

    if (success) {
      onClose();
    }
  }, [initialData, onDelete, onClose]);

  // Chip component for additional options
  const OptionChip = ({
    icon,
    label,
    active,
    onPress,
  }: {
    icon: string;
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <AnimatedPressable onPress={onPress} haptic="light" pressScale={0.95}>
      <Box
        flexDirection="row"
        alignItems="center"
        paddingX="md"
        paddingY="sm"
        backgroundColor={active ? 'primaryLight' : 'surfaceSecondary'}
        borderRadius="full"
        gap="xs"
      >
        <Icon name={icon as any} size="xs" color={active ? 'primary' : 'textSecondary'} />
        <Text
          variant="labelSmall"
          color={active ? 'primary' : 'textSecondary'}
          weight={active ? 'semibold' : 'regular'}
        >
          {label}
        </Text>
      </Box>
    </AnimatedPressable>
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      scrollable
      dismissOnBackdrop={false}
    >
      <VStack spacing="md">
        {/* Header with close and save */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <AnimatedPressable onPress={onClose} haptic="light" pressScale={0.9}>
            <Icon name="close" size="md" color="textSecondary" />
          </AnimatedPressable>
          <AnimatedPressable
            onPress={handleSubmit}
            haptic="light"
            pressScale={0.95}
            disabled={!title.trim() || isSubmitting}
          >
            <Box
              paddingX="lg"
              paddingY="sm"
              backgroundColor={title.trim() ? 'surfaceSecondary' : 'transparent'}
              borderRadius="full"
            >
              <Text
                variant="bodyMedium"
                color={title.trim() ? 'textPrimary' : 'textTertiary'}
                weight="semibold"
              >
                Salva
              </Text>
            </Box>
          </AnimatedPressable>
        </Box>

        {/* Title input - large, prominent */}
        <Input
          placeholder="Titolo"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
          size="lg"
          variant="ghost"
          style={{ fontSize: typography.headingMedium.fontSize, fontWeight: '600' }}
        />

        {/* All Day Toggle */}
        <AnimatedPressable onPress={toggleAllDay} haptic="selection" pressScale={0.98}>
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingY="md"
            borderBottomWidth={1}
            borderColor="border"
          >
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Icon name="calendar" size="sm" color="textSecondary" />
              <Text variant="bodyMedium">Tutto il giorno</Text>
            </Box>
            <Box
              width={sizes.toggle.width}
              height={sizes.toggle.height}
              borderRadius="full"
              backgroundColor={allDay ? 'primary' : 'surfaceSecondary'}
              justifyContent="center"
              paddingX="xs"
            >
              <Box
                width={sizes.toggle.thumb}
                height={sizes.toggle.thumb}
                borderRadius="full"
                backgroundColor="surface"
                style={{ alignSelf: allDay ? 'flex-end' : 'flex-start' }}
              />
            </Box>
          </Box>
        </AnimatedPressable>

        {/* Start Date/Time */}
        <Box flexDirection="row" alignItems="center" paddingY="sm" gap="md">
          <Text variant="bodyMedium" color="textSecondary" style={{ width: 50 }}>
            Inizio
          </Text>
          <AnimatedPressable
            onPress={() => setShowStartDatePicker(true)}
            haptic="light"
            pressScale={0.98}
            style={{ flex: 1 }}
          >
            <Box
              padding="sm"
              backgroundColor="surfaceSecondary"
              borderRadius="md"
              alignItems="center"
            >
              <Text variant="bodyMedium">{formatDate(startDateTime)}</Text>
            </Box>
          </AnimatedPressable>
          {!allDay && (
            <AnimatedPressable
              onPress={() => setShowStartTimePicker(true)}
              haptic="light"
              pressScale={0.98}
            >
              <Box
                padding="sm"
                backgroundColor="surfaceSecondary"
                borderRadius="md"
                minWidth={70}
                alignItems="center"
              >
                <Text variant="bodyMedium">{formatTimeDisplay(startDateTime)}</Text>
              </Box>
            </AnimatedPressable>
          )}
        </Box>

        {/* End Date/Time */}
        <Box flexDirection="row" alignItems="center" paddingY="sm" gap="md">
          <Text variant="bodyMedium" color="textSecondary" style={{ width: 50 }}>
            Fine
          </Text>
          <AnimatedPressable
            onPress={() => setShowEndDatePicker(true)}
            haptic="light"
            pressScale={0.98}
            style={{ flex: 1 }}
          >
            <Box
              padding="sm"
              backgroundColor="surfaceSecondary"
              borderRadius="md"
              alignItems="center"
            >
              <Text variant="bodyMedium">{formatDate(endDateTime)}</Text>
            </Box>
          </AnimatedPressable>
          {!allDay && (
            <AnimatedPressable
              onPress={() => setShowEndTimePicker(true)}
              haptic="light"
              pressScale={0.98}
            >
              <Box
                padding="sm"
                backgroundColor="surfaceSecondary"
                borderRadius="md"
                minWidth={70}
                alignItems="center"
              >
                <Text variant="bodyMedium">{formatTimeDisplay(endDateTime)}</Text>
              </Box>
            </AnimatedPressable>
          )}
        </Box>

        {/* Floating event toggle */}
        <AnimatedPressable onPress={toggleFloating} haptic="selection" pressScale={0.98}>
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingY="md"
            borderBottomWidth={1}
            borderColor="border"
          >
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Icon name="pin" size="sm" color="textSecondary" />
              <Text variant="bodyMedium">Conserva senza data</Text>
            </Box>
            <Box
              width={sizes.toggle.width}
              height={sizes.toggle.height}
              borderRadius="full"
              backgroundColor={isFloating ? 'primary' : 'surfaceSecondary'}
              justifyContent="center"
              paddingX="xs"
            >
              <Box
                width={sizes.toggle.thumb}
                height={sizes.toggle.thumb}
                borderRadius="full"
                backgroundColor="surface"
                style={{ alignSelf: isFloating ? 'flex-end' : 'flex-start' }}
              />
            </Box>
          </Box>
        </AnimatedPressable>

        {/* Space selector */}
        <Box paddingY="sm">
          <EventSpaceSelector value={spaceId} onChange={setSpaceId} />
        </Box>

        {/* Color picker row */}
        <Box paddingY="sm">
          <Box flexDirection="row" gap="sm" flexWrap="wrap" justifyContent="center">
            {colorOptions.map((c) => (
              <AnimatedPressable
                key={c}
                onPress={() => setColor(c)}
                haptic="selection"
                pressScale={0.9}
              >
                <Box
                  width={sizes.colorPicker}
                  height={sizes.colorPicker}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={color === c ? 3 : 0}
                  borderColor="primary"
                  style={{ backgroundColor: eventColors[c] }}
                >
                  {color === c && (
                    <Icon name="check" size="xs" color="onPrimary" />
                  )}
                </Box>
              </AnimatedPressable>
            ))}
          </Box>
        </Box>

        {/* Reminders */}
        <Box paddingY="sm">
          <ReminderPicker value={reminders} onChange={setReminders} />
        </Box>

        {/* Additional options chips */}
        <Box gap="sm" paddingY="sm">
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Icon name="add" size="sm" color="textSecondary" />
            <Text variant="labelMedium" color="textSecondary">
              Aggiungi
            </Text>
          </Box>
          <Box flexDirection="row" flexWrap="wrap" gap="sm">
            <OptionChip
              icon="sync"
              label="Ripeti"
              active={!!recurrence}
              onPress={() => {
                if (!recurrence) {
                  setRecurrence({ frequency: 'weekly', interval: 1 });
                }
              }}
            />
            <OptionChip
              icon="location"
              label="Posizione"
              active={showLocation}
              onPress={() => setShowLocation(!showLocation)}
            />
            <OptionChip
              icon="link"
              label="URL"
              active={showUrl}
              onPress={() => setShowUrl(!showUrl)}
            />
            <OptionChip
              icon="document"
              label="Nota"
              active={showNotes}
              onPress={() => setShowNotes(!showNotes)}
            />
            <OptionChip
              icon="checkboxOutline"
              label="Checklist"
              active={showChecklist}
              onPress={() => setShowChecklist(!showChecklist)}
            />
          </Box>
        </Box>

        {/* Recurrence picker (if enabled) */}
        {recurrence && (
          <Box paddingY="sm">
            <RecurrencePicker value={recurrence} onChange={setRecurrence} />
          </Box>
        )}

        {/* Location input */}
        {showLocation && (
          <Box paddingY="sm">
            <Input
              label="Posizione"
              placeholder="Inserisci indirizzo..."
              value={location}
              onChangeText={setLocation}
              leftIcon={<Icon name="location" size="sm" color="textSecondary" />}
            />
          </Box>
        )}

        {/* URL input */}
        {showUrl && (
          <Box paddingY="sm">
            <Input
              label="URL"
              placeholder="https://..."
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
              leftIcon={<Icon name="link" size="sm" color="textSecondary" />}
            />
          </Box>
        )}

        {/* Notes */}
        {showNotes && (
          <Box paddingY="sm" gap="xs">
            <Text variant="labelMedium" color="textSecondary">
              Note
            </Text>
            <TextArea
              placeholder="Aggiungi note..."
              value={notes}
              onChangeText={setNotes}
              numberOfLines={3}
            />
          </Box>
        )}

        {/* Checklist */}
        {showChecklist && (
          <Box paddingY="sm">
            <ChecklistEditor value={checklist} onChange={setChecklist} />
          </Box>
        )}

        {/* Description */}
        <Box paddingY="sm" gap="xs">
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

        {/* Error message */}
        {errors.general && (
          <Box
            flexDirection="row"
            alignItems="center"
            padding="sm"
            backgroundColor="errorLight"
            borderRadius="md"
            gap="sm"
          >
            <Icon name="error" size="sm" color="error" />
            <Text color="error" variant="bodySmall">
              {errors.general}
            </Text>
          </Box>
        )}

        {/* Delete button (only when editing) */}
        {isEditing && (
          <Button
            title="Elimina evento"
            variant="secondary"
            onPress={handleDelete}
            loading={isDeleting}
            accessibilityLabel="Elimina evento"
            fullWidth
            leftIcon={<Icon name="trash" size="sm" color="error" />}
            style={{ marginTop: spacing.sm }}
          />
        )}

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
      </VStack>
    </Modal>
  );
}
