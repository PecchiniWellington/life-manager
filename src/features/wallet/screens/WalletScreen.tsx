/**
 * WalletScreen - Modern Fintech UI
 * Design pulito e professionale con icone vettoriali
 */

import React, { useState, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Screen, Box, VStack, Button, Icon, Text, GlassCard, IconName } from '@shared/ui';
import { ScreenTitle, EmptyState } from '@shared/ui/molecules';
import {
  TransactionItem,
  TransactionForm,
  BudgetProgress,
  MiniGoalProgress,
  RecurringStats,
} from '../components';
import { useWallet } from '../hooks';
import { useAppSelector } from '@app/store/hooks';
import {
  selectAllAccounts,
  selectBudgetForMonth,
  selectActiveGoals,
  selectActiveRecurring,
} from '../store';
import {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  categoryLabels,
  ExpenseCategory,
} from '../domain/types';
import { SemanticColorKey } from '@shared/ui';
import { SpaceSelector, CreateSpaceModal, SpaceSettingsModal, PendingInvitesModal } from '@features/spaces';
import { Space } from '@features/spaces/domain/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WalletStackParamList } from '@app/navigation/types';
import { useTheme } from '@shared/ui/theme';

type WalletNavigation = NativeStackNavigationProp<WalletStackParamList, 'WalletMain'>;

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

// Mapping categorie a icone
const categoryIcons: Record<ExpenseCategory, IconName> = {
  food: 'food',
  transport: 'transport',
  entertainment: 'entertainment',
  shopping: 'shopping',
  health: 'health',
  bills: 'bills',
  other: 'other',
};

// Quick action buttons data - con icone invece di emoji
const quickActions: { key: keyof WalletStackParamList; icon: IconName; label: string }[] = [
  { key: 'Accounts', icon: 'creditCard', label: 'Conti' },
  { key: 'Budget', icon: 'pieChart', label: 'Budget' },
  { key: 'Goals', icon: 'target', label: 'Obiettivi' },
  { key: 'Recurring', icon: 'repeat', label: 'Ricorrenti' },
  { key: 'Categories', icon: 'layers', label: 'Categorie' },
  { key: 'Reports', icon: 'statsChart', label: 'Report' },
];

