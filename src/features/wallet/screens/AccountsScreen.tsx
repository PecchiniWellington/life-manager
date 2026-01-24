/**
 * AccountsScreen
 * Gestione conti e saldi
 */

import React, { useState, useCallback } from 'react';
import { FlatList, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { Screen, Box, Text, Button, Icon, GlassCard, Input } from '@shared/ui';
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

const colorOptions = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6',
  '#AF52DE', '#FF2D55', '#00C7BE', '#FFD60A', '#8E8E93',
];

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

  const renderAccount = useCallback(({ item }: { item: Account }) => (
    <Box marginBottom="sm">
      <AccountCard
        account={item}
        onPress={() => openEditForm(item)}
        onLongPress={() => handleDelete(item)}
      />
    </Box>
  ), [openEditForm, handleDelete]);

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
      <GlassCard variant="solid" padding="lg" style={styles.totalCard}>
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
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={renderAccount}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Box alignItems="center" padding="xl">
            <Text variant="bodyMedium" color="textSecondary">
              Nessun conto creato
            </Text>
            <Text variant="caption" color="textSecondary" style={styles.emptyHint}>
              Crea il tuo primo conto per iniziare
            </Text>
          </Box>
        }
      />

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent
        onRequestClose={handleCloseForm}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseForm}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.background }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Box padding="lg" gap="lg">
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text variant="headingSmall" weight="bold">
                  {editingAccount ? 'Modifica conto' : 'Nuovo conto'}
                </Text>
                <Button
                  title=""
                  variant="ghost"
                  size="sm"
                  onPress={handleCloseForm}
                  leftIcon={<Icon name="close" size="md" color="textSecondary" />}
                />
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
                    <Pressable
                      key={option.type}
                      onPress={() => setType(option.type)}
                      style={[
                        styles.typeOption,
                        type === option.type && { borderColor: colors.primary, borderWidth: 2 },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>{option.icon}</Text>
                      <Text variant="caption">{option.label}</Text>
                    </Pressable>
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
                    <Pressable
                      key={c}
                      onPress={() => setColor(c)}
                      style={[
                        styles.colorOption,
                        { backgroundColor: c },
                        color === c && styles.colorSelected,
                      ]}
                    />
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
              <Pressable
                onPress={() => setIsDefault(!isDefault)}
                style={styles.toggleRow}
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
              </Pressable>

              {/* Submit */}
              <Button
                title={editingAccount ? 'Salva modifiche' : 'Crea conto'}
                onPress={handleSubmit}
                loading={loading}
              />
            </Box>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyHint: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  typeOption: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
