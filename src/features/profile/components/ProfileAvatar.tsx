/**
 * Profile Avatar Component
 * Avatar con immagine o iniziali
 */

import React from 'react';
import { Image, StyleSheet } from 'react-native';
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

  const styles = StyleSheet.create({
    image: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={styles.image}
        resizeMode="cover"
      />
    );
  }

  return (
    <Box style={styles.container}>
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
