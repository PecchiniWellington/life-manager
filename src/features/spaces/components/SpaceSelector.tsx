/**
 * Space Selector Component
 * Dropdown per selezionare lo spazio attivo
 */

import React, { useState, useCallback } from 'react';
import { Modal, FlatList, StyleSheet, Pressable as RNPressable } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import {
  Box,
  Text,
  Icon,
  AnimatedPressable,
} from '@shared/ui';
import { useTheme } from '@shared/ui/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSpaces } from '../hooks';
import { Space, SPACE_COLORS } from '../domain/types';
import { IconName } from '@shared/ui/atoms/Icon';

interface SpaceSelectorProps {
  onCreateSpace?: () => void;
  onOpenSettings?: (space: Space) => void;
  onOpenInvites?: () => void;
}

export function SpaceSelector({ onCreateSpace, onOpenSettings, onOpenInvites }: SpaceSelectorProps): JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
      <AnimatedPressable onPress={() => setIsOpen(true)} haptic="light">
        <Box
          flexDirection="row"
          alignItems="center"
          backgroundColor="surfaceSecondary"
          paddingX="md"
          paddingY="sm"
          borderRadius="lg"
        >
          <Box
            width={28}
            height={28}
            borderRadius="sm"
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
          <Text variant="labelMedium" weight="semibold" style={{ marginLeft: 8, flex: 1 }} numberOfLines={1}>
            {currentSpace?.name || 'Seleziona spazio'}
          </Text>
          <Icon name="chevronDown" size="sm" color="textSecondary" />
          {pendingInvitesCount > 0 && (
            <Box
              position="absolute"
              top={-4}
              right={-4}
              width={18}
              height={18}
              borderRadius="full"
              backgroundColor="error"
              alignItems="center"
              justifyContent="center"
            >
              <Text variant="caption" weight="bold" style={{ color: '#FFFFFF', fontSize: 10 }}>
                {pendingInvitesCount}
              </Text>
            </Box>
          )}
        </Box>
      </AnimatedPressable>

      {/* Modal Dropdown */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <RNPressable
          style={styles.overlay}
          onPress={() => setIsOpen(false)}
        >
          <Animated.View
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          />
        </RNPressable>

        <Animated.View
          style={[
            styles.dropdown,
            {
              top: insets.top + 60,
              backgroundColor: theme.colors.surface,
            },
          ]}
          entering={SlideInDown.springify().damping(20)}
        >
          <Box padding="md">
            <Text variant="caption" color="textSecondary" style={{ marginBottom: 8 }}>
              I TUOI SPAZI
            </Text>

            <FlatList
              data={spaces}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AnimatedPressable
                  onPress={() => handleSelect(item)}
                  haptic="selection"
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    paddingY="md"
                    paddingX="sm"
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
              )}
              ItemSeparatorComponent={() => <Box height={4} />}
              style={{ maxHeight: 300 }}
            />

            {/* Create New Space Button */}
            {onCreateSpace && (
              <AnimatedPressable
                onPress={() => {
                  setIsOpen(false);
                  onCreateSpace();
                }}
                haptic="light"
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  paddingY="md"
                  paddingX="sm"
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
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  paddingY="md"
                  paddingX="sm"
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
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  dropdown: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
