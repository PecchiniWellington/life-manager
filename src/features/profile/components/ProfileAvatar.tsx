/**
 * Profile Avatar Component
 * Avatar con immagine o iniziali
 * FEATURE COMPONENT: Usa solo atoms e molecules del design system
 */

import React from 'react';
import { Image } from 'react-native';
import { Box, Text } from '@shared/ui';
import { useTheme } from '@shared/ui/theme';

interface ProfileAvatarProps {
  photoURL?: string | null;
  initials: string;
  size?: number;
}

export function ProfileAvatar({
  photoURL,
  initials,
  size = 80,
}: ProfileAvatarProps): JSX.Element {
  const theme = useTheme();

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        resizeMode="cover"
      />
    );
  }

  return (
    <Box
      width={size}
      height={size}
      borderRadius="full"
      alignItems="center"
      justifyContent="center"
      style={{ backgroundColor: theme.colors.primary }}
    >
      <Text
        variant="title1"
        weight="bold"
        style={{ color: '#FFFFFF', fontSize: size * 0.4 }}
      >
        {initials}
      </Text>
    </Box>
  );
}
