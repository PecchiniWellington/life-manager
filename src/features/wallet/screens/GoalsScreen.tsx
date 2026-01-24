/**
 * GoalsScreen
 * Gestione obiettivi di risparmio
 * SCREEN: Usa solo atoms e molecules del design system
 */

import React, { useState, useCallback } from 'react';
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
} from '@shared/ui';
import { ScreenTitle } from '@shared/ui/molecules';
import { useTheme } from '@shared/ui/theme';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  selectActiveGoals,
  selectCompletedGoals,
  selectGoalsLoading,
  selectTotalSavings,
  createGoal,
  updateGoal,
  addToGoal,
  withdrawFromGoal,
  deleteGoal,
} from '../store';
import { SavingsGoal, CreateGoalPayload, UpdateGoalPayload } from '../domain/types';
import { GoalCard } from '../components';
import { useNavigation } from '@react-navigation/native';
import { format, addMonths } from 'date-fns';

const iconOptions = ['🎯', '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🏖️', '🎁', '💰', '🐷'];
const colorOptions = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6',
  '#AF52DE', '#FF2D55', '#00C7BE', '#FFD60A', '#8E8E93',
];

export function GoalsScreen(): JSX.Element {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const activeGoals = useAppSelector(selectActiveGoals);
  const completedGoals = useAppSelector(selectCompletedGoals);
  const loading = useAppSelector(selectGoalsLoading);
  const totalSavings = useAppSelector(selectTotalSavings);

  const [showForm, setShowForm] = useState(false);
  const [showAmountForm, setShowAmountForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [selectedGoalForAmount, setSelectedGoalForAmount] = useState<SavingsGoal | null>(null);
  const [amountAction, setAmountAction] = useState<'add' | 'withdraw'>('add');

  // Form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState(iconOptions[0]);
  const [color, setColor] = useState(colorOptions[0]);
  const [amount, setAmount] = useState('');

  const resetForm = useCallback(() => {
    setName('');
    setTargetAmount('');
    setDeadline('');
    setIcon(iconOptions[0]);
    setColor(colorOptions[0]);
    setEditingGoal(null);
  }, []);

  const openCreateForm = useCallback(() => {
    resetForm();
    // Default deadline to 6 months from now
    setDeadline(format(addMonths(new Date(), 6), 'yyyy-MM-dd'));
    setShowForm(true);
  }, [resetForm]);

  const openEditForm = useCallback((goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setDeadline(goal.deadline || '');
    setIcon(goal.icon);
    setColor(goal.color);
    setShowForm(true);
  }, []);

  const openAmountForm = useCallback((goal: SavingsGoal, action: 'add' | 'withdraw') => {
    setSelectedGoalForAmount(goal);
    setAmountAction(action);
    setAmount('');
    setShowAmountForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per l\'obiettivo');
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Errore', 'Inserisci un importo target valido');
      return;
    }

    if (editingGoal) {
      const payload: UpdateGoalPayload = {
        id: editingGoal.id,
        name: name.trim(),
        targetAmount: target,
        deadline: deadline || null,
        icon,
        color,
      };
      await dispatch(updateGoal(payload));
    } else {
      const payload: CreateGoalPayload = {
        name: name.trim(),
        targetAmount: target,
        deadline: deadline || undefined,
        icon,
        color,
      };
      await dispatch(createGoal(payload));
    }

    handleCloseForm();
  }, [name, targetAmount, deadline, icon, color, editingGoal, dispatch, handleCloseForm]);

  const handleAmountSubmit = useCallback(async () => {
    if (!selectedGoalForAmount) return;

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return;
    }

    if (amountAction === 'add') {
      await dispatch(addToGoal({ goalId: selectedGoalForAmount.id, amount: amountValue }));
    } else {
      if (amountValue > selectedGoalForAmount.currentAmount) {
        Alert.alert('Errore', 'Non puoi prelevare più di quanto risparmiato');
        return;
      }
      await dispatch(withdrawFromGoal({ goalId: selectedGoalForAmount.id, amount: amountValue }));
    }

    setShowAmountForm(false);
    setSelectedGoalForAmount(null);
    setAmount('');
  }, [amount, amountAction, selectedGoalForAmount, dispatch]);

  const handleDelete = useCallback((goal: SavingsGoal) => {
    Alert.alert(
      'Elimina obiettivo',
      `Sei sicuro di voler eliminare "${goal.name}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => dispatch(deleteGoal(goal.id)),
        },
      ]
    );
  }, [dispatch]);

  const handleGoalPress = useCallback((goal: SavingsGoal) => {
    Alert.alert(
      goal.name,
      `Risparmiato: €${goal.currentAmount.toFixed(2)} / €${goal.targetAmount.toFixed(2)}`,
      [
        { text: 'Modifica', onPress: () => openEditForm(goal) },
        { text: 'Aggiungi', onPress: () => openAmountForm(goal, 'add') },
        {
          text: 'Preleva',
          onPress: () => openAmountForm(goal, 'withdraw'),
          style: goal.currentAmount > 0 ? 'default' : 'cancel',
        },
        { text: 'Elimina', onPress: () => handleDelete(goal), style: 'destructive' },
        { text: 'Chiudi', style: 'cancel' },
      ]
    );
  }, [openEditForm, openAmountForm, handleDelete]);

  return (
    <Screen paddingHorizontal="lg">
      <ScreenTitle
        title="Obiettivi"
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

      {/* Total savings card */}
      <GlassCard variant="solid" padding="lg" style={{ marginBottom: 16 }}>
        <Box alignItems="center" gap="xs">
          <Text variant="bodySmall" color="textSecondary">
            Totale risparmiato
          </Text>
          <Text variant="headingLarge" weight="bold" color="success">
            €{totalSavings.toFixed(2)}
          </Text>
          <Text variant="caption" color="textSecondary">
            {activeGoals.length} obiettiv{activeGoals.length === 1 ? 'o attivo' : 'i attivi'}
          </Text>
        </Box>
      </GlassCard>

      <VirtualList
        data={[...activeGoals, ...completedGoals]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Box marginBottom="sm">
            <GoalCard goal={item} onPress={() => handleGoalPress(item)} />
          </Box>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          activeGoals.length > 0 && completedGoals.length > 0 ? (
            <Text
              variant="bodySmall"
              weight="semibold"
              color="textSecondary"
              style={{ marginBottom: 8, marginTop: 16 }}
            >
              Attivi
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <Box alignItems="center" padding="xl">
            <Text style={{ fontSize: 48 }}>🎯</Text>
            <Text variant="bodyMedium" color="textSecondary" style={{ marginTop: 12, marginBottom: 4 }}>
              Nessun obiettivo
            </Text>
            <Text variant="caption" color="textSecondary" align="center">
              Crea il tuo primo obiettivo di risparmio per iniziare a risparmiare!
            </Text>
          </Box>
        }
      />

      {/* Create/Edit Form Modal */}
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
                {editingGoal ? 'Modifica obiettivo' : 'Nuovo obiettivo'}
              </Text>
              <AnimatedPressable onPress={handleCloseForm} haptic="light">
                <Icon name="close" size="md" color="textSecondary" />
              </AnimatedPressable>
            </Box>

            {/* Name */}
            <Input
              label="Nome"
              value={name}
              onChangeText={setName}
              placeholder="Es. Vacanza estiva"
            />

            {/* Target Amount */}
            <Input
              label="Obiettivo (€)"
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="numeric"
              placeholder="1000.00"
            />

            {/* Deadline */}
            <Input
              label="Scadenza (opzionale)"
              value={deadline}
              onChangeText={setDeadline}
              placeholder="YYYY-MM-DD"
            />

            {/* Icon */}
            <Box gap="xs">
              <Text variant="caption" color="textSecondary">
                Icona
              </Text>
              <Box flexDirection="row" flexWrap="wrap" gap="sm">
                {iconOptions.map((i) => (
                  <AnimatedPressable
                    key={i}
                    onPress={() => setIcon(i)}
                    haptic="selection"
                    pressScale={0.9}
                  >
                    <Box
                      width={48}
                      height={48}
                      borderRadius="md"
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={2}
                      style={{
                        borderColor: icon === i ? colors.primary : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{i}</Text>
                    </Box>
                  </AnimatedPressable>
                ))}
              </Box>
            </Box>

            {/* Color */}
            <Box gap="xs">
              <Text variant="caption" color="textSecondary">
                Colore
              </Text>
              <Box flexDirection="row" flexWrap="wrap" gap="sm">
                {colorOptions.map((c) => (
                  <AnimatedPressable
                    key={c}
                    onPress={() => setColor(c)}
                    haptic="selection"
                    pressScale={0.9}
                  >
                    <Box
                      width={36}
                      height={36}
                      borderRadius="full"
                      style={{
                        backgroundColor: c,
                        borderWidth: color === c ? 3 : 0,
                        borderColor: 'white',
                        shadowColor: color === c ? '#000' : 'transparent',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: color === c ? 0.25 : 0,
                        shadowRadius: 4,
                        elevation: color === c ? 4 : 0,
                      }}
                    />
                  </AnimatedPressable>
                ))}
              </Box>
            </Box>

            {/* Submit */}
            <Button
              title={editingGoal ? 'Salva modifiche' : 'Crea obiettivo'}
              onPress={handleSubmit}
              loading={loading}
            />
          </Box>
        </ScrollContainer>
      </BottomSheetModal>

      {/* Add/Withdraw Amount Modal */}
      <BottomSheetModal
        visible={showAmountForm}
        onClose={() => setShowAmountForm(false)}
        showHandle
      >
        <Box padding="lg" gap="lg">
          <Text variant="headingSmall" weight="bold">
            {amountAction === 'add' ? 'Aggiungi risparmio' : 'Preleva'}
          </Text>

          {selectedGoalForAmount && (
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Box
                width={40}
                height={40}
                borderRadius="md"
                alignItems="center"
                justifyContent="center"
                style={{ backgroundColor: `${selectedGoalForAmount.color}20` }}
              >
                <Text style={{ fontSize: 20 }}>{selectedGoalForAmount.icon}</Text>
              </Box>
              <Box flex={1}>
                <Text variant="bodyMedium" weight="semibold">
                  {selectedGoalForAmount.name}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Attuale: €{selectedGoalForAmount.currentAmount.toFixed(2)}
                </Text>
              </Box>
            </Box>
          )}

          <Input
            label="Importo (€)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0.00"
          />

          <Box flexDirection="row" gap="sm">
            <Box flex={1}>
              <Button
                title="Annulla"
                variant="secondary"
                onPress={() => setShowAmountForm(false)}
              />
            </Box>
            <Box flex={1}>
              <Button
                title={amountAction === 'add' ? 'Aggiungi' : 'Preleva'}
                onPress={handleAmountSubmit}
                loading={loading}
              />
            </Box>
          </Box>
        </Box>
      </BottomSheetModal>
    </Screen>
  );
}
