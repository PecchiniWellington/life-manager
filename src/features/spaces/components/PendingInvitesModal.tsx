/**
 * Pending Invites Modal
 * Modal per visualizzare e gestire gli inviti ricevuti
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Text,
  Icon,
  Button,
  ScrollContainer,
} from '@shared/ui';
import { BottomSheet, BottomSheetRef } from '@shared/ui/molecules';
import { useSpaces } from '../hooks';
import { SpaceInvite } from '../domain/types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export interface PendingInvitesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PendingInvitesModal({ visible, onClose }: PendingInvitesModalProps): JSX.Element {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const { pendingInvites, acceptInvite, rejectInvite, isLoading } = useSpaces();

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.open();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleAccept = useCallback(async (inviteId: string) => {
    await acceptInvite(inviteId);
  }, [acceptInvite]);

  const handleReject = useCallback(async (inviteId: string) => {
    await rejectInvite(inviteId);
  }, [rejectInvite]);

  const formatDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(parseISO(dateString), {
        addSuffix: true,
        locale: it,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      title="Inviti in attesa"
      snapPoints={['60%']}
      onClose={onClose}
    >
      <ScrollContainer>
        <Box paddingX="lg" paddingBottom="xl">
          {pendingInvites.length === 0 ? (
            <Box alignItems="center" paddingY="xl">
              <Icon name="mail" size="xl" color="textTertiary" />
              <Text variant="bodyMedium" color="textSecondary" style={{ marginTop: 12 }}>
                Nessun invito in attesa
              </Text>
            </Box>
          ) : (
            pendingInvites.map((invite) => (
              <InviteCard
                key={invite.id}
                invite={invite}
                onAccept={() => handleAccept(invite.id)}
                onReject={() => handleReject(invite.id)}
                isLoading={isLoading}
                formatDate={formatDate}
              />
            ))
          )}
        </Box>
      </ScrollContainer>
    </BottomSheet>
  );
}

interface InviteCardProps {
  invite: SpaceInvite;
  onAccept: () => void;
  onReject: () => void;
  isLoading: boolean;
  formatDate: (date: string) => string;
}

function InviteCard({ invite, onAccept, onReject, isLoading, formatDate }: InviteCardProps): JSX.Element {
  return (
    <Box
      backgroundColor="surfaceSecondary"
      borderRadius="lg"
      padding="md"
      marginBottom="md"
    >
      <Box flexDirection="row" alignItems="center" marginBottom="md">
        <Box
          width={48}
          height={48}
          borderRadius="md"
          backgroundColor="primary"
          alignItems="center"
          justifyContent="center"
        >
          <Icon name="folder" size="lg" color="surface" />
        </Box>
        <Box marginLeft="md" flex={1}>
          <Text variant="bodyMedium" weight="semibold">
            {invite.spaceName}
          </Text>
          <Text variant="caption" color="textSecondary">
            Invitato da {invite.invitedBy.displayName || invite.invitedBy.email}
          </Text>
          <Text variant="caption" color="textTertiary">
            {formatDate(invite.createdAt)}
          </Text>
        </Box>
      </Box>

      <Box flexDirection="row" gap="sm">
        <Box flex={1}>
          <Button
            title="Rifiuta"
            variant="secondary"
            onPress={onReject}
            loading={isLoading}
            size="sm"
            accessibilityLabel="Rifiuta invito"
          />
        </Box>
        <Box flex={1}>
          <Button
            title="Accetta"
            onPress={onAccept}
            loading={isLoading}
            size="sm"
            accessibilityLabel="Accetta invito"
          />
        </Box>
      </Box>
    </Box>
  );
}
