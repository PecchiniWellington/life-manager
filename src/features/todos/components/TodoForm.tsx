/**
 * TodoForm Component - NO TAG NATIVI
 * MOLECULE: Usa solo atoms del design system
 * Features: BottomSheet, DateTimePicker, SegmentedControl, AnimatedPressable
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  HStack,
  VStack,
  Button,
  Input,
  TextArea,
  Text,
  Chip,
  Icon,
  SegmentedControl,
  DateTimePicker,
  AnimatedPressable,
  type SegmentedControlOption,
} from '@shared/ui';
import { BottomSheet } from '@shared/ui/molecules';
import {
  Todo,
  CreateTodoPayload,
  TodoStatus,
  TodoPriority,
  statusLabels,
  priorityLabels,
} from '../domain/types';

interface TodoFormProps {
  /** Se il form è visibile */
  visible: boolean;
  /** Callback chiusura */
  onClose: () => void;
  /** Callback submit */
  onSubmit: (payload: CreateTodoPayload) => Promise<boolean>;
  /** Dati iniziali per edit */
  initialData?: Todo | null;
  /** Tag disponibili */
  availableTags: string[];
}

export function TodoForm({
  visible,
  onClose,
  onSubmit,
  initialData,
  availableTags,
}: TodoFormProps): JSX.Element {
  const isEditing = !!initialData;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TodoStatus>('todo');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Opzioni SegmentedControl
  const statusOptions: SegmentedControlOption<TodoStatus>[] = useMemo(
    () => [
      { value: 'todo', label: statusLabels.todo },
      { value: 'doing', label: statusLabels.doing },
      { value: 'done', label: statusLabels.done },
    ],
    []
  );

  const priorityOptions: SegmentedControlOption<TodoPriority>[] = useMemo(
    () => [
      { value: 'high', label: priorityLabels.high },
      { value: 'medium', label: priorityLabels.medium },
      { value: 'low', label: priorityLabels.low },
    ],
    []
  );

  // Initialize form
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setStatus(initialData.status);
        setPriority(initialData.priority);
        setDueDate(initialData.dueDate ? new Date(initialData.dueDate) : null);
        setTags(initialData.tags);
      } else {
        setTitle('');
        setDescription('');
        setStatus('todo');
        setPriority('medium');
        setDueDate(null);
        setTags([]);
      }
      setNewTag('');
      setError(null);
      setShowDatePicker(false);
    }
  }, [visible, initialData]);

  const handleAddTag = useCallback(() => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags((prev) => [...prev, trimmedTag]);
      setNewTag('');
    }
  }, [newTag, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  const handleSelectSuggestedTag = useCallback((tag: string) => {
    setTags((prev) => [...prev, tag]);
  }, []);

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setDueDate(date);
    }
    setShowDatePicker(false);
  }, []);

  const handleClearDate = useCallback(() => {
    setDueDate(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);

    const payload: CreateTodoPayload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate ? dueDate.toISOString() : null,
      tags,
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      setError('Si è verificato un errore');
    }
  }, [title, description, status, priority, dueDate, tags, onSubmit, onClose]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <BottomSheet
      isOpen={visible}
      onClose={onClose}
      title={isEditing ? 'Modifica todo' : 'Nuovo todo'}
      snapPoints={['90%']}
      scrollable
    >
      <VStack spacing="lg" paddingBottom="xl">
        {/* Title */}
        <Input
          label="Titolo"
          placeholder="Cosa devi fare?"
          value={title}
          onChangeText={setTitle}
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
            numberOfLines={3}
          />
        </Box>

        {/* Status - SegmentedControl */}
        <Box gap="xs">
          <Text variant="labelMedium" color="textSecondary">
            Stato
          </Text>
          <SegmentedControl
            options={statusOptions}
            value={status}
            onChange={setStatus}
            size="md"
          />
        </Box>

        {/* Priority - SegmentedControl */}
        <Box gap="xs">
          <Text variant="labelMedium" color="textSecondary">
            Priorità
          </Text>
          <SegmentedControl
            options={priorityOptions}
            value={priority}
            onChange={setPriority}
            size="md"
          />
        </Box>

        {/* Due date - DateTimePicker */}
        <Box gap="xs">
          <Text variant="labelMedium" color="textSecondary">
            Scadenza
          </Text>
          {dueDate ? (
            <HStack spacing="sm" alignItems="center">
              <AnimatedPressable
                onPress={() => setShowDatePicker(true)}
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
                  <Icon name="calendar" size="sm" color="primary" />
                  <Text variant="bodyMedium" color="textPrimary">
                    {formatDate(dueDate)}
                  </Text>
                </Box>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={handleClearDate}
                haptic="light"
                pressScale={0.9}
              >
                <Box
                  padding="md"
                  backgroundColor="surfaceSecondary"
                  borderRadius="input"
                >
                  <Icon name="close" size="sm" color="textSecondary" />
                </Box>
              </AnimatedPressable>
            </HStack>
          ) : (
            <AnimatedPressable
              onPress={() => setShowDatePicker(true)}
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
                <Icon name="calendar" size="sm" color="textTertiary" />
                <Text variant="bodyMedium" color="textTertiary">
                  Seleziona data
                </Text>
              </Box>
            </AnimatedPressable>
          )}

          {/* DateTimePicker nativo */}
          <DateTimePicker
            visible={showDatePicker}
            value={dueDate || new Date()}
            mode="date"
            onChange={handleDateChange}
            onCancel={() => setShowDatePicker(false)}
            minimumDate={new Date()}
          />
        </Box>

        {/* Tags */}
        <Box gap="sm">
          <Text variant="labelMedium" color="textSecondary">
            Tag
          </Text>

          {/* Selected tags */}
          {tags.length > 0 && (
            <Box flexDirection="row" gap="xs" flexWrap="wrap">
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onRemove={() => handleRemoveTag(tag)}
                  variant="soft"
                  intent="info"
                />
              ))}
            </Box>
          )}

          {/* Add tag input */}
          <HStack spacing="sm">
            <Box flex={1}>
              <Input
                placeholder="Nuovo tag..."
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={handleAddTag}
                size="md"
              />
            </Box>
            <Button
              title=""
              onPress={handleAddTag}
              size="md"
              disabled={!newTag.trim()}
              accessibilityLabel="Aggiungi tag"
              leftIcon={<Icon name="add" size="sm" color="onPrimary" />}
            />
          </HStack>

          {/* Suggested tags */}
          {availableTags.length > 0 && (
            <Box gap="xs">
              <Text variant="caption" color="textTertiary">
                Suggeriti
              </Text>
              <Box flexDirection="row" gap="xs" flexWrap="wrap">
                {availableTags
                  .filter((t) => !tags.includes(t))
                  .slice(0, 5)
                  .map((tag) => (
                    <AnimatedPressable
                      key={tag}
                      onPress={() => handleSelectSuggestedTag(tag)}
                      haptic="selection"
                      pressScale={0.95}
                    >
                      <Chip
                        label={tag}
                        variant="outlined"
                        size="sm"
                      />
                    </AnimatedPressable>
                  ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Error */}
        {error && (
          <Box
            flexDirection="row"
            alignItems="center"
            padding="sm"
            backgroundColor="error"
            borderRadius="md"
            gap="sm"
            opacity={0.9}
          >
            <Icon name="error" size="sm" color="onError" />
            <Text color="onError" variant="bodySmall">
              {error}
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
              accessibilityLabel={isEditing ? 'Salva todo' : 'Crea todo'}
              fullWidth
            />
          </Box>
        </HStack>
      </VStack>
    </BottomSheet>
  );
}
