/**
 * ChecklistEditor Component
 * Editor per la checklist dell'evento
 */

import React, { useState } from 'react';
import { Box, Text, Icon, AnimatedPressable, Input } from '@shared/ui';
import { Modal } from '@shared/ui/molecules';
import { ChecklistItem } from '../domain/types';

interface ChecklistEditorProps {
  /** Items della checklist */
  value: ChecklistItem[];
  /** Callback quando cambia la checklist */
  onChange: (items: ChecklistItem[]) => void;
}

export function ChecklistEditor({ value, onChange }: ChecklistEditorProps): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const addItem = () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false,
    };

    onChange([...value, newItem]);
    setNewItemText('');
  };

  const toggleItem = (id: string) => {
    onChange(
      value.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  const completedCount = value.filter((item) => item.completed).length;

  const formatChecklist = (): string => {
    if (value.length === 0) return 'Aggiungi checklist';
    return `${completedCount}/${value.length} completati`;
  };

  return (
    <>
      <AnimatedPressable
        onPress={() => setShowModal(true)}
        haptic="light"
        pressScale={0.98}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          padding="md"
          backgroundColor="surfaceSecondary"
          borderRadius="input"
          gap="sm"
        >
          <Icon name="checkboxOutline" size="sm" color="textSecondary" />
          <Box flex={1}>
            <Text
              variant="bodyMedium"
              color={value.length > 0 ? 'textPrimary' : 'textSecondary'}
            >
              {formatChecklist()}
            </Text>
          </Box>
          {value.length > 0 && (
            <AnimatedPressable
              onPress={() => onChange([])}
              haptic="light"
              pressScale={0.9}
            >
              <Icon name="close" size="xs" color="textTertiary" />
            </AnimatedPressable>
          )}
          <Icon name="chevronRight" size="sm" color="textTertiary" />
        </Box>
      </AnimatedPressable>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Checklist"
        scrollable
      >
        <Box gap="md">
          {/* Add new item */}
          <Box flexDirection="row" gap="sm" alignItems="center">
            <Box flex={1}>
              <Input
                placeholder="Aggiungi elemento..."
                value={newItemText}
                onChangeText={setNewItemText}
                onSubmitEditing={addItem}
                returnKeyType="done"
              />
            </Box>
            <AnimatedPressable
              onPress={addItem}
              haptic="light"
              pressScale={0.9}
              disabled={!newItemText.trim()}
            >
              <Box
                width={44}
                height={44}
                borderRadius="md"
                backgroundColor={newItemText.trim() ? 'primary' : 'surfaceSecondary'}
                alignItems="center"
                justifyContent="center"
              >
                <Icon
                  name="add"
                  size="sm"
                  color={newItemText.trim() ? 'onPrimary' : 'textTertiary'}
                />
              </Box>
            </AnimatedPressable>
          </Box>

          {/* Items list */}
          {value.length > 0 && (
            <Box gap="xs">
              {value.map((item) => (
                <Box
                  key={item.id}
                  flexDirection="row"
                  alignItems="center"
                  padding="md"
                  backgroundColor="surfaceSecondary"
                  borderRadius="md"
                  gap="sm"
                >
                  <AnimatedPressable
                    onPress={() => toggleItem(item.id)}
                    haptic="selection"
                    pressScale={0.9}
                  >
                    <Box
                      width={24}
                      height={24}
                      borderRadius="sm"
                      backgroundColor={item.completed ? 'success' : 'transparent'}
                      borderWidth={item.completed ? 0 : 2}
                      borderColor="border"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {item.completed && (
                        <Icon name="check" size="xs" color="onSuccess" />
                      )}
                    </Box>
                  </AnimatedPressable>
                  <Box flex={1}>
                    <Text
                      variant="bodyMedium"
                      color={item.completed ? 'textTertiary' : 'textPrimary'}
                      style={item.completed ? { textDecorationLine: 'line-through' } : undefined}
                    >
                      {item.text}
                    </Text>
                  </Box>
                  <AnimatedPressable
                    onPress={() => removeItem(item.id)}
                    haptic="light"
                    pressScale={0.9}
                  >
                    <Icon name="close" size="sm" color="textTertiary" />
                  </AnimatedPressable>
                </Box>
              ))}
            </Box>
          )}

          {value.length === 0 && (
            <Box padding="xl" alignItems="center">
              <Text variant="bodyMedium" color="textTertiary">
                Nessun elemento nella checklist
              </Text>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
}
