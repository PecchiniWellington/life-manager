/**
 * WalletScreen - NO TAG NATIVI
 * FEATURE COMPONENT: con statistiche e lista transazioni
 */

import React, { useState, useCallback } from 'react';
import { Screen, Box, VStack, Button, Icon, Text, GlassCard } from '@shared/ui';
import { ScreenTitle, EmptyState } from '@shared/ui/molecules';
import {
  TransactionItem,
  TransactionForm,
} from '../components';
import { useWallet } from '../hooks';
import {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  categoryLabels,
  ExpenseCategory,
} from '../domain/types';
import { SemanticColorKey } from '@shared/ui';

// Mapping categorie a colori
const categoryColors: Record<ExpenseCategory, SemanticColorKey> = {
  food: 'warning',
  transport: 'info',
  entertainment: 'error',
  shopping: 'primary',
  health: 'success',
  bills: 'error',
  other: 'textSecondary',
};

export function WalletScreen(): JSX.Element {
  const {
    transactions,
    selectedMonth,
    totalExpenses,
    topCategories,
    createTransaction,
    updateTransaction,
    goToNextMonth,
    goToPrevMonth,
  } = useWallet();

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Stats
  const transactionCount = transactions.length;
  const avgTransaction = transactionCount > 0 ? totalExpenses / transactionCount : 0;

  const handleTransactionPress = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  }, []);

  const handleAddTransaction = useCallback(() => {
    setEditingTransaction(null);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingTransaction(null);
  }, []);

  const handleSubmit = useCallback(
    async (payload: CreateTransactionPayload) => {
      if (editingTransaction) {
        return updateTransaction({
          id: editingTransaction.id,
          ...payload,
        } as UpdateTransactionPayload);
      }
      return createTransaction(payload);
    },
    [editingTransaction, createTransaction, updateTransaction]
  );

  // Month navigation header
  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Screen scroll paddingHorizontal="lg">
      {/* Header */}
      <ScreenTitle
        title="Wallet"
        subtitle={monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        rightAction={
          <Button
            title="Nuova"
            size="sm"
            onPress={handleAddTransaction}
            accessibilityLabel="Aggiungi nuova spesa"
            leftIcon={<Icon name="add" size="sm" color="onPrimary" />}
          />
        }
      />

      {/* Month navigation */}
      <Box flexDirection="row" alignItems="center" justifyContent="center" gap="lg" marginBottom="lg">
        <Button
          title=""
          variant="secondary"
          size="sm"
          onPress={goToPrevMonth}
          accessibilityLabel="Mese precedente"
          leftIcon={<Icon name="chevronLeft" size="sm" color="textPrimary" />}
        />
        <Text variant="bodyMedium" weight="semibold">
          {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        </Text>
        <Button
          title=""
          variant="secondary"
          size="sm"
          onPress={goToNextMonth}
          accessibilityLabel="Mese successivo"
          leftIcon={<Icon name="chevronRight" size="sm" color="textPrimary" />}
        />
      </Box>

      <VStack spacing="lg">
        {/* Simple Stats Cards */}
        <Box flexDirection="row" gap="md">
          <Box flex={1}>
            <GlassCard variant="solid" padding="md">
              <Box gap="xs">
                <Box flexDirection="row" alignItems="center" gap="sm">
                  <Icon name="receipt" size="sm" color="primary" />
                  <Text variant="caption" color="textSecondary">Transazioni</Text>
                </Box>
                <Text variant="headingSmall" weight="bold">{transactionCount}</Text>
              </Box>
            </GlassCard>
          </Box>
          <Box flex={1}>
            <GlassCard variant="solid" padding="md">
              <Box gap="xs">
                <Box flexDirection="row" alignItems="center" gap="sm">
                  <Icon name="trending" size="sm" color="success" />
                  <Text variant="caption" color="textSecondary">Media</Text>
                </Box>
                <Text variant="headingSmall" weight="bold">€{avgTransaction.toFixed(2)}</Text>
              </Box>
            </GlassCard>
          </Box>
        </Box>

        {/* Total Expenses Card */}
        <GlassCard variant="solid" padding="lg">
          <Box gap="md">
            <Text variant="bodySmall" color="textSecondary">Speso questo mese</Text>
            <Text variant="headingLarge" weight="bold" color="primary">
              €{totalExpenses.toFixed(2)}
            </Text>

            {/* Categories breakdown */}
            {topCategories.length > 0 && (
              <Box gap="sm" marginTop="md">
                <Text variant="bodySmall" weight="semibold">Per categoria</Text>
                {topCategories.slice(0, 4).map((cat) => (
                  <Box key={cat.category} flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Box flexDirection="row" alignItems="center" gap="sm">
                      <Box
                        width={8}
                        height={8}
                        borderRadius="full"
                        backgroundColor={categoryColors[cat.category]}
                      />
                      <Text variant="bodySmall">{categoryLabels[cat.category]}</Text>
                    </Box>
                    <Text variant="bodySmall" weight="semibold">€{cat.amount.toFixed(2)}</Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </GlassCard>

        {/* Empty State or Transactions */}
        {transactions.length === 0 ? (
          <EmptyState
            icon="wallet"
            title="Nessuna spesa"
            description="Inizia a tracciare le tue spese"
            actionLabel="Aggiungi spesa"
            onAction={handleAddTransaction}
          />
        ) : (
          <Box>
            <Text variant="headingSmall" weight="semibold" style={{ marginBottom: 12 }}>
              Ultimi movimenti
            </Text>

            <VStack spacing="sm">
              {transactions.slice(0, 5).map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={handleTransactionPress}
                />
              ))}
            </VStack>

            {transactions.length > 5 && (
              <Box marginTop="md" alignItems="center">
                <Text variant="bodySmall" color="primary" weight="semibold">
                  Vedi tutti ({transactions.length})
                </Text>
              </Box>
            )}
          </Box>
        )}
      </VStack>

      {/* Form modal */}
      <TransactionForm
        visible={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingTransaction}
      />
    </Screen>
  );
}
