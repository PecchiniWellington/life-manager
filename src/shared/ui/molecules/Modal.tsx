/**
 * Modal Molecule
 * Componente per dialoghi e modali
 * MOLECULE: Usa solo atoms del design system
 */

import React from 'react';
import {
  Box,
  Heading,
  Pressable,
  Text,
  Icon,
  BottomSheetModal,
  ScrollContainer,
  AnimatedPressable,
} from '../atoms';

/**
 * Modal Props
 */
export interface ModalProps {
  /** Se true, il modal è visibile */
  visible: boolean;
  /** Callback per chiudere il modal */
  onClose: () => void;
  /** Titolo del modal */
  title?: string;
  /** @deprecated Non più usato - le modali si chiudono con swipe down */
  showCloseButton?: boolean;
  /** Abilita scroll interno */
  scrollable?: boolean;
  /** Se true, chiude il modal toccando lo sfondo */
  dismissOnBackdrop?: boolean;
  /** Contenuto del modal */
  children: React.ReactNode;
}

/**
 * Modal Component
 * Si chiude con swipe down o tap sullo sfondo
 */
export function Modal({
  visible,
  onClose,
  title,
  scrollable = false,
  dismissOnBackdrop = true,
  children,
}: ModalProps): JSX.Element {
  // Header solo se c'è un titolo
  const header = title && (
    <Box
      alignItems="center"
      paddingX="lg"
      paddingY="sm"
    >
      <Heading level={5}>{title}</Heading>
    </Box>
  );

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      dismissOnBackdrop={dismissOnBackdrop}
      showHandle
    >
      {header}
      {scrollable ? (
        <ScrollContainer
          fillHeight
          paddingHorizontal="lg"
          paddingTop="sm"
          paddingBottom="lg"
        >
          {children}
        </ScrollContainer>
      ) : (
        <Box
          paddingX="lg"
          paddingTop="sm"
          paddingBottom="lg"
        >
          {children}
        </Box>
      )}
    </BottomSheetModal>
  );
}

/**
 * ConfirmModal Props
 */
export interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

/**
 * ConfirmModal Component
 * Modal di conferma con due azioni
 */
export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  destructive = false,
}: ConfirmModalProps): JSX.Element {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      dismissOnBackdrop={false}
    >
      <Box gap="lg">
        <Text color="textSecondary">{message}</Text>

        <Box flexDirection="row" gap="md">
          <Box flex={1}>
            <AnimatedPressable
              onPress={onClose}
              accessibilityLabel={cancelLabel}
            >
              <Box
                padding="md"
                borderRadius="md"
                backgroundColor="secondary"
                alignItems="center"
              >
                <Text weight="medium">{cancelLabel}</Text>
              </Box>
            </AnimatedPressable>
          </Box>
          <Box flex={1}>
            <AnimatedPressable
              onPress={() => {
                onConfirm();
                onClose();
              }}
              accessibilityLabel={confirmLabel}
            >
              <Box
                padding="md"
                borderRadius="md"
                backgroundColor={destructive ? 'error' : 'primary'}
                alignItems="center"
              >
                <Text weight="medium" color={destructive ? 'onError' : 'onPrimary'}>
                  {confirmLabel}
                </Text>
              </Box>
            </AnimatedPressable>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
