/**
 * Modal Molecule
 * Componente per dialoghi e modali
 */

import React from 'react';
import {
  Modal as RNModal,
  ModalProps as RNModalProps,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, Heading, Pressable, Text, Icon } from '../atoms';
import { useTheme } from '../theme';

/**
 * Modal Props
 */
export interface ModalProps extends Omit<RNModalProps, 'animationType' | 'transparent'> {
  /** Se true, il modal è visibile */
  visible: boolean;
  /** Callback per chiudere il modal */
  onClose: () => void;
  /** Titolo del modal */
  title?: string;
  /** Se true, mostra il pulsante di chiusura */
  showCloseButton?: boolean;
  /** Tipo di animazione */
  animation?: 'slide' | 'fade' | 'none';
  /** Se true, chiude il modal toccando lo sfondo */
  dismissOnBackdrop?: boolean;
  /** Abilita scroll interno */
  scrollable?: boolean;
  /** Contenuto del modal */
  children: React.ReactNode;
}

/**
 * Modal Component
 */
export function Modal({
  visible,
  onClose,
  title,
  showCloseButton = true,
  animation = 'slide',
  dismissOnBackdrop = true,
  scrollable = false,
  children,
  ...rest
}: ModalProps): JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleBackdropPress = () => {
    Keyboard.dismiss();
    if (dismissOnBackdrop) {
      onClose();
    }
  };

  const content = (
    <>
      {/* Header */}
      {(title || showCloseButton) && (
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          marginBottom="lg"
        >
          {title ? (
            <Heading level={5}>{title}</Heading>
          ) : (
            <Box />
          )}
          {showCloseButton && (
            <Pressable
              onPress={onClose}
              accessibilityLabel="Chiudi"
              padding="xs"
            >
              <Icon name="close" size="md" color="textSecondary" />
            </Pressable>
          )}
        </Box>
      )}

      {/* Content */}
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </>
  );

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animation}
      onRequestClose={onClose}
      {...rest}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Box
            flex={1}
            backgroundColor="background"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            justifyContent="flex-end"
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Box
                backgroundColor="surface"
                borderTopLeftRadius="xl"
                borderTopRightRadius="xl"
                padding="lg"
                maxHeight="90%"
              >
                {content}
              </Box>
            </TouchableWithoutFeedback>
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </RNModal>
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
            <Pressable
              onPress={onClose}
              padding="md"
              borderRadius="md"
              backgroundColor="secondary"
              alignItems="center"
              accessibilityLabel={cancelLabel}
            >
              <Text weight="medium">{cancelLabel}</Text>
            </Pressable>
          </Box>
          <Box flex={1}>
            <Pressable
              onPress={() => {
                onConfirm();
                onClose();
              }}
              padding="md"
              borderRadius="md"
              backgroundColor={destructive ? 'error' : 'primary'}
              alignItems="center"
              accessibilityLabel={confirmLabel}
            >
              <Text weight="medium" color={destructive ? 'onError' : 'onPrimary'}>
                {confirmLabel}
              </Text>
            </Pressable>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
