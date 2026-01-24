/**
 * Space Selector Component
 * Dropdown per selezionare lo spazio attivo
 * FEATURE COMPONENT: Usa solo atoms e molecules del design system
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Text,
  Icon,
  AnimatedPressable,
  BottomSheetModal,
  ScrollContainer,
  palette,
} from '@shared/ui';
import { useSpaces } from '../hooks';
import { Space, SPACE_COLORS } from '../domain/types';
import { IconName } from '@shared/ui/atoms/Icon';

interface SpaceSelectorProps {
  onCreateSpace?: () => void;
  onOpenSettings?: (space: Space) => void;
  onOpenInvites?: () => void;
}

export function SpaceSelector({ onCreateSpace, onOpenSettings, onOpenInvites }: SpaceSelectorProps): JSX.Element {
  const { spaces, currentSpace, switchSpace, pendingInvitesCount } = useSpaces();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback(async (space: Space) => {
    await switchSpace(space.id);
    setIsOpen(false);
  }, [switchSpace]);

  const getSpaceIcon = (space: Space): IconName => {
    if (space.isPersonal) return 'person';
    return (space.icon as IconName) || 'folder';
  };

  return (
    <>
      {/* Trigger Button */}
      <Box paddingTop="md">
        <AnimatedPressable onPress={() => setIsOpen(true)} haptic="light">
          <Box
            flexDirection="row"
            alignItems="center"
            backgroundColor="surfaceSecondary"
            paddingHorizontal="lg"
            paddingVertical="md"
            borderRadius="lg"
            gap="md"
          >
            <Box
              width={32}
              height={32}
              borderRadius="md"
              alignItems="center"
              justifyContent="center"
              style={{ backgroundColor: currentSpace?.color || SPACE_COLORS[0] }}
            >
              <Icon
                name={currentSpace ? getSpaceIcon(currentSpace) : 'folder'}
                size="sm"
                color="surface"
              />
            </Box>
            <Text variant="labelMedium" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>
              {currentSpace?.name || 'Seleziona spazio'}
            </Text>
            <Icon name="chevronDown" size="sm" color="textSecondary" />
            {pendingInvitesCount > 0 && (
              <Box
                position="absolute"
                top={-6}
                right={-6}
                minWidth={20}
                height={20}
                paddingHorizontal="xs"
                borderRadius="full"
                backgroundColor="error"
                alignItems="center"
                justifyContent="center"
              >
                <Text variant="caption" weight="bold" style={{ color: palette.white, fontSize: 11 }}>
                  {pendingInvitesCount}
                </Text>
              </Box>
            )}
          </Box>
        </AnimatedPressable>
      </Box>

      {/* Modal Dropdown */}
      <BottomSheetModal
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        showHandle
        maxHeight="60%"
      >
        <Box padding="md">
          <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="md">
            <Text variant="headingSmall" weight="semibold">
              I tuoi spazi
            </Text>
            <AnimatedPressable onPress={() => setIsOpen(false)} haptic="light">
              <Icon name="close" size="md" color="textSecondary" />
            </AnimatedPressable>
          </Box>

          <ScrollContainer style={{ maxHeight: 300 }}>
            {spaces.map((item) => (
              <AnimatedPressable
                key={item.id}
                onPress={() => handleSelect(item)}
                haptic="selection"
                pressScale={0.98}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  paddingVertical="md"
                  paddingHorizontal="sm"
                  backgroundColor={item.id === currentSpace?.id ? 'surfaceSecondary' : 'transparent'}
                  borderRadius="md"
                >
                  <Box
                    width={36}
                    height={36}
                    borderRadius="sm"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon
                      name={getSpaceIcon(item)}
                      size="md"
                      color="surface"
                    />
                  </Box>
                  <Box flex={1} marginLeft="md">
                    <Text variant="bodyMedium" weight={item.id === currentSpace?.id ? 'semibold' : 'regular'}>
                      {item.name}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {item.members.length} {item.members.length === 1 ? 'membro' : 'membri'}
                    </Text>
                  </Box>
                  {item.id === currentSpace?.id && (
                    <Icon name="checkCircle" size="md" color="primary" />
                  )}
                  {/* Settings button */}
                  {onOpenSettings && !item.isPersonal && (
                    <AnimatedPressable
                      onPress={() => {
                        setIsOpen(false);
                        onOpenSettings(item);
                      }}
                      haptic="light"
                    >
                      <Box padding="xs">
                        <Icon name="settings" size="sm" color="textSecondary" />
                      </Box>
                    </AnimatedPressable>
                  )}
                </Box>
              </AnimatedPressable>
            ))}
          </ScrollContainer>

          {/* Create New Space Button */}
          {onCreateSpace && (
            <AnimatedPressable
              onPress={() => {
                setIsOpen(false);
                onCreateSpace();
              }}
              haptic="light"
              pressScale={0.98}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                paddingVertical="md"
                paddingHorizontal="sm"
                marginTop="sm"
                borderTopWidth={1}
                borderColor="border"
              >
                <Box
                  width={36}
                  height={36}
                  borderRadius="sm"
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor="surfaceSecondary"
                >
                  <Icon name="add" size="md" color="primary" />
                </Box>
                <Text variant="bodyMedium" color="primary" weight="semibold" style={{ marginLeft: 12 }}>
                  Crea nuovo spazio
                </Text>
              </Box>
            </AnimatedPressable>
          )}

          {/* Pending Invites */}
          {pendingInvitesCount > 0 && (
            <AnimatedPressable
              onPress={() => {
                setIsOpen(false);
                onOpenInvites?.();
              }}
              haptic="light"
              pressScale={0.98}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                paddingVertical="md"
                paddingHorizontal="sm"
                backgroundColor="primaryLight"
                borderRadius="md"
                marginTop="sm"
              >
                <Icon name="mail" size="md" color="primary" />
                <Text variant="bodyMedium" color="primary" weight="semibold" style={{ marginLeft: 12 }}>
                  {pendingInvitesCount} {pendingInvitesCount === 1 ? 'invito' : 'inviti'} in attesa
                </Text>
              </Box>
            </AnimatedPressable>
          )}
        </Box>
      </BottomSheetModal>
    </>
  );
}
