/**
 * AccountsScreen
 * Gestione conti e saldi
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
  accountColors,
} from '@shared/ui';
import { ScreenTitle } from '@shared/ui/molecules';
import { useTheme } from '@shared/ui/theme';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  selectAllAccounts,
  selectAccountsLoading,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../store';
import { Account, AccountType, CreateAccountPayload, UpdateAccountPayload } from '../domain/types';
import { AccountCard } from '../components';
import { useNavigation } from '@react-navigation/native';

const accountTypeOptions: { type: AccountType; label: string; icon: string }[] = [
  { type: 'cash', label: 'Contanti', icon: '💵' },
  { type: 'bank', label: 'Conto bancario', icon: '🏦' },
  { type: 'card', label: 'Carta', icon: '💳' },
  { type: 'savings', label: 'Risparmio', icon: '🐷' },
  { type: 'investment', label: 'Investimento', icon: '📈' },
];

// Use centralized account colors from tokens
const colorOptions = [...accountColors];

export function AccountsScreen(): JSX.Element {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const accounts = useAppSelector(selectAllAccounts);
  const loading = useAppSelector(selectAccountsLoading);

  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [initialBalance, setInitialBalance] = useState('0');
  const [color, setColor] = useState(colorOptions[0]);
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = useCallback(() => {
    setName('');
    setType('bank');
    setInitialBalance('0');
    setColor(colorOptions[0]);
    setIsDefault(false);
    setEditingAccount(null);
  }, []);

  const openCreateForm = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const openEditForm = useCallback((account: Account) => {
    setEditingAccount(account);
    setName(account.name);
    setType(account.type);
    setInitialBalance(account.initialBalance.toString());
    setColor(account.color);
    setIsDefault(account.isDefault);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per il conto');
      return;
    }

    const selectedOption = accountTypeOptions.find(o => o.type === type);

    if (editingAccount) {
      const payload: UpdateAccountPayload = {
        id: editingAccount.id,
        name: name.trim(),
        type,
        icon: selectedOption?.icon || '💳',
        color,
        initialBalance: parseFloat(initialBalance) || 0,
        isDefault,
      };
      await dispatch(updateAccount(payload));
    } else {
      const payload: CreateAccountPayload = {
        name: name.trim(),
        type,
        icon: selectedOption?.icon || '💳',
        color,
        initialBalance: parseFloat(initialBalance) || 0,
        isDefault,
      };
      await dispatch(createAccount(payload));
    }

    handleCloseForm();
  }, [name, type, color, initialBalance, isDefault, editingAccount, dispatch, handleCloseForm]);

  const handleDelete = useCallback((account: Account) => {
    Alert.alert(
      'Elimina conto',
      `Sei sicuro di voler eliminare "${account.name}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => dispatch(deleteAccount(account.id)),
        },
      ]
    );
  }, [dispatch]);

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.initialBalance, 0);

  return (
    <Screen paddingHorizontal="lg">
      <ScreenTitle
        title="Conti"
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

      {/* Total balance card */}
      <GlassCard variant="solid" padding="lg" style={{ marginBottom: 16 }}>
        <Box alignItems="center" gap="xs">
          <Text variant="bodySmall" color="textSecondary">
            Saldo totale
          </Text>
          <Text variant="headingLarge" weight="bold" color="primary">
            €{totalBalance.toFixed(2)}
          </Text>
          <Text variant="caption" color="textSecondary">
            {accounts.length} {accounts.length === 1 ? 'conto' : 'conti'}
          </Text>
        </Box>
      </GlassCard>

      {/* Accounts list */}
      <VirtualList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Box marginBottom="sm">
            <AccountCard
              account={item}
              onPress={() => openEditForm(item)}
              onLongPress={() => handleDelete(item)}
            />
          </Box>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Box alignItems="center" padding="xl">
            <Text variant="bodyMedium" color="textSecondary">
              Nessun conto creato
            </Text>
            <Text variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
              Crea il tuo primo conto per iniziare
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
                {editingAccount ? 'Modifica conto' : 'Nuovo conto'}
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
              placeholder="Es. Conto principale"
            />

            {/* Type */}
            <Box gap="xs">
              <Text variant="caption" color="textSecondary">
                Tipo
              </Text>
              <Box flexDirection="row" flexWrap="wrap" gap="xs">
                {accountTypeOptions.map((option) => (
                  <AnimatedPressable
                    key={option.type}
                    onPress={() => setType(option.type)}
                    haptic="selection"
                    pressScale={0.95}
                  >
                    <Box
                      padding="sm"
                      borderRadius="md"
                      alignItems="center"
                      gap="xxs"
                      borderWidth={2}
                      style={{
                        borderColor: type === option.type ? colors.primary : 'transparent',
                        minWidth: 80,
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{option.icon}</Text>
                      <Text variant="caption">{option.label}</Text>
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

            {/* Initial Balance */}
            <Input
              label="Saldo iniziale"
              value={initialBalance}
              onChangeText={setInitialBalance}
              keyboardType="numeric"
              placeholder="0.00"
            />

            {/* Default toggle */}
            <AnimatedPressable
              onPress={() => setIsDefault(!isDefault)}
              haptic="selection"
            >
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                paddingVertical="sm"
              >
                <Text variant="bodyMedium">Conto predefinito</Text>
                <Box
                  width={48}
                  height={28}
                  borderRadius="full"
                  justifyContent="center"
                  padding="xxs"
                  style={{
                    backgroundColor: isDefault ? colors.primary : colors.border,
                  }}
                >
                  <Box
                    width={24}
                    height={24}
                    borderRadius="full"
                    backgroundColor="background"
                    style={{
                      alignSelf: isDefault ? 'flex-end' : 'flex-start',
                    }}
                  />
                </Box>
              </Box>
            </AnimatedPressable>

            {/* Submit */}
            <Button
              title={editingAccount ? 'Salva modifiche' : 'Crea conto'}
              onPress={handleSubmit}
              loading={loading}
            />
          </Box>
        </ScrollContainer>
      </BottomSheetModal>
    </Screen>
  );
}
