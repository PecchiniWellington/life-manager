/**
 * EditProfile Screen
 * Schermata per modificare il profilo utente (nome, avatar)
 * SCREEN: Usa solo atoms e molecules del design system
 */

import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Box,
  Text,
  Input,
  Icon,
  GlassCard,
  AnimatedPressable,
  ScrollContainer,
} from '@shared/ui';
import { useAuth } from '@features/auth/hooks';
import { authService } from '@features/auth/data/authService';
import { getAuthErrorMessage } from '@features/auth/domain/types';
import { ProfileAvatar } from '../components/ProfileAvatar';

export function EditProfileScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInitials = (name: string | null, email: string): string => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handlePickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permesso negato',
          'Per caricare una foto, devi concedere i permessi alla libreria foto.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingAvatar(true);
        setError(null);

        try {
          const updatedUser = await authService.uploadAvatar(result.assets[0].uri);
          setPhotoURL(updatedUser.photoURL);
          refreshUser(); // Aggiorna lo stato globale dell'utente
          Alert.alert('Successo', 'Foto profilo aggiornata!');
        } catch (err: unknown) {
          const errorCode = (err as { code?: string })?.code || 'default';
          setError(getAuthErrorMessage(errorCode));
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    } catch (err) {
      setError('Errore durante la selezione della foto');
    }
  }, [refreshUser]);

  const handleRemoveAvatar = useCallback(async () => {
    Alert.alert(
      'Rimuovi foto',
      'Sei sicuro di voler rimuovere la foto profilo?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: async () => {
            setIsUploadingAvatar(true);
            setError(null);
            try {
              const updatedUser = await authService.removeAvatar();
              setPhotoURL(updatedUser.photoURL);
              refreshUser(); // Aggiorna lo stato globale dell'utente
            } catch (err: unknown) {
              const errorCode = (err as { code?: string })?.code || 'default';
              setError(getAuthErrorMessage(errorCode));
            } finally {
              setIsUploadingAvatar(false);
            }
          },
        },
      ]
    );
  }, [refreshUser]);

  const handleSave = useCallback(async () => {
    if (!displayName.trim()) {
      setError('Il nome non può essere vuoto');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.updateProfile(displayName.trim());
      refreshUser(); // Aggiorna lo stato globale dell'utente
      Alert.alert('Successo', 'Profilo aggiornato!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || 'default';
      setError(getAuthErrorMessage(errorCode));
    } finally {
      setIsLoading(false);
    }
  }, [displayName, navigation, refreshUser]);

  const hasChanges = displayName !== (user?.displayName || '');

  return (
    <Box
      flex={1}
      backgroundColor="background"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingX="lg"
        paddingY="md"
      >
        <AnimatedPressable onPress={() => navigation.goBack()} haptic="light">
          <Box flexDirection="row" alignItems="center">
            <Icon name="chevronLeft" size="md" color="primary" />
            <Text variant="bodyMedium" color="primary">
              Indietro
            </Text>
          </Box>
        </AnimatedPressable>

        <Text variant="headingMedium" weight="semibold">
          Modifica profilo
        </Text>

        <AnimatedPressable
          onPress={handleSave}
          haptic="light"
          disabled={isLoading || !hasChanges}
        >
          <Text
            variant="bodyMedium"
            color={hasChanges ? 'primary' : 'textTertiary'}
            weight="semibold"
          >
            {isLoading ? 'Salvo...' : 'Salva'}
          </Text>
        </AnimatedPressable>
      </Box>

      <ScrollContainer
        showsVerticalScrollIndicator={false}
        paddingBottom="5xl"
      >
        {/* Avatar Section */}
        <Box paddingX="lg" paddingY="lg" alignItems="center">
          <Box position="relative">
            <ProfileAvatar
              photoURL={photoURL}
              initials={getInitials(displayName || user?.displayName || null, user?.email || '')}
              size={120}
            />

            {isUploadingAvatar && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                borderRadius="full"
                alignItems="center"
                justifyContent="center"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <Text variant="caption" color="onPrimary">
                  Carico...
                </Text>
              </Box>
            )}
          </Box>

          <Box flexDirection="row" gap="md" marginTop="md">
            <AnimatedPressable
              onPress={handlePickImage}
              haptic="light"
              disabled={isUploadingAvatar}
            >
              <Box
                paddingX="md"
                paddingY="sm"
                backgroundColor="primary"
                borderRadius="full"
              >
                <Text variant="caption" color="onPrimary" weight="semibold">
                  Cambia foto
                </Text>
              </Box>
            </AnimatedPressable>

            {photoURL && (
              <AnimatedPressable
                onPress={handleRemoveAvatar}
                haptic="light"
                disabled={isUploadingAvatar}
              >
                <Box
                  paddingX="md"
                  paddingY="sm"
                  backgroundColor="surfaceSecondary"
                  borderRadius="full"
                >
                  <Text variant="caption" color="error" weight="semibold">
                    Rimuovi
                  </Text>
                </Box>
              </AnimatedPressable>
            )}
          </Box>
        </Box>

        {/* Form */}
        <Box paddingX="lg" paddingY="sm">
          <GlassCard>
            <Box padding="lg" gap="lg">
              <Input
                label="Nome"
                placeholder="Il tuo nome"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect={false}
              />

              <Box gap="xs">
                <Text variant="labelMedium" color="textSecondary">
                  Email
                </Text>
                <Box
                  padding="md"
                  backgroundColor="surfaceSecondary"
                  borderRadius="md"
                  flexDirection="row"
                  alignItems="center"
                  gap="sm"
                >
                  <Icon name="mail" size="sm" color="textTertiary" />
                  <Text variant="bodyMedium" color="textSecondary">
                    {user?.email}
                  </Text>
                </Box>
                <Text variant="caption" color="textTertiary">
                  Per modificare l'email, contatta il supporto
                </Text>
              </Box>
            </Box>
          </GlassCard>
        </Box>

        {/* Error */}
        {error && (
          <Box paddingX="lg" paddingY="sm">
            <Box
              padding="md"
              backgroundColor="errorLight"
              borderRadius="md"
              flexDirection="row"
              alignItems="center"
              gap="sm"
            >
              <Icon name="error" size="sm" color="error" />
              <Text variant="bodyMedium" color="error">
                {error}
              </Text>
            </Box>
          </Box>
        )}
      </ScrollContainer>
    </Box>
  );
}
