/**
 * AccountSelector Component
 * Dropdown per selezionare un conto
 */

import React, { useState } from 'react';
import { Modal, FlatList, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Box, Text, Icon } from '@shared/ui';
import { Account } from '../domain/types';
import { useTheme } from '@shared/ui/theme';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onSelect: (account: Account) => void;
  label?: string;
  placeholder?: string;
}

export function AccountSelector({
  accounts,
  selectedAccountId,
  onSelect,
  label,
  placeholder = 'Seleziona conto',
}: AccountSelectorProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const handleSelect = (account: Account) => {
    onSelect(account);
    setIsOpen(false);
  };

  return (
    <>
      <Box gap="xs">
        {label && (
          <Text variant="caption" color="textSecondary">
            {label}
          </Text>
        )}
        <TouchableOpacity onPress={() => setIsOpen(true)} activeOpacity={0.7}>
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            padding="md"
            borderRadius="md"
            backgroundColor="surfaceElevated"
          >
            {selectedAccount ? (
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Box
                  width={28}
                  height={28}
                  borderRadius="sm"
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: selectedAccount.color + '20' }}
                >
                  <Text style={{ fontSize: 14 }}>{selectedAccount.icon}</Text>
                </Box>
                <Text variant="bodyMedium">{selectedAccount.name}</Text>
              </Box>
            ) : (
              <Text variant="bodyMedium" color="textSecondary">
                {placeholder}
              </Text>
            )}
            <Icon name="chevronDown" size="sm" color="textSecondary" />
          </Box>
        </TouchableOpacity>
      </Box>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface, borderRadius: 16 },
            ]}
          >
            <Box padding="md">
              <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="md">
                <Text variant="headingSmall" weight="semibold">
                  Seleziona conto
                </Text>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Icon name="close" size="md" color="textSecondary" />
                </TouchableOpacity>
              </Box>

              <FlatList
                data={accounts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Box
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      padding="md"
                      borderRadius="md"
                      style={item.id === selectedAccountId ? { backgroundColor: `${colors.primary}15` } : undefined}
                    >
                      <Box flexDirection="row" alignItems="center" gap="md">
                        <Box
                          width={36}
                          height={36}
                          borderRadius="md"
                          alignItems="center"
                          justifyContent="center"
                          style={{ backgroundColor: item.color + '20' }}
                        >
                          <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                        </Box>
                        <Box>
                          <Text variant="bodyMedium" weight="medium">
                            {item.name}
                          </Text>
                          {item.isDefault && (
                            <Text variant="caption" color="primary">
                              Principale
                            </Text>
                          )}
                        </Box>
                      </Box>
                      {item.id === selectedAccountId && (
                        <Icon name="check" size="sm" color="primary" />
                      )}
                    </Box>
                  </TouchableOpacity>
                )}
                style={styles.list}
              />
            </Box>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
  },
  list: {
    maxHeight: 300,
  },
});
