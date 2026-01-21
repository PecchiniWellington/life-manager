/**
 * RegisterForm Component
 * NO TAG NATIVI - usa solo design system
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  Button,
  Input,
  Text,
  Icon,
  AnimatedPressable,
  GlassCard,
} from '@shared/ui';
import { useAuth } from '../hooks/useAuth';
import { validateRegister, hasErrors } from '../domain/validation';
import { AuthValidationErrors, RegisterPayload } from '../domain/types';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps): JSX.Element {
  const { register, isLoading, error: authError } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AuthValidationErrors>({});

  const handleRegister = useCallback(async () => {
    const payload: RegisterPayload = {
      displayName: displayName.trim(),
      email: email.trim(),
      password,
    };

    const validationErrors = validateRegister(payload);

    // Check password confirmation
    if (password !== confirmPassword) {
      validationErrors.password = 'Le password non coincidono';
    }

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    await register(payload);
  }, [displayName, email, password, confirmPassword, register]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const isFormValid = displayName && email && password && confirmPassword;

  return (
    <GlassCard variant="solid" padding="lg">
      <VStack spacing="lg">
        {/* Display Name */}
        <Input
          label="Nome"
          placeholder="Come ti chiami?"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          autoComplete="name"
          error={errors.displayName}
          leftIcon={<Icon name="person" size="sm" color="textSecondary" />}
        />

        {/* Email */}
        <Input
          label="Email"
          placeholder="La tua email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          leftIcon={<Icon name="mail" size="sm" color="textSecondary" />}
        />

        {/* Password */}
        <Input
          label="Password"
          placeholder="Crea una password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          error={errors.password}
          leftIcon={<Icon name="lock" size="sm" color="textSecondary" />}
          rightIcon={
            <AnimatedPressable
              onPress={togglePasswordVisibility}
              haptic="light"
              pressScale={0.9}
            >
              <Icon
                name={showPassword ? 'eyeOff' : 'eye'}
                size="sm"
                color="textSecondary"
              />
            </AnimatedPressable>
          }
        />

        {/* Confirm Password */}
        <Input
          label="Conferma Password"
          placeholder="Ripeti la password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          leftIcon={<Icon name="lock" size="sm" color="textSecondary" />}
        />

        {/* Password requirements hint */}
        <Box flexDirection="row" alignItems="center" gap="xs">
          <Icon
            name={password.length >= 6 ? 'checkCircle' : 'info'}
            size="xs"
            color={password.length >= 6 ? 'success' : 'textTertiary'}
          />
          <Text
            variant="caption"
            color={password.length >= 6 ? 'success' : 'textTertiary'}
          >
            Minimo 6 caratteri
          </Text>
        </Box>

        {/* Error message */}
        {authError && (
          <Box
            flexDirection="row"
            alignItems="center"
            padding="md"
            backgroundColor="errorLight"
            borderRadius="md"
            gap="sm"
          >
            <Icon name="error" size="sm" color="error" />
            <Text variant="bodySmall" color="error" style={{ flex: 1 }}>
              {authError}
            </Text>
          </Box>
        )}

        {/* Register Button */}
        <Button
          title="Crea Account"
          onPress={handleRegister}
          loading={isLoading}
          disabled={!isFormValid}
          fullWidth
          size="lg"
          leftIcon={<Icon name="personAdd" size="sm" color="onPrimary" />}
        />

        {/* Divider */}
        <Box flexDirection="row" alignItems="center" gap="md">
          <Box flex={1} height={1} backgroundColor="border" />
          <Text variant="caption" color="textTertiary">
            oppure
          </Text>
          <Box flex={1} height={1} backgroundColor="border" />
        </Box>

        {/* Social Login - Google */}
        <Button
          title="Registrati con Google"
          variant="secondary"
          onPress={() => {/* TODO: Google signup */}}
          fullWidth
          size="lg"
          leftIcon={<Icon name="search" size="sm" color="textPrimary" />}
        />

        {/* Switch to Login */}
        <Box flexDirection="row" justifyContent="center" gap="xs">
          <Text variant="bodySmall" color="textSecondary">
            Hai già un account?
          </Text>
          <AnimatedPressable onPress={onSwitchToLogin} haptic="light">
            <Text variant="bodySmall" color="primary" weight="semibold">
              Accedi
            </Text>
          </AnimatedPressable>
        </Box>
      </VStack>
    </GlassCard>
  );
}
