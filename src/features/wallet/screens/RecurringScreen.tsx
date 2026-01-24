/**
 * RecurringScreen
 * Gestione transazioni ricorrenti
 * SCREEN: Usa solo atoms e molecules del design system
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import {
  Screen,
  Box,
  Text,
  Button,
  Icon,
  GlassCard,
  Input,
  VirtualList,
  BottomSheetModal,
  AnimatedPressable,
  ScrollContainer,
  appleColors,
} from '@shared/ui';
import { ScreenTitle } from '@shared/ui/molecules';
import { useTheme } from '@shared/ui/theme';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  selectAllRecurring,
  selectRecurringLoading,
  selectMonthlyRecurringTotal,
  createRecurring,
  updateRecurring,
  pauseRecurring,
  resumeRecurring,
  deleteRecurring,
  selectAllCategories,
  selectAllAccounts,
} from '../store';
import {
  RecurringTransaction,
  CreateRecurringPayload,
  UpdateRecurringPayload,
  RecurrenceFrequency,
  TransactionType,
} from '../domain/types';
import { RecurringItem, CategoryPicker, AccountSelector } from '../components';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

const frequencyOptions: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'daily', label: 'Giornaliero' },
  { value: 'weekly', label: 'Settimanale' },
  { value: 'biweekly', label: 'Bisettimanale' },
  { value: 'monthly', label: 'Mensile' },
  { value: 'yearly', label: 'Annuale' },
];

export function RecurringScreen(): JSX.Element {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const recurring = useAppSelector(selectAllRecurring);
  const loading = useAppSelector(selectRecurringLoading);
  const monthlyTotal = useAppSelector(selectMonthlyRecurringTotal);
  const categories = useAppSelector(selectAllCategories);
  const accounts = useAppSelector(selectAllAccounts);

  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);

  // Form state
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');

  const filteredCategories = useMemo(
    () => categories.filter(c => c.type === type),
    [categories, type]
  );

  const resetForm = useCallback(() => {
    setNote('');
    setAmount('');
    setType('expense');
    setFrequency('monthly');
    setSelectedCategoryId(null);
    setSelectedAccountId(accounts.find(a => a.isDefault)?.id || accounts[0]?.id || null);
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEditingRecurring(null);
  }, [accounts]);

  const openCreateForm = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const openEditForm = useCallback((item: RecurringTransaction) => {
    setEditingRecurring(item);
    setNote(item.note);
    setAmount(item.amount.toString());
    setType(item.type);
    setFrequency(item.frequency);
    setSelectedCategoryId(item.categoryId || null);
    setSelectedAccountId(item.accountId);
    setStartDate(item.startDate);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return;
    }

    if (!selectedAccountId) {
      Alert.alert('Errore', 'Seleziona un conto');
      return;
    }

    if (editingRecurring) {
      const payload: UpdateRecurringPayload = {
        id: editingRecurring.id,
        accountId: selectedAccountId,
        categoryId: selectedCategoryId || undefined,
        category: categories.find(c => c.id === selectedCategoryId)?.name || 'Altro',
        amount: amountValue,
        type,
        note: note.trim(),
        frequency,
        startDate,
      };
      await dispatch(updateRecurring(payload));
    } else {
      const payload: CreateRecurringPayload = {
        accountId: selectedAccountId,
        categoryId: selectedCategoryId || undefined,
        category: categories.find(c => c.id === selectedCategoryId)?.name || 'Altro',
        amount: amountValue,
        type,
        note: note.trim(),
        frequency,
        startDate,
      };
      await dispatch(createRecurring(payload));
    }

    handleCloseForm();
  }, [amount, selectedAccountId, selectedCategoryId, categories, type, note, frequency, startDate, editingRecurring, dispatch, handleCloseForm]);

  const handleToggle = useCallback(async (item: RecurringTransaction) => {
    if (item.isActive) {
      await dispatch(pauseRecurring(item.id));
    } else {
      await dispatch(resumeRecurring(item.id));
    }
  }, [dispatch]);

  const handleDelete = useCallback((item: RecurringTransaction) => {
    Alert.alert(
      'Elimina ricorrente',
      `Sei sicuro di voler eliminare questa transazione ricorrente?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => dispatch(deleteRecurring(item.id)),
        },
      ]
    );
  }, [dispatch]);

  const handleItemPress = useCallback((item: RecurringTransaction) => {
    Alert.alert(
      item.note || 'Transazione ricorrente',
      `${item.isActive ? 'Attiva' : 'In pausa'} - €${item.amount.toFixed(2)} ${frequencyOptions.find(f => f.value === item.frequency)?.label}`,
      [
        { text: 'Modifica', onPress: () => openEditForm(item) },
        {
          text: item.isActive ? 'Metti in pausa' : 'Riattiva',
          onPress: () => handleToggle(item),
        },
        { text: 'Elimina', onPress: () => handleDelete(item), style: 'destructive' },
        { text: 'Chiudi', style: 'cancel' },
      ]
    );
  }, [openEditForm, handleToggle, handleDelete]);

  return (
    <Screen paddingHorizontal="lg">
      <ScreenTitle
        title="Ricorrenti"
        leftAction={
          <Button
            title=""
            variant="ghost"
            size="sm"
            onPress={() => navigation.goBack()}
            leftIcon={<Icon name="chevronLeft" size="md" color="textPrimary" />}
          />
        }
        rightAction={
          <Button
            title="Nuovo"
            size="sm"
            onPress={openCreateForm}
            leftIcon={<Icon name="add" size="sm" color="onPrimary" />}
          />
        }
      />

      {/* Summary card */}
      <GlassCard variant="solid" padding="lg" style={{ marginBottom: 16 }}>
        <Box flexDirection="row" justifyContent="space-around">
          <Box alignItems="center">
            <Text variant="caption" color="textSecondary">
              Spese mensili
            </Text>
            <Text variant="headingSmall" weight="bold" color="error">
              -€{monthlyTotal.expenses.toFixed(0)}
            </Text>
          </Box>
          <Box alignItems="center">
            <Text variant="caption" color="textSecondary">
              Entrate mensili
            </Text>
            <Text variant="headingSmall" weight="bold" color="success">
              +€{monthlyTotal.income.toFixed(0)}
            </Text>
          </Box>
          <Box alignItems="center">
            <Text variant="caption" color="textSecondary">
              Netto
            </Text>
            <Text
              variant="headingSmall"
              weight="bold"
              color={monthlyTotal.income - monthlyTotal.expenses >= 0 ? 'success' : 'error'}
            >
              {monthlyTotal.income - monthlyTotal.expenses >= 0 ? '+' : ''}
              €{(monthlyTotal.income - monthlyTotal.expenses).toFixed(0)}
            </Text>
          </Box>
        </Box>
      </GlassCard>

      <VirtualList
        data={recurring}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const category = categories.find(c => c.id === item.categoryId);
          const account = accounts.find(a => a.id === item.accountId);

          return (
            <Box marginBottom="sm">
              <RecurringItem
                recurring={item}
                category={category}
                account={account}
                onPress={() => handleItemPress(item)}
              />
            </Box>
          );
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Box alignItems="center" padding="xl">
            <Text style={{ fontSize: 48 }}>🔄</Text>
            <Text variant="bodyMedium" color="textSecondary" style={{ marginTop: 12, marginBottom: 4 }}>
              Nessuna transazione ricorrente
            </Text>
            <Text variant="caption" color="textSecondary" align="center">
              Aggiungi abbonamenti, bollette e altre spese fisse per tracciarle automaticamente.
            </Text>
          </Box>
        }
      />

      {/* Form Modal */}
      <BottomSheetModal
        visible={showForm}
        onClose={handleCloseForm}
        showHandle
        maxHeight="90%"
      >
        <ScrollContainer showsVerticalScrollIndicator={false}>
          <Box padding="lg" gap="lg">
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text variant="headingSmall" weight="bold">
                {editingRecurring ? 'Modifica ricorrente' : 'Nuova ricorrente'}
              </Text>
              <AnimatedPressable onPress={handleCloseForm} haptic="light">
                <Icon name="close" size="md" color="textSecondary" />
              </AnimatedPressable>
            </Box>

            {/* Type toggle */}
            <Box flexDirection="row" gap="sm">
              <AnimatedPressable
                onPress={() => setType('expense')}
                haptic="selection"
                pressScale={0.95}
                style={{ flex: 1 }}
              >
                <Box
                  paddingVertical="sm"
                  paddingHorizontal="md"
                  borderRadius="md"
                  alignItems="center"
                  borderWidth={2}
                  style={{
                    backgroundColor: type === 'expense' ? `${appleColors.systemRed}20` : 'transparent',
                    borderColor: type === 'expense' ? appleColors.systemRed : 'transparent',
                  }}
                >
                  <Text
                    variant="bodyMedium"
                    weight="semibold"
                    color={type === 'expense' ? 'error' : 'textSecondary'}
                  >
                    Spesa
                  </Text>
                </Box>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={() => setType('income')}
                haptic="selection"
                pressScale={0.95}
                style={{ flex: 1 }}
              >
                <Box
                  paddingVertical="sm"
                  paddingHorizontal="md"
                  borderRadius="md"
                  alignItems="center"
                  borderWidth={2}
                  style={{
                    backgroundColor: type === 'income' ? `${appleColors.systemGreen}20` : 'transparent',
                    borderColor: type === 'income' ? appleColors.systemGreen : 'transparent',
                  }}
                >
                  <Text
                    variant="bodyMedium"
                    weight="semibold"
                    color={type === 'income' ? 'success' : 'textSecondary'}
                  >
                    Entrata
                  </Text>
                </Box>
              </AnimatedPressable>
            </Box>

            {/* Note */}
            <Input
              label="Descrizione"
              value={note}
              onChangeText={setNote}
              placeholder="Es. Netflix, Affitto, Stipendio"
            />

            {/* Amount */}
            <Input
              label="Importo (€)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
            />

            {/* Frequency */}
            <Box gap="xs">
              <Text variant="caption" color="textSecondary">
                Frequenza
              </Text>
              <Box flexDirection="row" flexWrap="wrap" gap="xs">
                {frequencyOptions.map((option) => (
                  <AnimatedPressable
                    key={option.value}
                    onPress={() => setFrequency(option.value)}
                    haptic="selection"
                    pressScale={0.95}
                  >
                    <Box
                      paddingVertical="xs"
                      paddingHorizontal="sm"
                      borderRadius="sm"
                      borderWidth={1}
                      style={{
                        borderColor: frequency === option.value ? colors.primary : 'rgba(0,0,0,0.1)',
                        backgroundColor: frequency === option.value ? `${colors.primary}20` : 'transparent',
                      }}
                    >
                      <Text
                        variant="caption"
                        color={frequency === option.value ? 'primary' : 'textSecondary'}
                      >
                        {option.label}
                      </Text>
                    </Box>
                  </AnimatedPressable>
                ))}
              </Box>
            </Box>

            {/* Account */}
            <AccountSelector
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onSelect={(account) => setSelectedAccountId(account.id)}
              label="Conto"
            />

            {/* Category */}
            <CategoryPicker
              categories={filteredCategories}
              selectedCategoryId={selectedCategoryId}
              onSelect={(category) => setSelectedCategoryId(category.id)}
              type={type}
              label="Categoria"
            />

            {/* Start Date */}
            <Input
              label="Data inizio"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
            />

            {/* Submit */}
            <Button
              title={editingRecurring ? 'Salva modifiche' : 'Crea ricorrente'}
              onPress={handleSubmit}
              loading={loading}
            />
          </Box>
        </ScrollContainer>
      </BottomSheetModal>
    </Screen>
  );
}
