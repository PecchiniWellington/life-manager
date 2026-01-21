/**
 * AuthScreen - Login/Register Screen
 * NO TAG NATIVI - usa solo design system
 */

import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import {
  Screen,
  Box,
  Text,
  Icon,
  SegmentedControl,
  type SegmentedControlOption,
} from '@shared/ui';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';

type AuthMode = 'login' | 'register';

const authOptions: SegmentedControlOption<AuthMode>[] = [
  { value: 'login', label: 'Accedi' },
  { value: 'register', label: 'Registrati' },
];

export function AuthScreen(): JSX.Element {
  const [mode, setMode] = useState<AuthMode>('login');

  const handleModeChange = (newMode: AuthMode) => {
    Keyboard.dismiss();
    setMode(newMode);
  };

  return (
    <Screen
      scroll
      paddingHorizontal="lg"
      safeAreaEdges={['top', 'bottom']}
      withTabBar={false}
    >
      {/* Logo/Header */}
      <Animated.View entering={FadeIn.duration(600)}>
        <Box alignItems="center" paddingY="xxl" gap="md">
          <Box
            width={80}
            height={80}
            borderRadius="xl"
            backgroundColor="primaryLight"
            alignItems="center"
            justifyContent="center"
          >
            <Icon name="checkCircle" size="xl" color="primary" />
          </Box>
          <Text variant="headingLarge" weight="bold" align="center">
            Life Manager
          </Text>
          <Text variant="bodyMedium" color="textSecondary" align="center">
            Organizza la tua vita in un unico posto
          </Text>
        </Box>
      </Animated.View>

      {/* Auth Mode Selector */}
      <Animated.View entering={FadeIn.delay(200).duration(400)}>
        <Box marginBottom="xl">
          <SegmentedControl
            options={authOptions}
            value={mode}
            onChange={handleModeChange}
            size="lg"
          />
        </Box>
      </Animated.View>

      {/* Form */}
      {mode === 'login' ? (
        <Animated.View
          key="login"
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(200)}
        >
          <LoginForm onSwitchToRegister={() => setMode('register')} />
        </Animated.View>
      ) : (
        <Animated.View
          key="register"
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(200)}
        >
          <RegisterForm onSwitchToLogin={() => setMode('login')} />
        </Animated.View>
      )}

      {/* Footer */}
      <Animated.View entering={FadeIn.delay(400).duration(400)}>
        <Box paddingY="xl" alignItems="center">
          <Text variant="caption" color="textTertiary" align="center">
            Continuando accetti i nostri Termini di Servizio{'\n'}e la Privacy Policy
          </Text>
        </Box>
      </Animated.View>
    </Screen>
  );
}
