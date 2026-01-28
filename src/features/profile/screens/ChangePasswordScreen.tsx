/**
 * ChangePassword Screen
 * Schermata per cambiare la password
 * SCREEN: Usa solo atoms e molecules del design system
 */

import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
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
import { authService } from '@features/auth/data/authService';
import { getAuthErrorMessage, ProfileValidationErrors } from '@features/auth/domain/types';

export function ChangePasswordScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ProfileValidationErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: ProfileValidationErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Inserisci la password attuale';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Inserisci la nuova password';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'La password deve avere almeno 6 caratteri';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Conferma la nuova password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono';
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = 'La nuova password deve essere diversa dalla attuale';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentPassword, newPassword, confirmPassword]);

  const handleChangePassword = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authService.changePassword(currentPassword, newPassword);
      Alert.alert(
        'Successo',
        'Password cambiata con successo!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || 'default';
      const errorMessage = getAuthErrorMessage(errorCode);

      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        setErrors({ currentPassword: 'Password attuale non corretta' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPassword, newPassword, validateForm, navigation]);

  const canSubmit = currentPassword && newPassword && confirmPassword && !isLoading;

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
          Cambia password
        </Text>

        <Box width={80} />
      </Box>

      <ScrollContainer
        showsVerticalScrollIndicator={false}
        paddingBottom="5xl"
      >
        {/* Info */}
        <Box paddingX="lg" paddingY="md">
          <Box
            padding="md"
            backgroundColor="primaryLight"
            borderRadius="md"
            flexDirection="row"
            alignItems="flex-start"
            gap="sm"
          >
            <Icon name="infoOutline" size="sm" color="primary" />
            <Box flex={1}>
              <Text variant="caption" color="primary">
                Per la tua sicurezza, dovrai inserire la password attuale prima di
                impostarne una nuova.
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Form */}
        <Box paddingX="lg" paddingY="sm">
          <GlassCard>
            <Box padding="lg" gap="lg">
              {/* Current Password */}
              <Box gap="xs">
                <Input
                  label="Password attuale"
                  placeholder="Inserisci password attuale"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.currentPassword}
                  rightIcon={
                    <AnimatedPressable
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      haptic="light"
                    >
                      <Icon
                        name={showCurrentPassword ? 'eyeOff' : 'eye'}
                        size="sm"
                        color="textSecondary"
                      />
                    </AnimatedPressable>
                  }
                />
              </Box>

              {/* New Password */}
              <Box gap="xs">
                <Input
                  label="Nuova password"
                  placeholder="Inserisci nuova password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.newPassword}
                  rightIcon={
                    <AnimatedPressable
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      haptic="light"
                    >
                      <Icon
                        name={showNewPassword ? 'eyeOff' : 'eye'}
                        size="sm"
                        color="textSecondary"
                      />
                    </AnimatedPressable>
                  }
                />
                <Text variant="caption" color="textTertiary">
                  Minimo 6 caratteri
                </Text>
              </Box>

              {/* Confirm Password */}
              <Box gap="xs">
                <Input
                  label="Conferma nuova password"
                  placeholder="Ripeti nuova password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.confirmPassword}
                  rightIcon={
                    <AnimatedPressable
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      haptic="light"
                    >
                      <Icon
                        name={showConfirmPassword ? 'eyeOff' : 'eye'}
                        size="sm"
                        color="textSecondary"
                      />
                    </AnimatedPressable>
                  }
                />
              </Box>
            </Box>
          </GlassCard>
        </Box>

        {/* Error */}
        {errors.general && (
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
                {errors.general}
              </Text>
            </Box>
          </Box>
        )}

        {/* Submit Button */}
        <Box paddingX="lg" paddingY="lg">
          <AnimatedPressable
            onPress={handleChangePassword}
            haptic="medium"
            disabled={!canSubmit}
            pressScale={0.98}
          >
            <Box
              padding="md"
              backgroundColor={canSubmit ? 'primary' : 'surfaceSecondary'}
              borderRadius="lg"
              alignItems="center"
              opacity={canSubmit ? 1 : 0.5}
            >
              <Text
                variant="bodyMedium"
                color={canSubmit ? 'onPrimary' : 'textTertiary'}
                weight="semibold"
              >
                {isLoading ? 'Cambio in corso...' : 'Cambia password'}
              </Text>
            </Box>
          </AnimatedPressable>
        </Box>
      </ScrollContainer>
    </Box>
  );
}
