/**
 * Create Space Modal
 * Modal per creare un nuovo spazio
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { SPACE_COLORS, SPACE_ICONS, SpaceColor, SpaceIcon } from '../domain/types';
import { IconName } from '@shared/ui/atoms/Icon';

export interface CreateSpaceModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateSpaceModal({ visible, onClose }: CreateSpaceModalProps): JSX.Element {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const { createSpace, isLoading } = useSpaces();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<SpaceColor>(SPACE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<SpaceIcon>('folder');
  const [error, setError] = useState<string | null>(null);

  // Apri/chiudi il bottom sheet in base a visible
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.open();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    setName('');
    setSelectedColor(SPACE_COLORS[0]);
    setSelectedIcon('folder');
    setError(null);
    onClose();
  }, [onClose]);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      setError('Inserisci un nome per lo spazio');
      return;
    }

    const success = await createSpace({
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon,
    });

    if (success) {
      handleClose();
    } else {
      setError('Errore nella creazione dello spazio');
    }
  }, [name, selectedColor, selectedIcon, createSpace, handleClose]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      title="Nuovo spazio"
      snapPoints={['70%']}
      onClose={handleClose}
    >
      <ScrollContainer>
        <Box paddingX="lg" paddingBottom="xl">
          {/* Name Input */}
          <Box marginBottom="lg" gap="xs">
            <Text variant="caption" color="textSecondary">
              NOME SPAZIO
            </Text>
            <Input
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(null);
              }}
              placeholder="Es. Famiglia, Lavoro..."
              autoCapitalize="words"
              returnKeyType="done"
            />
            {error && (
              <Box marginTop="xs">
                <Text variant="caption" color="error">
                  {error}
                </Text>
              </Box>
            )}
          </Box>

          {/* Color Selection */}
          <Box marginBottom="lg" gap="sm">
            <Text variant="caption" color="textSecondary">
              COLORE
            </Text>
            <Box flexDirection="row" flexWrap="wrap" gap="sm">
              {SPACE_COLORS.map((color) => (
                <AnimatedPressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  haptic="selection"
                >
                  <Box
                    width={44}
                    height={44}
                    borderRadius="md"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: color }}
                    borderWidth={selectedColor === color ? 3 : 0}
                    borderColor="background"
                  >
                    {selectedColor === color && (
                      <Icon name="check" size="sm" color="surface" />
                    )}
                  </Box>
                </AnimatedPressable>
              ))}
            </Box>
          </Box>

          {/* Icon Selection */}
          <Box marginBottom="xl" gap="sm">
            <Text variant="caption" color="textSecondary">
              ICONA
            </Text>
            <Box flexDirection="row" flexWrap="wrap" gap="sm">
              {SPACE_ICONS.map((icon) => (
                <AnimatedPressable
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  haptic="selection"
                >
                  <Box
                    width={44}
                    height={44}
                    borderRadius="md"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor={selectedIcon === icon ? 'primary' : 'surfaceSecondary'}
                  >
                    <Icon
                      name={icon as IconName}
                      size="md"
                      color={selectedIcon === icon ? 'surface' : 'textPrimary'}
                    />
                  </Box>
                </AnimatedPressable>
              ))}
            </Box>
          </Box>

          {/* Preview */}
          <Box marginBottom="xl" gap="sm">
            <Text variant="caption" color="textSecondary">
              ANTEPRIMA
            </Text>
            <Box
              flexDirection="row"
              alignItems="center"
              padding="md"
              backgroundColor="surfaceSecondary"
              borderRadius="lg"
            >
              <Box
                width={48}
                height={48}
                borderRadius="md"
                alignItems="center"
                justifyContent="center"
                style={{ backgroundColor: selectedColor }}
              >
                <Icon name={selectedIcon as IconName} size="lg" color="surface" />
              </Box>
              <Box marginLeft="md">
                <Text variant="bodyMedium" weight="semibold">
                  {name || 'Nome spazio'}
                </Text>
                <Text variant="caption" color="textSecondary">
                  1 membro
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Create Button */}
          <Button
            title="Crea spazio"
            onPress={handleCreate}
            loading={isLoading}
            disabled={!name.trim()}
            accessibilityLabel="Crea nuovo spazio"
          />
        </Box>
      </ScrollContainer>
    </BottomSheet>
  );
}
