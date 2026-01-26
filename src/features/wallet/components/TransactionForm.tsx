/**
 * TransactionForm Component - NO TAG NATIVI
 * MOLECULE: Usa solo atoms del design system
 * Features: BottomSheet, DateTimePicker, AnimatedPressable
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  Input,
  Text,
  Icon,
  AnimatedPressable,
  DateTimePicker,
  type IconName,
} from '@shared/ui';
import { BottomSheet } from '@shared/ui/molecules';
import {
  Transaction,
  CreateTransactionPayload,
  ExpenseCategory,
  categoryLabels,
  categoryIcons,
} from '../domain/types';
import { sizes } from '@shared/ui/tokens';

interface TransactionFormProps {
  /** Se il form è visibile */
  visible: boolean;
  /** Callback chiusura */
  onClose: () => void;
  /** Callback submit */
  onSubmit: (payload: CreateTransactionPayload) => Promise<boolean>;
  /** Dati iniziali per edit */
  initialData?: Transaction | null;
}

const categoryList: ExpenseCategory[] = [
  'food',
  'transport',
  'shopping',
  'entertainment',
  'health',
  'bills',
  'other',
];

export function TransactionForm({
  visible,
  onClose,
  onSubmit,
  initialData,
}: TransactionFormProps): JSX.Element {
  const isEditing = !!initialData;

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setAmount(initialData.amount.toString());
        setCategory(initialData.category);
        setSelectedDate(new Date(initialData.date));
        setNote(initialData.note);
      } else {
        setAmount('');
        setCategory('other');
        setSelectedDate(new Date());
        setNote('');
      }
      setError(null);
      setShowDatePicker(false);
    }
  }, [visible, initialData]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);

    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Inserisci un importo valido');
      setIsSubmitting(false);
      return;
    }

    const payload: CreateTransactionPayload = {
      amount: numAmount,
      category,
      date: selectedDate.toISOString(),
      note: note.trim(),
      type: 'expense',
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      setError('Si è verificato un errore');
    }
  }, [amount, category, selectedDate, note, onSubmit, onClose]);

  return (
    <BottomSheet
      isOpen={visible}
      onClose={onClose}
      snapPoints={['85%']}
      scrollable
    >
      <VStack spacing="lg">
        {/* Amount - Large input */}
        <Box gap="xs">
          <Text variant="labelMedium" color="textSecondary">
            Importo
          </Text>
          <Box
            flexDirection="row"
            alignItems="center"
            padding="md"
            backgroundColor="surfaceSecondary"
            borderRadius="card"
            gap="sm"
          >
            <Text variant="headingLarge" color="textSecondary">
              €
            </Text>
            <Box flex={1}>
              <Input
                placeholder="0,00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                autoFocus
                size="lg"
              />
            </Box>
          </Box>
        </Box>

        {/* Category - Grid of icons */}
        <Box gap="sm">
          <Text variant="labelMedium" color="textSecondary">
            Categoria
          </Text>
          <Box flexDirection="row" flexWrap="wrap" gap="sm">
            {categoryList.map((cat) => {
              const isSelected = category === cat;
              return (
                <AnimatedPressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  haptic="selection"
                  pressScale={0.95}
                  style={{ width: '30%' }}
                >
                  <Box
                    padding="md"
                    backgroundColor={isSelected ? 'primaryLight' : 'surfaceSecondary'}
                    borderRadius="card"
                    alignItems="center"
                    gap="xs"
                    borderWidth={isSelected ? 2 : 0}
                    borderColor="primary"
                  >
                    <Box
                      width={sizes.iconContainer.md}
                      height={sizes.iconContainer.md}
                      borderRadius="full"
                      backgroundColor={isSelected ? 'primary' : 'surface'}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon
                        name={categoryIcons[cat] as IconName}
                        size="md"
                        color={isSelected ? 'onPrimary' : 'textSecondary'}
                      />
                    </Box>
                    <Text
                      variant="caption"
                      color={isSelected ? 'primary' : 'textSecondary'}
                      weight={isSelected ? 'semibold' : 'regular'}
                    >
                      {categoryLabels[cat]}
                    </Text>
                  </Box>
                </AnimatedPressable>
              );
            })}
          </Box>
        </Box>

        {/* Date */}
        <Box gap="xs">
          <Text variant="labelMedium" color="textSecondary">
            Data
          </Text>
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
              <Icon name="calendar" size="sm" color="primary" />
              <Text variant="bodyMedium">{formatDate(selectedDate)}</Text>
            </Box>
          </AnimatedPressable>

          <DateTimePicker
            visible={showDatePicker}
            value={selectedDate}
            mode="date"
            onChange={handleDateChange}
            onCancel={() => setShowDatePicker(false)}
            maximumDate={new Date()}
          />
        </Box>

        {/* Note */}
        <Input
          label="Nota"
          placeholder="Descrizione opzionale..."
          value={note}
          onChangeText={setNote}
          size="md"
        />

        {/* Error */}
        {error && (
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
              {error}
            </Text>
          </Box>
        )}

        {/* Submit button */}
        <Box marginTop="md">
          <AnimatedPressable
            onPress={handleSubmit}
            haptic="light"
            pressScale={0.98}
            disabled={!amount || isSubmitting}
          >
            <Box
              padding="md"
              backgroundColor={amount ? 'primary' : 'surfaceSecondary'}
              borderRadius="lg"
              alignItems="center"
              opacity={!amount || isSubmitting ? 0.5 : 1}
            >
              <Text
                variant="bodyMedium"
                color={amount ? 'onPrimary' : 'textTertiary'}
                weight="semibold"
              >
                {isSubmitting ? 'Caricamento...' : isEditing ? 'Salva' : 'Aggiungi'}
              </Text>
            </Box>
          </AnimatedPressable>
        </Box>
      </VStack>
    </BottomSheet>
  );
}
