/**
 * LoginForm Component
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
import { validateLogin, hasErrors } from '../domain/validation';
import { AuthValidationErrors, LoginPayload } from '../domain/types';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps): JSX.Element {
  const { login, isLoading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AuthValidationErrors>({});

  const handleLogin = useCallback(async () => {
    const payload: LoginPayload = { email: email.trim(), password };
    const validationErrors = validateLogin(payload);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    await login(payload);
  }, [email, password, login]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <GlassCard variant="solid" padding="lg">
      <VStack spacing="lg">
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
        <Box gap="xs">
          <Input
            label="Password"
            placeholder="La tua password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
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
        </Box>

        {/* Forgot Password */}
        <Box alignItems="flex-end">
          <AnimatedPressable
            onPress={() => {/* TODO: Forgot password */}}
            haptic="light"
          >
            <Text variant="bodySmall" color="primary" weight="semibold">
              Password dimenticata?
            </Text>
          </AnimatedPressable>
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

        {/* Login Button */}
        <Button
          title="Accedi"
          onPress={handleLogin}
          loading={isLoading}
          disabled={!email || !password}
          fullWidth
          size="lg"
          leftIcon={<Icon name="login" size="sm" color="onPrimary" />}
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
          title="Continua con Google"
          variant="secondary"
          onPress={() => {/* TODO: Google login */}}
          fullWidth
          size="lg"
          leftIcon={<Icon name="search" size="sm" color="textPrimary" />}
        />

        {/* Switch to Register */}
        <Box flexDirection="row" justifyContent="center" gap="xs">
          <Text variant="bodySmall" color="textSecondary">
            Non hai un account?
          </Text>
          <AnimatedPressable onPress={onSwitchToRegister} haptic="light">
            <Text variant="bodySmall" color="primary" weight="semibold">
              Registrati
            </Text>
          </AnimatedPressable>
        </Box>
      </VStack>
    </GlassCard>
  );
}
