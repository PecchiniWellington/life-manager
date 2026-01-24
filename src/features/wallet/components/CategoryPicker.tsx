/**
 * CategoryPicker Component
 * Picker per selezionare una categoria
 */

import React, { useState, useCallback } from 'react';
import {
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Box, Text, GlassCard } from '@shared/ui';
import { Category, TransactionType } from '../domain/types';
import { useTheme } from '@shared/ui/theme';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (category: Category) => void;
  type?: TransactionType;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
  type,
  label,
  placeholder = 'Seleziona categoria',
  disabled = false,
}: CategoryPickerProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();

  // Filter by type if specified
  const filteredCategories = type
    ? categories.filter(c => c.type === type)
    : categories;

  // Find selected category
  const selectedCategory = selectedCategoryId
    ? categories.find(c => c.id === selectedCategoryId)
    : null;

  const handleSelect = useCallback((category: Category) => {
    onSelect(category);
    setIsOpen(false);
  }, [onSelect]);

  const renderCategory = useCallback(({ item }: { item: Category }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={[
        styles.categoryItem,
        selectedCategoryId === item.id && {
          backgroundColor: `${colors.primary}20`,
        },
      ]}
    >
      <Box flexDirection="row" alignItems="center" gap="md">
        <Box
          width={40}
          height={40}
          borderRadius="md"
          alignItems="center"
          justifyContent="center"
          style={{ backgroundColor: `${item.color}20` }}
        >
          <Text style={{ fontSize: 20 }}>{item.icon}</Text>
        </Box>
        <Box flex={1}>
          <Text variant="bodyMedium" weight="medium">
            {item.name}
          </Text>
          <Text variant="caption" color="textSecondary">
            {item.type === 'expense' ? 'Spesa' : 'Entrata'}
          </Text>
        </Box>
        {selectedCategoryId === item.id && (
          <Text style={{ color: colors.primary }}>✓</Text>
        )}
      </Box>
    </TouchableOpacity>
  ), [selectedCategoryId, colors.primary, handleSelect]);

  return (
    <>
      <Box gap="xs">
        {label && (
          <Text variant="caption" color="textSecondary">
            {label}
          </Text>
        )}
        <TouchableOpacity
          onPress={() => !disabled && setIsOpen(true)}
          disabled={disabled}
        >
          <GlassCard
            variant="solid"
            padding="sm"
            style={disabled ? styles.disabled : undefined}
          >
            <Box flexDirection="row" alignItems="center" gap="sm">
              {selectedCategory ? (
                <>
                  <Box
                    width={32}
                    height={32}
                    borderRadius="sm"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: `${selectedCategory.color}20` }}
                  >
                    <Text style={{ fontSize: 16 }}>{selectedCategory.icon}</Text>
                  </Box>
                  <Box flex={1}>
                    <Text variant="bodyMedium">
                      {selectedCategory.name}
                    </Text>
                  </Box>
                </>
              ) : (
                <Box flex={1}>
                  <Text variant="bodyMedium" color="textSecondary">
                    {placeholder}
                  </Text>
                </Box>
              )}
              <Text color="textSecondary">▼</Text>
            </Box>
          </GlassCard>
        </TouchableOpacity>
      </Box>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.background }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              padding="md"
              style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              <Text variant="headingSmall" weight="bold">
                Seleziona categoria
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text color="primary" variant="bodyMedium">
                  Chiudi
                </Text>
              </TouchableOpacity>
            </Box>

            {/* Category list */}
            {filteredCategories.length > 0 ? (
              <FlatList
                data={filteredCategories}
                keyExtractor={(item) => item.id}
                renderItem={renderCategory}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Box padding="xl" alignItems="center">
                <Text variant="bodyMedium" color="textSecondary">
                  Nessuna categoria disponibile
                </Text>
              </Box>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/**
 * CategoryChip Component
 * Chip per mostrare una categoria inline
 */
interface CategoryChipProps {
  category: Category | null;
  size?: 'sm' | 'md';
  onPress?: () => void;
}

export function CategoryChip({
  category,
  size = 'md',
  onPress,
}: CategoryChipProps): JSX.Element {
  if (!category) {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <Box
          flexDirection="row"
          alignItems="center"
          gap="xxs"
          padding="xs"
          borderRadius="full"
          backgroundColor="backgroundSecondary"
        >
          <Text variant={size === 'sm' ? 'caption' : 'bodySmall'} color="textSecondary">
            Nessuna categoria
          </Text>
        </Box>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Box
        flexDirection="row"
        alignItems="center"
        gap="xxs"
        padding="xs"
        borderRadius="full"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <Text style={{ fontSize: size === 'sm' ? 12 : 14 }}>{category.icon}</Text>
        <Text
          variant={size === 'sm' ? 'caption' : 'bodySmall'}
          style={{ color: category.color }}
        >
          {category.name}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

/**
 * CategoryGrid Component
 * Griglia di categorie per selezione rapida
 */
interface CategoryGridProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (category: Category) => void;
  type?: TransactionType;
}

export function CategoryGrid({
  categories,
  selectedCategoryId,
  onSelect,
  type,
}: CategoryGridProps): JSX.Element {
  const { colors } = useTheme();

  const filteredCategories = type
    ? categories.filter(c => c.type === type)
    : categories;

  return (
    <Box flexDirection="row" flexWrap="wrap" gap="sm">
      {filteredCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => onSelect(category)}
          style={[
            styles.gridItem,
            selectedCategoryId === category.id && {
              borderColor: colors.primary,
              borderWidth: 2,
            },
          ]}
        >
          <Box
            width={60}
            height={60}
            borderRadius="md"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Text style={{ fontSize: 24 }}>{category.icon}</Text>
          </Box>
          <Text
            variant="caption"
            align="center"
            numberOfLines={1}
            style={{ maxWidth: 60 }}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </Box>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    borderBottomWidth: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  gridItem: {
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
