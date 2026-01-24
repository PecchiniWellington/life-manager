/**
 * CategoryPicker Component
 * Picker per selezionare una categoria
 * FEATURE COMPONENT: Usa solo atoms e molecules del design system
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Text,
  GlassCard,
  AnimatedPressable,
  BottomSheetModal,
  VirtualList,
  Icon,
} from '@shared/ui';
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

  return (
    <>
      <Box gap="xs">
        {label && (
          <Text variant="caption" color="textSecondary">
            {label}
          </Text>
        )}
        <AnimatedPressable
          onPress={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          haptic="light"
          pressScale={0.98}
        >
          <GlassCard
            variant="solid"
            padding="sm"
            style={disabled ? { opacity: 0.5 } : undefined}
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
              <Icon name="chevronDown" size="sm" color="textSecondary" />
            </Box>
          </GlassCard>
        </AnimatedPressable>
      </Box>

      <BottomSheetModal
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        showHandle
        maxHeight="70%"
      >
        <Box padding="md">
          {/* Header */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="md"
          >
            <Text variant="headingSmall" weight="bold">
              Seleziona categoria
            </Text>
            <AnimatedPressable onPress={() => setIsOpen(false)} haptic="light">
              <Icon name="close" size="md" color="textSecondary" />
            </AnimatedPressable>
          </Box>

          {/* Category list */}
          {filteredCategories.length > 0 ? (
            <VirtualList
              data={filteredCategories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AnimatedPressable
                  onPress={() => handleSelect(item)}
                  haptic="selection"
                  pressScale={0.98}
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    gap="md"
                    paddingHorizontal="md"
                    paddingVertical="sm"
                    borderRadius="md"
                    style={
                      selectedCategoryId === item.id
                        ? { backgroundColor: `${colors.primary}20` }
                        : undefined
                    }
                  >
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
                      <Icon name="check" size="sm" color="primary" />
                    )}
                  </Box>
                </AnimatedPressable>
              )}
              style={{ maxHeight: 400 }}
            />
          ) : (
            <Box padding="xl" alignItems="center">
              <Text variant="bodyMedium" color="textSecondary">
                Nessuna categoria disponibile
              </Text>
            </Box>
          )}
        </Box>
      </BottomSheetModal>
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
  const content = !category ? (
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
  ) : (
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
  );

  return onPress ? (
    <AnimatedPressable onPress={onPress} haptic="light" pressScale={0.95}>
      {content}
    </AnimatedPressable>
  ) : content;
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
        <AnimatedPressable
          key={category.id}
          onPress={() => onSelect(category)}
          haptic="selection"
          pressScale={0.95}
        >
          <Box
            alignItems="center"
            gap="xxs"
            padding="sm"
            borderRadius="lg"
            borderWidth={2}
            style={{
              borderColor: selectedCategoryId === category.id ? colors.primary : 'transparent',
            }}
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
          </Box>
        </AnimatedPressable>
      ))}
    </Box>
  );
}
