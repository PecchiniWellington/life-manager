/**
 * Settings Row Component
 * Riga per le impostazioni
 */

import React from 'react';
import { Box, Text, Icon, AnimatedPressable } from '@shared/ui';
import { IconName } from '@shared/ui/atoms/Icon';
import { useTheme } from '@shared/ui/theme';

interface SettingsRowProps {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  showDivider?: boolean;
  rightElement?: React.ReactNode;
}

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showChevron = false,
  showDivider = true,
  rightElement,
}: SettingsRowProps): JSX.Element {
  const theme = useTheme();

  return (
    <>
      <AnimatedPressable onPress={onPress}>
        <Box
          flexDirection="row"
          alignItems="center"
          paddingY="md"
          paddingX="md"
        >
          <Box
            width={32}
            height={32}
            borderRadius="sm"
            backgroundColor="surfaceSecondary"
            alignItems="center"
            justifyContent="center"
          >
            <Icon name={icon} size="sm" color="primary" />
          </Box>

          <Box flex={1} marginLeft="md">
            <Text variant="body">{label}</Text>
          </Box>

          {value && (
            <Text variant="body" color="textSecondary" marginRight="sm">
              {value}
            </Text>
          )}

          {rightElement}

          {showChevron && (
            <Icon name="chevronRight" size="sm" color="textTertiary" />
          )}
        </Box>
      </AnimatedPressable>

      {showDivider && (
        <Box
          height={1}
          backgroundColor="border"
          marginLeft="lg"
          style={{ marginLeft: 56 }}
        />
      )}
    </>
  );
}
