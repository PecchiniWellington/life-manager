/**
 * AccountCard Component
 * Card che mostra un conto con saldo
 */

import React from 'react';
import { Pressable } from 'react-native';
import { Box, Text, GlassCard } from '@shared/ui';
import { Account, AccountWithBalance, accountTypeLabels } from '../domain/types';

interface AccountCardProps {
  account: Account | AccountWithBalance;
  balance?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export function AccountCard({
  account,
  balance,
  onPress,
  onLongPress,
  selected = false,
  compact = false,
}: AccountCardProps): JSX.Element {
  const currentBalance = 'currentBalance' in account ? account.currentBalance : (balance ?? account.initialBalance);

  if (compact) {
    const compactContent = (
      <GlassCard
        variant="solid"
        padding="sm"
        style={selected ? { borderWidth: 2, borderColor: account.color } : undefined}
      >
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Box
            width={32}
            height={32}
            borderRadius="md"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: account.color + '20' }}
          >
            <Text style={{ fontSize: 16 }}>{account.icon}</Text>
          </Box>
          <Box flex={1}>
            <Text variant="bodySmall" weight="semibold" numberOfLines={1}>
              {account.name}
            </Text>
          </Box>
          <Text
            variant="bodySmall"
            weight="bold"
            color={currentBalance >= 0 ? 'success' : 'error'}
          >
            €{currentBalance.toFixed(2)}
          </Text>
        </Box>
      </GlassCard>
    );

    return onPress ? (
      <Pressable onPress={onPress} onLongPress={onLongPress}>
        {compactContent}
      </Pressable>
    ) : compactContent;
  }

  const fullContent = (
    <GlassCard
      variant="solid"
      padding="md"
      style={selected ? { borderWidth: 2, borderColor: account.color } : undefined}
    >
      <Box gap="md">
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box flexDirection="row" alignItems="center" gap="md">
            <Box
              width={44}
              height={44}
              borderRadius="lg"
              alignItems="center"
              justifyContent="center"
              style={{ backgroundColor: account.color + '20' }}
            >
              <Text style={{ fontSize: 22 }}>{account.icon}</Text>
            </Box>
            <Box>
              <Text variant="bodyMedium" weight="semibold">
                {account.name}
              </Text>
              <Text variant="caption" color="textSecondary">
                {accountTypeLabels[account.type]}
              </Text>
            </Box>
          </Box>
          {account.isDefault && (
            <Box
              padding="xs"
              borderRadius="sm"
              style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}
            >
              <Text variant="caption" color="primary" weight="semibold">
                Principale
              </Text>
            </Box>
          )}
        </Box>

        <Box>
          <Text variant="caption" color="textSecondary">
            Saldo attuale
          </Text>
          <Text
            variant="headingMedium"
            weight="bold"
            color={currentBalance >= 0 ? 'textPrimary' : 'error'}
          >
            €{currentBalance.toFixed(2)}
          </Text>
        </Box>
      </Box>
    </GlassCard>
  );

  return onPress ? (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      {fullContent}
    </Pressable>
  ) : fullContent;
}
