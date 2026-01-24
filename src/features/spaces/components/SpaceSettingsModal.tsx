/**
 * Space Settings Modal
 * Modal per gestire le impostazioni dello spazio e invitare membri
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  Box,
  Text,
  Icon,
  Input,
  Button,
  AnimatedPressable,
  ScrollContainer,
} from '@shared/ui';
import { BottomSheet, BottomSheetRef } from '@shared/ui/molecules';
import { useSpaces } from '../hooks';
import { Space, SpaceMember } from '../domain/types';
import { IconName } from '@shared/ui/atoms/Icon';

export interface SpaceSettingsModalProps {
  visible: boolean;
  space: Space | null;
  onClose: () => void;
}

export function SpaceSettingsModal({ visible, space, onClose }: SpaceSettingsModalProps): JSX.Element | null {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const { inviteToSpace, deleteSpace, leaveSpace, isLoading } = useSpaces();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.open();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    setInviteEmail('');
    setInviteError(null);
    setInviteSuccess(null);
    onClose();
  }, [onClose]);

  const handleInvite = useCallback(async () => {
    if (!space) return;

    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      setInviteError('Inserisci un\'email');
      return;
    }

    // Validazione email base
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setInviteError('Email non valida');
      return;
    }

    // Controlla se già membro
    const alreadyMember = space.members.some(m => m.email.toLowerCase() === email);
    if (alreadyMember) {
      setInviteError('Questo utente è già membro dello spazio');
      return;
    }

    setInviteError(null);
    setInviteSuccess(null);

    const success = await inviteToSpace({
      spaceId: space.id,
      email,
    });

    if (success) {
      setInviteEmail('');
      setInviteSuccess(`Invito inviato a ${email}`);
    } else {
      setInviteError('Errore nell\'invio dell\'invito');
    }
  }, [space, inviteEmail, inviteToSpace]);

  const handleDeleteSpace = useCallback(() => {
    if (!space) return;

    Alert.alert(
      'Elimina spazio',
      `Sei sicuro di voler eliminare "${space.name}"? Tutti i dati associati verranno persi.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteSpace(space.id);
            if (success) {
              handleClose();
            }
          },
        },
      ]
    );
  }, [space, deleteSpace, handleClose]);

  const handleLeaveSpace = useCallback(() => {
    if (!space) return;

    Alert.alert(
      'Abbandona spazio',
      `Sei sicuro di voler abbandonare "${space.name}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Abbandona',
          style: 'destructive',
          onPress: async () => {
            const success = await leaveSpace(space.id);
            if (success) {
              handleClose();
            }
          },
        },
      ]
    );
  }, [space, leaveSpace, handleClose]);

  const getRoleLabel = (role: SpaceMember['role']): string => {
    switch (role) {
      case 'owner': return 'Proprietario';
      case 'admin': return 'Admin';
      case 'member': return 'Membro';
      default: return role;
    }
  };

  const getRoleIcon = (role: SpaceMember['role']): IconName => {
    switch (role) {
      case 'owner': return 'star';
      case 'admin': return 'settings';
      case 'member': return 'person';
      default: return 'person';
    }
  };

  if (!space) return null;

  const isOwner = space.members.some(m => m.role === 'owner');
  const canInvite = space.members.some(m => m.role === 'owner' || m.role === 'admin');

  return (
    <BottomSheet
      ref={bottomSheetRef}
      title={space.name}
      snapPoints={['80%']}
      onClose={handleClose}
    >
      <ScrollContainer>
        <Box paddingX="lg" paddingBottom="xl">
          {/* Space Info */}
          <Box
            flexDirection="row"
            alignItems="center"
            padding="md"
            backgroundColor="surfaceSecondary"
            borderRadius="lg"
            marginBottom="lg"
          >
            <Box
              width={56}
              height={56}
              borderRadius="md"
              alignItems="center"
              justifyContent="center"
              style={{ backgroundColor: space.color }}
            >
              <Icon
                name={(space.icon as IconName) || 'folder'}
                size="lg"
                color="surface"
              />
            </Box>
            <Box marginLeft="md" flex={1}>
              <Text variant="headingSmall">{space.name}</Text>
              <Text variant="caption" color="textSecondary">
                {space.members.length} {space.members.length === 1 ? 'membro' : 'membri'}
              </Text>
            </Box>
          </Box>

          {/* Membri */}
          <Box marginBottom="lg" gap="sm">
            <Text variant="caption" color="textSecondary">
              MEMBRI
            </Text>
            {space.members.map((member) => (
              <Box
                key={member.userId}
                flexDirection="row"
                alignItems="center"
                paddingY="sm"
              >
                <Box
                  width={40}
                  height={40}
                  borderRadius="full"
                  backgroundColor="surfaceSecondary"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon name="person" size="md" color="textSecondary" />
                </Box>
                <Box marginLeft="md" flex={1}>
                  <Text variant="bodyMedium">
                    {member.displayName || member.email}
                  </Text>
                  <Box flexDirection="row" alignItems="center">
                    <Icon name={getRoleIcon(member.role)} size="xs" color="textTertiary" />
                    <Text variant="caption" color="textTertiary" style={{ marginLeft: 4 }}>
                      {getRoleLabel(member.role)}
                    </Text>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Invita membri (solo se non è spazio personale e ha permessi) */}
          {!space.isPersonal && canInvite && (
            <Box marginBottom="lg" gap="sm">
              <Text variant="caption" color="textSecondary">
                INVITA NUOVI MEMBRI
              </Text>
              <Box flexDirection="row" alignItems="flex-start">
                <Box flex={1}>
                  <Input
                    value={inviteEmail}
                    onChangeText={(text) => {
                      setInviteEmail(text);
                      setInviteError(null);
                      setInviteSuccess(null);
                    }}
                    placeholder="email@esempio.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="send"
                    onSubmitEditing={handleInvite}
                  />
                </Box>
                <Box marginLeft="sm">
                  <Button
                    title="Invita"
                    onPress={handleInvite}
                    loading={isLoading}
                    disabled={!inviteEmail.trim()}
                    size="md"
                    accessibilityLabel="Invia invito"
                  />
                </Box>
              </Box>
              {inviteError && (
                <Box marginTop="xs">
                  <Text variant="caption" color="error">
                    {inviteError}
                  </Text>
                </Box>
              )}
              {inviteSuccess && (
                <Box marginTop="xs">
                  <Text variant="caption" color="success">
                    {inviteSuccess}
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* Azioni */}
          {!space.isPersonal && (
            <Box marginTop="lg" gap="sm">
              <Text variant="caption" color="textSecondary">
                AZIONI
              </Text>

              {isOwner ? (
                <AnimatedPressable onPress={handleDeleteSpace} haptic="warning">
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    paddingY="md"
                    paddingX="sm"
                  >
                    <Icon name="delete" size="md" color="error" />
                    <Text variant="bodyMedium" color="error" style={{ marginLeft: 12 }}>
                      Elimina spazio
                    </Text>
                  </Box>
                </AnimatedPressable>
              ) : (
                <AnimatedPressable onPress={handleLeaveSpace} haptic="warning">
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    paddingY="md"
                    paddingX="sm"
                  >
                    <Icon name="logout" size="md" color="error" />
                    <Text variant="bodyMedium" color="error" style={{ marginLeft: 12 }}>
                      Abbandona spazio
                    </Text>
                  </Box>
                </AnimatedPressable>
              )}
            </Box>
          )}
        </Box>
      </ScrollContainer>
    </BottomSheet>
  );
}
