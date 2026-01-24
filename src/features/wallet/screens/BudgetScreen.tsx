/**
 * BudgetScreen
 * Gestione budget mensile globale e per categoria
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
  ScrollContainer,
  BottomSheetModal,
  AnimatedPressable,
} from '@shared/ui';
import { ScreenTitle } from '@shared/ui/molecules';
import { useTheme } from '@shared/ui/theme';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  selectBudgetForMonth,
  selectAllCategories,
  upsertBudget,
  updateCategoryLimit,
} from '../store';
import { selectMonthlySummary } from '../store/selectors';
import { Category, CreateBudgetPayload } from '../domain/types';
import { BudgetProgress, CategoryBudgetProgress } from '../components';
import { useNavigation } from '@react-navigation/native';
import { format, subMonths, addMonths } from 'date-fns';
import { it } from 'date-fns/locale';

export function BudgetScreen(): JSX.Element {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showGlobalForm, setShowGlobalForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form state
  const [globalLimit, setGlobalLimit] = useState('');
  const [categoryLimit, setCategoryLimit] = useState('');

  const budget = useAppSelector(selectBudgetForMonth(selectedMonth));
  const categories = useAppSelector(selectAllCategories);
  const summary = useAppSelector(selectMonthlySummary);

  const expenseCategories = useMemo(
    () => categories.filter(c => c.type === 'expense'),
    [categories]
  );

  // Calculate spending per category (simplified - in real app would query transactions)
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    // This would come from actual transactions filtered by month
    // For now, return empty object - will be populated when integrated with transactions
    return spending;
  }, [selectedMonth]);

  const totalSpent = summary?.totalExpenses || 0;

  const handlePrevMonth = useCallback(() => {
    const prev = subMonths(new Date(selectedMonth + '-01'), 1);
    setSelectedMonth(format(prev, 'yyyy-MM'));
  }, [selectedMonth]);

  const handleNextMonth = useCallback(() => {
    const next = addMonths(new Date(selectedMonth + '-01'), 1);
    setSelectedMonth(format(next, 'yyyy-MM'));
  }, [selectedMonth]);

  const openGlobalForm = useCallback(() => {
    setGlobalLimit(budget?.globalLimit?.toString() || '');
    setShowGlobalForm(true);
  }, [budget]);

  const openCategoryForm = useCallback((category: Category) => {
    setSelectedCategory(category);
    setCategoryLimit(budget?.categoryLimits?.[category.id]?.toString() || '');
    setShowCategoryForm(true);
  }, [budget]);

  const handleSaveGlobalBudget = useCallback(async () => {
    const limit = parseFloat(globalLimit);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return;
    }

    const payload: CreateBudgetPayload = {
      month: selectedMonth,
      globalLimit: limit,
      categoryLimits: budget?.categoryLimits || {},
    };

    await dispatch(upsertBudget(payload));
    setShowGlobalForm(false);
  }, [globalLimit, selectedMonth, budget, dispatch]);

  const handleSaveCategoryLimit = useCallback(async () => {
    if (!selectedCategory || !budget) return;

    const limit = parseFloat(categoryLimit);
    if (isNaN(limit) || limit < 0) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return;
    }

    await dispatch(updateCategoryLimit({
      budgetId: budget.id,
      categoryId: selectedCategory.id,
      limit: limit > 0 ? limit : 0,
    }));

    setShowCategoryForm(false);
    setSelectedCategory(null);
  }, [categoryLimit, selectedCategory, budget, dispatch]);

  const monthLabel = useMemo(() => {
    const date = new Date(selectedMonth + '-01');
    return format(date, 'MMMM yyyy', { locale: it });
  }, [selectedMonth]);

  return (
    <Screen paddingHorizontal="lg">
      <ScreenTitle
        title="Budget"
        leftAction={
          <Button
            title=""
            variant="ghost"
            size="sm"
            onPress={() => navigation.goBack()}
            leftIcon={<Icon name="chevronLeft" size="md" color="textPrimary" />}
          />
        }
      />

      <ScrollContainer showsVerticalScrollIndicator={false}>
        {/* Month navigation */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap="lg"
          marginBottom="lg"
        >
          <Button
            title=""
            variant="secondary"
            size="sm"
            onPress={handlePrevMonth}
            leftIcon={<Icon name="chevronLeft" size="sm" color="textPrimary" />}
          />
          <Text variant="bodyMedium" weight="semibold">
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </Text>
          <Button
            title=""
            variant="secondary"
            size="sm"
            onPress={handleNextMonth}
            leftIcon={<Icon name="chevronRight" size="sm" color="textPrimary" />}
          />
        </Box>

        {/* Global Budget */}
        <Box marginBottom="lg">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="sm">
            <Text variant="bodyMedium" weight="semibold">
              Budget globale
            </Text>
            <Button
              title={budget?.globalLimit ? 'Modifica' : 'Imposta'}
              variant="secondary"
              size="sm"
              onPress={openGlobalForm}
            />
          </Box>
          <BudgetProgress
            budget={budget}
            spent={totalSpent}
            onPress={openGlobalForm}
          />
        </Box>

        {/* Category Budgets */}
        <Box>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="sm">
            <Text variant="bodyMedium" weight="semibold">
              Budget per categoria
            </Text>
          </Box>

          {expenseCategories.length === 0 ? (
            <GlassCard variant="solid" padding="lg">
              <Box alignItems="center">
                <Text variant="bodyMedium" color="textSecondary">
                  Nessuna categoria di spesa
                </Text>
                <Text variant="caption" color="textSecondary">
                  Crea categorie per impostare budget specifici
                </Text>
              </Box>
            </GlassCard>
          ) : (
            <GlassCard variant="solid" padding="md">
              <Box gap="md">
                {expenseCategories.map((category) => {
                  const limit = budget?.categoryLimits?.[category.id] || 0;
                  const spent = categorySpending[category.id] || 0;

                  return (
                    <AnimatedPressable
                      key={category.id}
                      onPress={() => openCategoryForm(category)}
                      haptic="light"
                      pressScale={0.98}
                    >
                      <CategoryBudgetProgress
                        categoryName={category.name}
                        categoryColor={category.color}
                        limit={limit}
                        spent={spent}
                      />
                    </AnimatedPressable>
                  );
                })}
              </Box>
            </GlassCard>
          )}
        </Box>

        {/* Tips */}
        <Box marginTop="lg" marginBottom="xl">
          <GlassCard variant="solid" padding="md">
            <Box flexDirection="row" gap="sm">
              <Text style={{ fontSize: 20 }}>💡</Text>
              <Box flex={1}>
                <Text variant="bodySmall" weight="semibold">
                  Suggerimento
                </Text>
                <Text variant="caption" color="textSecondary">
                  Imposta budget per categoria per avere un controllo più dettagliato delle tue spese.
                </Text>
              </Box>
            </Box>
          </GlassCard>
        </Box>
      </ScrollContainer>

      {/* Global Budget Form Modal */}
      <BottomSheetModal
        visible={showGlobalForm}
        onClose={() => setShowGlobalForm(false)}
        showHandle
      >
        <Box padding="lg" gap="lg">
          <Text variant="headingSmall" weight="bold">
            Budget mensile
          </Text>

          <Input
            label="Limite di spesa"
            value={globalLimit}
            onChangeText={setGlobalLimit}
            keyboardType="numeric"
            placeholder="0.00"
          />

          <Text variant="caption" color="textSecondary">
            Questo è il limite massimo che vuoi spendere in un mese.
          </Text>

          <Box flexDirection="row" gap="sm">
            <Box flex={1}>
              <Button
                title="Annulla"
                variant="secondary"
                onPress={() => setShowGlobalForm(false)}
              />
            </Box>
            <Box flex={1}>
              <Button
                title="Salva"
                onPress={handleSaveGlobalBudget}
              />
            </Box>
          </Box>
        </Box>
      </BottomSheetModal>

      {/* Category Budget Form Modal */}
      <BottomSheetModal
        visible={showCategoryForm}
        onClose={() => setShowCategoryForm(false)}
        showHandle
      >
        <Box padding="lg" gap="lg">
          <Box flexDirection="row" alignItems="center" gap="sm">
            {selectedCategory && (
              <>
                <Box
                  width={40}
                  height={40}
                  borderRadius="md"
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: `${selectedCategory.color}20` }}
                >
                  <Text style={{ fontSize: 20 }}>{selectedCategory.icon}</Text>
                </Box>
                <Text variant="headingSmall" weight="bold">
                  Budget {selectedCategory.name}
                </Text>
              </>
            )}
          </Box>

          <Input
            label="Limite mensile"
            value={categoryLimit}
            onChangeText={setCategoryLimit}
            keyboardType="numeric"
            placeholder="0.00 (nessun limite)"
          />

          <Text variant="caption" color="textSecondary">
            Lascia vuoto o 0 per non impostare un limite per questa categoria.
          </Text>

          <Box flexDirection="row" gap="sm">
            <Box flex={1}>
              <Button
                title="Annulla"
                variant="secondary"
                onPress={() => setShowCategoryForm(false)}
              />
            </Box>
            <Box flex={1}>
              <Button
                title="Salva"
                onPress={handleSaveCategoryLimit}
              />
            </Box>
          </Box>
        </Box>
      </BottomSheetModal>
    </Screen>
  );
}
