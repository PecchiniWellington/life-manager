/**
 * Profile Screen
 * Schermata profilo utente con settings e logout
 * SCREEN: Usa solo atoms e molecules del design system
 */

import React from 'react';
import { Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Box,
  Text,
  Icon,
  GlassCard,
  AnimatedPressable,
  ScrollContainer,
  Toggle,
} from '@shared/ui';
import { useThemeContext } from '@shared/ui/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@features/auth/hooks';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { SettingsRow } from '../components/SettingsRow';
import { ProfileStackParamList } from '@app/navigation/stacks/ProfileStack';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export function ProfileScreen(): JSX.Element {
  const { theme, toggleTheme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { user, logout, isLoading } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

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

  return (
    <Box
      flex={1}
      backgroundColor="background"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <Box paddingX="lg" paddingY="md">
        <Text variant="largeTitle" weight="bold">
          Profilo
        </Text>
      </Box>

      <ScrollContainer
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* User Info Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Box paddingX="lg" paddingY="md">
            <GlassCard>
              <Box padding="lg" alignItems="center">
                <ProfileAvatar
                  photoURL={user?.photoURL}
                  initials={getInitials(user?.displayName || null, user?.email || '')}
                  size={100}
                />

                <Box marginTop="md" alignItems="center">
                  <Text variant="title2" weight="semibold">
                    {user?.displayName || 'Utente'}
                  </Text>
                  <Text variant="body" color="textSecondary" marginTop="xs">
                    {user?.email}
                  </Text>
                  {user?.emailVerified && (
                    <Box flexDirection="row" alignItems="center" marginTop="xs">
                      <Icon name="checkCircle" size="sm" color="success" />
                      <Text variant="caption1" color="success" marginLeft="xs">
                        Email verificata
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Animated.View>

        {/* Account Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Box paddingX="lg" paddingY="sm">
            <Text variant="footnote" color="textSecondary" marginBottom="sm" marginLeft="sm">
              ACCOUNT
            </Text>
            <GlassCard>
              <SettingsRow
                icon="personOutline"
                label="Modifica profilo"
                onPress={() => navigation.navigate('EditProfile')}
                showChevron
              />
              <SettingsRow
                icon="lockOutline"
                label="Cambia password"
                onPress={() => navigation.navigate('ChangePassword')}
                showChevron
                showDivider={false}
              />
            </GlassCard>
          </Box>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Box paddingX="lg" paddingY="sm">
            <Text variant="footnote" color="textSecondary" marginBottom="sm" marginLeft="sm">
              PREFERENZE
            </Text>
            <GlassCard>
              <SettingsRow
                icon="moonOutline"
                label="Tema scuro"
                onPress={toggleTheme}
                rightElement={
                  <Toggle
                    value={theme.isDark}
                    onValueChange={toggleTheme}
                  />
                }
              />
              <SettingsRow
                icon="notificationsOutline"
                label="Notifiche"
                onPress={() => {}}
                showChevron
              />
              <SettingsRow
                icon="language"
                label="Lingua"
                value="Italiano"
                onPress={() => {}}
                showChevron
                showDivider={false}
              />
            </GlassCard>
          </Box>
        </Animated.View>

        {/* Info Section */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Box paddingX="lg" paddingY="sm">
            <Text variant="footnote" color="textSecondary" marginBottom="sm" marginLeft="sm">
              INFORMAZIONI
            </Text>
            <GlassCard>
              <SettingsRow
                icon="helpOutline"
                label="Aiuto e supporto"
                onPress={() => {}}
                showChevron
              />
              <SettingsRow
                icon="infoOutline"
                label="Versione app"
                value="1.0.0"
                onPress={() => {}}
                showDivider={false}
              />
            </GlassCard>
          </Box>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Box paddingX="lg" paddingY="md">
            <AnimatedPressable onPress={handleLogout} disabled={isLoading}>
              <GlassCard>
                <Box
                  padding="md"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon name="logout" size="md" color="error" />
                  <Text variant="body" color="error" weight="semibold" marginLeft="sm">
                    Esci
                  </Text>
                </Box>
              </GlassCard>
            </AnimatedPressable>
          </Box>
        </Animated.View>
      </ScrollContainer>
    </Box>
  );
}
