/**
 * CategoriesScreen
 * Gestione categorie personalizzate
 */

import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { Screen, Box, Text, Button, Icon, GlassCard, Input } from '@shared/ui';
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

const colorOptions = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6',
  '#AF52DE', '#FF2D55', '#00C7BE', '#FFD60A', '#8E8E93',
];

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

  const renderCategory = useCallback(({ item }: { item: Category }) => (
    <Pressable
      onPress={() => openEditForm(item)}
      onLongPress={() => handleDelete(item)}
    >
      <GlassCard variant="solid" padding="md" style={styles.categoryCard}>
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
    </Pressable>
  ), [openEditForm, handleDelete]);

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
        <Pressable
          onPress={() => setActiveTab('expense')}
          style={[
            styles.tab,
            activeTab === 'expense' && { backgroundColor: colors.primary },
          ]}
        >
          <Text
            variant="bodySmall"
            weight="semibold"
            color={activeTab === 'expense' ? 'onPrimary' : 'textSecondary'}
          >
            Spese ({expenseCategories.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('income')}
          style={[
            styles.tab,
            activeTab === 'income' && { backgroundColor: colors.primary },
          ]}
        >
          <Text
            variant="bodySmall"
            weight="semibold"
            color={activeTab === 'income' ? 'onPrimary' : 'textSecondary'}
          >
            Entrate ({incomeCategories.length})
          </Text>
        </Pressable>
      </Box>

      <FlatList
        data={displayedCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Box height={8} />}
        ListEmptyComponent={
          <Box alignItems="center" padding="xl">
            <Text style={{ fontSize: 48 }}>📁</Text>
            <Text variant="bodyMedium" color="textSecondary" style={styles.emptyTitle}>
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
                  {editingCategory ? 'Modifica categoria' : 'Nuova categoria'}
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
                placeholder="Es. Abbigliamento"
              />

              {/* Type */}
              <Box gap="xs">
                <Text variant="caption" color="textSecondary">
                  Tipo
                </Text>
                <Box flexDirection="row" gap="sm">
                  <Pressable
                    onPress={() => setType('expense')}
                    style={[
                      styles.typeButton,
                      type === 'expense' && { backgroundColor: '#FF3B3020', borderColor: '#FF3B30' },
                    ]}
                  >
                    <Text
                      variant="bodyMedium"
                      weight="semibold"
                      color={type === 'expense' ? 'error' : 'textSecondary'}
                    >
                      Spesa
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setType('income')}
                    style={[
                      styles.typeButton,
                      type === 'income' && { backgroundColor: '#34C75920', borderColor: '#34C759' },
                    ]}
                  >
                    <Text
                      variant="bodyMedium"
                      weight="semibold"
                      color={type === 'income' ? 'success' : 'textSecondary'}
                    >
                      Entrata
                    </Text>
                  </Pressable>
                </Box>
              </Box>

              {/* Icon */}
              <Box gap="xs">
                <Text variant="caption" color="textSecondary">
                  Icona
                </Text>
                <Box flexDirection="row" flexWrap="wrap" gap="sm">
                  {iconOptions.map((i) => (
                    <Pressable
                      key={i}
                      onPress={() => setIcon(i)}
                      style={[
                        styles.iconOption,
                        icon === i && { borderColor: colors.primary, borderWidth: 2 },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>{i}</Text>
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
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  listContent: {
    paddingBottom: 40,
  },
  categoryCard: {
    marginBottom: 0,
  },
  emptyTitle: {
    marginTop: 12,
    marginBottom: 4,
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
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
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
});