export function WalletScreen(): JSX.Element {
  const navigation = useNavigation<WalletNavigation>();
  const { colors } = useTheme();
  const {
    transactions,
    selectedMonth,
    totalExpenses,
    totalIncome,
    topCategories,
    createTransaction,
    updateTransaction,
    goToNextMonth,
    goToPrevMonth,
  } = useWallet();

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [showSpaceSettings, setShowSpaceSettings] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showInvites, setShowInvites] = useState(false);

  // Selectors for new features
  const accounts = useAppSelector(selectAllAccounts);
  const currentBudget = useAppSelector(selectBudgetForMonth(selectedMonth));
  const activeGoals = useAppSelector(selectActiveGoals);
  const activeRecurring = useAppSelector(selectActiveRecurring);

  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.initialBalance, 0);

  const handleOpenSpaceSettings = useCallback((space: Space) => {
    setSelectedSpace(space);
    setShowSpaceSettings(true);
  }, []);

  const handleCloseSpaceSettings = useCallback(() => {
    setShowSpaceSettings(false);
    setSelectedSpace(null);
  }, []);

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

  const handleQuickAction = useCallback((action: keyof WalletStackParamList) => {
    navigation.navigate(action as never);
  }, [navigation]);

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
        topContent={
          <SpaceSelector
            onCreateSpace={() => setShowCreateSpace(true)}
            onOpenSettings={handleOpenSpaceSettings}
            onOpenInvites={() => setShowInvites(true)}
          />
        }
        rightAction={
          <Button
            title=""
            size="sm"
            onPress={handleAddTransaction}
            accessibilityLabel="Aggiungi nuova spesa"
            leftIcon={<Icon name="add" size="md" color="onPrimary" />}
          />
        }
      />

      <VStack spacing="lg">
        {/* Main Balance Card */}
        <Box
          borderRadius="xl"
          padding="md"
          style={styles.balanceCard}
        >
          <Box gap="md">
            {/* Saldo principale */}
            <Box>
              <Text variant="caption" color="textSecondary">
                Saldo totale
              </Text>
              <Text variant="headingLarge" weight="bold" color="textPrimary" style={styles.balanceText}>
                {totalBalance >= 0 ? '' : '-'}€{Math.abs(totalBalance).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </Text>
              <Text variant="caption" color="textTertiary">
                {accounts.length} {accounts.length === 1 ? 'conto attivo' : 'conti attivi'}
              </Text>
            </Box>

            {/* Month selector */}
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              padding="sm"
              borderRadius="lg"
              style={styles.monthSelector}
            >
              <Pressable onPress={goToPrevMonth} style={styles.monthButton}>
                <Icon name="chevronLeft" size="sm" color="textSecondary" />
              </Pressable>
              <Text variant="bodyMedium" weight="semibold" color="textPrimary">
                {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
              </Text>
              <Pressable onPress={goToNextMonth} style={styles.monthButton}>
                <Icon name="chevronRight" size="sm" color="textSecondary" />
              </Pressable>
            </Box>

            {/* Summary row */}
            <Box flexDirection="row" gap="sm">
              <Box flex={1} padding="sm" borderRadius="lg" style={styles.summaryBox}>
                <Box flexDirection="row" alignItems="center" gap="xs" marginBottom="xs">
                  <Box width={20} height={20} borderRadius="full" alignItems="center" justifyContent="center" style={styles.incomeIconBg}>
                    <Icon name="arrowDown" size="xs" color="onPrimary" />
                  </Box>
                  <Text variant="caption" color="textSecondary">Entrate</Text>
                </Box>
                <Text variant="bodyMedium" weight="bold" style={styles.incomeText}>
                  +€{totalIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </Text>
              </Box>
              <Box flex={1} padding="sm" borderRadius="lg" style={styles.summaryBox}>
                <Box flexDirection="row" alignItems="center" gap="xs" marginBottom="xs">
                  <Box width={20} height={20} borderRadius="full" alignItems="center" justifyContent="center" style={styles.expenseIconBg}>
                    <Icon name="arrowUp" size="xs" color="onPrimary" />
                  </Box>
                  <Text variant="caption" color="textSecondary">Uscite</Text>
                </Box>
                <Text variant="bodyMedium" weight="bold" style={styles.expenseText}>
                  -€{totalExpenses.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Quick Actions - Design a griglia moderna */}
        <Box>
          <Text variant="bodySmall" weight="semibold" color="textSecondary" style={styles.sectionTitle}>
            AZIONI RAPIDE
          </Text>
          <Box flexDirection="row" flexWrap="wrap" gap="sm">
            {quickActions.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => handleQuickAction(action.key)}
                style={({ pressed }) => [
                  styles.quickActionButton,
                  pressed && styles.quickActionPressed,
                ]}
              >
                <Box
                  alignItems="center"
                  justifyContent="center"
                  gap="xs"
                  padding="md"
                  borderRadius="lg"
                  backgroundColor="backgroundSecondary"
                  style={styles.quickActionInner}
                >
                  <Box
                    width={40}
                    height={40}
                    borderRadius="md"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <Icon name={action.icon} size="md" color="primary" />
                  </Box>
                  <Text variant="caption" weight="medium" color="textPrimary">
                    {action.label}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </Box>
        </Box>

        {/* Budget Progress - Compatto */}
        {currentBudget && (
          <Box>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="sm">
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Icon name="pieChart" size="sm" color="textSecondary" />
                <Text variant="bodySmall" weight="semibold" color="textSecondary">
                  BUDGET MENSILE
                </Text>
              </Box>
              <Pressable onPress={() => navigation.navigate('Budget')}>
                <Text variant="caption" color="primary" weight="semibold">
                  Gestisci
                </Text>
              </Pressable>
            </Box>
            <BudgetProgress
              budget={currentBudget}
              spent={totalExpenses}
              onPress={() => navigation.navigate('Budget')}
              compact
            />
          </Box>
        )}

        {/* Goals & Recurring - Compatto */}
        <Box gap="sm">
          <MiniGoalProgress
            goals={activeGoals}
            onPress={() => navigation.navigate('Goals')}
          />
          <RecurringStats
            recurring={activeRecurring}
            onPress={() => navigation.navigate('Recurring')}
          />
        </Box>

        {/* Categories breakdown - Design moderno */}
        {topCategories.length > 0 && (
          <Box>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="sm">
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Icon name="layers" size="sm" color="textSecondary" />
                <Text variant="bodySmall" weight="semibold" color="textSecondary">
                  PER CATEGORIA
                </Text>
              </Box>
              <Pressable onPress={() => navigation.navigate('Reports')}>
                <Text variant="caption" color="primary" weight="semibold">
                  Report
                </Text>
              </Pressable>
            </Box>
            <GlassCard variant="solid" padding="md">
              <VStack spacing="sm">
                {topCategories.slice(0, 4).map((cat) => {
                  const percentage = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
                  return (
                    <Box key={cat.category}>
                      <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xs">
                        <Box flexDirection="row" alignItems="center" gap="sm">
                          <Box
                            width={32}
                            height={32}
                            borderRadius="md"
                            alignItems="center"
                            justifyContent="center"
                            backgroundColor={categoryColors[cat.category]}
                            style={{ opacity: 0.15 }}
                          />
                          <Box style={styles.categoryIconOverlay}>
                            <Icon name={categoryIcons[cat.category]} size="sm" color={categoryColors[cat.category]} />
                          </Box>
                          <Text variant="bodySmall" weight="medium">{categoryLabels[cat.category]}</Text>
                        </Box>
                        <Box alignItems="flex-end">
                          <Text variant="bodySmall" weight="bold">€{cat.amount.toFixed(2)}</Text>
                          <Text variant="caption" color="textSecondary">{percentage.toFixed(0)}%</Text>
                        </Box>
                      </Box>
                      {/* Progress bar */}
                      <Box height={4} borderRadius="full" backgroundColor="border" overflow="hidden">
                        <Box
                          height={4}
                          borderRadius="full"
                          backgroundColor={categoryColors[cat.category]}
                          style={{ width: `${percentage}%` }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </VStack>
            </GlassCard>
          </Box>
        )}

        {/* Transactions */}
        {transactions.length === 0 ? (
          <EmptyState
            icon="wallet"
            title="Nessuna transazione"
            description="Inizia a tracciare le tue spese"
            actionLabel="Aggiungi transazione"
            onAction={handleAddTransaction}
          />
        ) : (
          <Box>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="sm">
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Icon name="list" size="sm" color="textSecondary" />
                <Text variant="bodySmall" weight="semibold" color="textSecondary">
                  ULTIMI MOVIMENTI
                </Text>
              </Box>
              {transactions.length > 5 && (
                <Pressable>
                  <Text variant="caption" color="primary" weight="semibold">
                    Vedi tutti ({transactions.length})
                  </Text>
                </Pressable>
              )}
            </Box>

            <VStack spacing="xs">
              {transactions.slice(0, 5).map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={handleTransactionPress}
                />
              ))}
            </VStack>
          </Box>
        )}

        {/* Bottom spacing */}
        <Box height={20} />
      </VStack>

      {/* Form modal */}
      <TransactionForm
        visible={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingTransaction}
      />

      {/* Create space modal */}
      <CreateSpaceModal
        visible={showCreateSpace}
        onClose={() => setShowCreateSpace(false)}
      />

      {/* Space settings modal */}
      <SpaceSettingsModal
        visible={showSpaceSettings}
        space={selectedSpace}
        onClose={handleCloseSpaceSettings}
      />

      {/* Pending invites modal */}
      <PendingInvitesModal
        visible={showInvites}
        onClose={() => setShowInvites(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingTop: 20,
  },
  balanceText: {
    fontSize: 32,
    letterSpacing: -0.5,
  },
  monthSelector: {
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  monthButton: {
    padding: 8,
  },
  summaryBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  incomeIconBg: {
    backgroundColor: '#22c55e',
  },
  expenseIconBg: {
    backgroundColor: '#ef4444',
  },
  incomeText: {
    color: '#16a34a',
  },
  expenseText: {
    color: '#dc2626',
  },
  sectionTitle: {
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  quickActionButton: {
    width: '31%',
  },
  quickActionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  quickActionInner: {
    minHeight: 80,
  },
  categoryIconOverlay: {
    position: 'absolute',
    left: 6,
  },
});
