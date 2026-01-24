/**
 * CategoriesScreen
 * Gestione categorie personalizzate
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
  accountColors,
  appleColors,
} from '@shared/ui';
import { ScreenTitle } from '@shared/ui/molecules';
import { useTheme } from '@shared/ui/theme';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  selectAllCategories,
  selectExpenseCategories,
  selectIncomeCategories,
  selectCategoriesLoading,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
} from '../store';
import { Category, CreateCategoryPayload, UpdateCategoryPayload, TransactionType } from '../domain/types';
import { useNavigation } from '@react-navigation/native';

const iconOptions = [
  '🍔', '🛒', '🚗', '🏠', '💡', '📱', '🎬', '🎮', '💊', '👕',
  '✈️', '🎓', '💰', '📦', '🎁', '🍺', '☕', '🐕', '💇', '🏋️',
];

// Use centralized colors from tokens
const colorOptions = [...accountColors];

export function CategoriesScreen(): JSX.Element {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const allCategories = useAppSelector(selectAllCategories);
  const expenseCategories = useAppSelector(selectExpenseCategories);
  const incomeCategories = useAppSelector(selectIncomeCategories);
  const loading = useAppSelector(selectCategoriesLoading);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');

  // Form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(iconOptions[0]);
  const [color, setColor] = useState(colorOptions[0]);
  const [type, setType] = useState<TransactionType>('expense');

  const displayedCategories = useMemo(
    () => activeTab === 'expense' ? expenseCategories : incomeCategories,
    [activeTab, expenseCategories, incomeCategories]
  );

  const resetForm = useCallback(() => {
    setName('');
    setIcon(iconOptions[0]);
    setColor(colorOptions[0]);
    setType(activeTab);
    setEditingCategory(null);
  }, [activeTab]);

  const openCreateForm = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const openEditForm = useCallback((category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setIcon(category.icon);
    setColor(category.color);
    setType(category.type);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per la categoria');
      return;
    }

    if (editingCategory) {
      const payload: UpdateCategoryPayload = {
        id: editingCategory.id,
        name: name.trim(),
        icon,
        color,
        type,
      };
      await dispatch(updateCategory(payload));
    } else {
      const payload: CreateCategoryPayload = {
        name: name.trim(),
        icon,
        color,
        type,
      };
      await dispatch(createCategory(payload));
    }

    handleCloseForm();
  }, [name, icon, color, type, editingCategory, dispatch, handleCloseForm]);

  const handleDelete = useCallback((category: Category) => {
    if (category.isDefault) {
      Alert.alert('Attenzione', 'Non puoi eliminare una categoria predefinita');
      return;
    }

    Alert.alert(
      'Elimina categoria',
      `Sei sicuro di voler eliminare "${category.name}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => dispatch(deleteCategory(category.id)),
        },
      ]
    );
  }, [dispatch]);

  const handleSeedDefaults = useCallback(() => {
    Alert.alert(
      'Crea categorie predefinite',
      'Vuoi creare le categorie predefinite? Questo non eliminerà le categorie esistenti.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Crea',
          onPress: () => dispatch(seedDefaultCategories()),
        },
      ]
    );
  }, [dispatch]);

  return (
    <Screen paddingHorizontal="lg">
      <ScreenTitle
        title="Categorie"
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
            title="Nuova"
            size="sm"
            onPress={openCreateForm}
            leftIcon={<Icon name="add" size="sm" color="onPrimary" />}
          />
        }
      />

      {/* Tab selector */}
      <Box flexDirection="row" gap="sm" marginBottom="md">
        <AnimatedPressable
          onPress={() => setActiveTab('expense')}
          haptic="selection"
          pressScale={0.98}
          style={{ flex: 1 }}
        >
          <Box
            paddingVertical="sm"
            paddingHorizontal="md"
            borderRadius="md"
            alignItems="center"
            style={{
              backgroundColor: activeTab === 'expense' ? colors.primary : 'rgba(0,0,0,0.05)',
            }}
          >
            <Text
              variant="bodySmall"
              weight="semibold"
              color={activeTab === 'expense' ? 'onPrimary' : 'textSecondary'}
            >
              Spese ({expenseCategories.length})
            </Text>
          </Box>
        </AnimatedPressable>
        <AnimatedPressable
          onPress={() => setActiveTab('income')}
          haptic="selection"
          pressScale={0.98}
          style={{ flex: 1 }}
        >
          <Box
            paddingVertical="sm"
            paddingHorizontal="md"
            borderRadius="md"
            alignItems="center"
            style={{
              backgroundColor: activeTab === 'income' ? colors.primary : 'rgba(0,0,0,0.05)',
            }}
          >
            <Text
              variant="bodySmall"
              weight="semibold"
              color={activeTab === 'income' ? 'onPrimary' : 'textSecondary'}
            >
              Entrate ({incomeCategories.length})
            </Text>
          </Box>
        </AnimatedPressable>
      </Box>

      <VirtualList
        data={displayedCategories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnimatedPressable
            onPress={() => openEditForm(item)}
            onLongPress={() => handleDelete(item)}
            haptic="light"
            pressScale={0.98}
          >
            <GlassCard variant="solid" padding="md" style={{ marginBottom: 8 }}>
              <Box flexDirection="row" alignItems="center" gap="md">
                <Box
                  width={48}
                  height={48}
                  borderRadius="lg"
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </Box>
                <Box flex={1}>
                  <Text variant="bodyMedium" weight="semibold">
                    {item.name}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {item.type === 'expense' ? 'Spesa' : 'Entrata'}
                    {item.isDefault && ' • Predefinita'}
                  </Text>
                </Box>
                <Box
                  width={12}
                  height={12}
                  borderRadius="full"
                  style={{ backgroundColor: item.color }}
                />
              </Box>
            </GlassCard>
          </AnimatedPressable>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Box alignItems="center" padding="xl">
            <Text style={{ fontSize: 48 }}>📁</Text>
            <Text variant="bodyMedium" color="textSecondary" style={{ marginTop: 12, marginBottom: 4 }}>
              Nessuna categoria
            </Text>
            <Text variant="caption" color="textSecondary" align="center">
              Crea la tua prima categoria o usa quelle predefinite.
            </Text>
            <Box marginTop="md">
              <Button
                title="Crea predefinite"
                variant="secondary"
                size="sm"
                onPress={handleSeedDefaults}
              />
            </Box>
          </Box>
        }
        ListFooterComponent={
          allCategories.length > 0 ? (
            <Box marginTop="lg" alignItems="center">
              <Button
                title="Aggiungi predefinite"
                variant="ghost"
                size="sm"
                onPress={handleSeedDefaults}
              />
            </Box>
          ) : null
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
                {editingCategory ? 'Modifica categoria' : 'Nuova categoria'}
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
              placeholder="Es. Abbigliamento"
            />

            {/* Type */}
            <Box gap="xs">
              <Text variant="caption" color="textSecondary">
                Tipo
              </Text>
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
            </Box>

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
                      width={44}
                      height={44}
                      borderRadius="md"
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={2}
                      style={{
                        borderColor: icon === i ? colors.primary : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{i}</Text>
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

            {/* Preview */}
            <Box gap="xs">
              <Text variant="caption" color="textSecondary">
                Anteprima
              </Text>
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Box
                  width={48}
                  height={48}
                  borderRadius="lg"
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Text style={{ fontSize: 24 }}>{icon}</Text>
                </Box>
                <Text variant="bodyMedium" weight="semibold">
                  {name || 'Nome categoria'}
                </Text>
              </Box>
            </Box>

            {/* Submit */}
            <Button
              title={editingCategory ? 'Salva modifiche' : 'Crea categoria'}
              onPress={handleSubmit}
              loading={loading}
            />
          </Box>
        </ScrollContainer>
      </BottomSheetModal>
    </Screen>
  );
}
