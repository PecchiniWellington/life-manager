/**
 * EventSpaceSelector Component
 * Selettore spazio per il form evento
 */

import React, { useState } from 'react';
import { Box, Text, Icon, AnimatedPressable } from '@shared/ui';
import { Modal } from '@shared/ui/molecules';
import { useSpaces } from '@features/spaces/hooks';
import { Space, SPACE_COLORS } from '@features/spaces/domain/types';
import { IconName } from '@shared/ui/atoms/Icon';

interface EventSpaceSelectorProps {
  /** ID dello spazio selezionato */
  value: string;
  /** Callback quando cambia lo spazio */
  onChange: (spaceId: string) => void;
}

export function EventSpaceSelector({ value, onChange }: EventSpaceSelectorProps): JSX.Element {
  const { spaces } = useSpaces();
  const [showModal, setShowModal] = useState(false);

  const selectedSpace = spaces.find((s) => s.id === value);

  const getSpaceIcon = (space: Space): IconName => {
    if (space.isPersonal) return 'person';
    return (space.icon as IconName) || 'folder';
  };

  const handleSelect = (spaceId: string) => {
    onChange(spaceId);
    setShowModal(false);
  };

  return (
    <>
      <AnimatedPressable
        onPress={() => setShowModal(true)}
        haptic="light"
        pressScale={0.98}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          padding="md"
          backgroundColor="surfaceSecondary"
          borderRadius="input"
          gap="sm"
        >
          <Box
            width={28}
            height={28}
            borderRadius="sm"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: selectedSpace?.color || SPACE_COLORS[0] }}
          >
            <Icon
              name={selectedSpace ? getSpaceIcon(selectedSpace) : 'folder'}
              size="sm"
              color="surface"
            />
          </Box>
          <Box flex={1}>
            <Text variant="bodyMedium">
              {selectedSpace?.name || 'Seleziona spazio'}
            </Text>
          </Box>
          <Icon name="chevronRight" size="sm" color="textTertiary" />
        </Box>
      </AnimatedPressable>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Seleziona spazio"
        scrollable
      >
        <Box gap="xs">
          {spaces.map((space) => {
            const isSelected = space.id === value;
            return (
              <AnimatedPressable
                key={space.id}
                onPress={() => handleSelect(space.id)}
                haptic="selection"
                pressScale={0.98}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  padding="md"
                  backgroundColor={isSelected ? 'primaryLight' : 'surfaceSecondary'}
                  borderRadius="md"
                  gap="sm"
                >
                  <Box
                    width={36}
                    height={36}
                    borderRadius="sm"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: space.color }}
                  >
                    <Icon
                      name={getSpaceIcon(space)}
                      size="md"
                      color="surface"
                    />
                  </Box>
                  <Box flex={1}>
                    <Text
                      variant="bodyMedium"
                      color={isSelected ? 'primary' : 'textPrimary'}
                      weight={isSelected ? 'semibold' : 'regular'}
                    >
                      {space.name}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {space.members.length} {space.members.length === 1 ? 'membro' : 'membri'}
                    </Text>
                  </Box>
                  {isSelected && (
                    <Icon name="check" size="sm" color="primary" />
                  )}
                </Box>
              </AnimatedPressable>
            );
          })}
        </Box>
      </Modal>
    </>
  );
}
