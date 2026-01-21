/**
 * BottomSheet
 * Bottom sheet Apple-style con gesture e backdrop fullscreen
 */

import React, { useCallback, useMemo, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { StyleSheet, View, Keyboard } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '../atoms/Box';
import { Text } from '../atoms/Text';
import { AnimatedPressable } from '../atoms/AnimatedPressable';
import { Icon } from '../atoms/Icon';
import { useTheme } from '../theme';
import { radius, shadows } from '../tokens';

export interface BottomSheetRef {
  open: (index?: number) => void;
  close: () => void;
  snapTo: (index: number) => void;
}

export interface BottomSheetProps {
  /** Stato apertura controllato */
  isOpen?: boolean;
  /** Snap points (percentuali o valori assoluti) */
  snapPoints?: (string | number)[];
  /** Callback alla chiusura */
  onClose?: () => void;
  /** Callback al cambio di index */
  onChange?: (index: number) => void;
  /** Titolo header */
  title?: string;
  /** Mostra handle */
  showHandle?: boolean;
  /** Mostra pulsante chiudi */
  showCloseButton?: boolean;
  /** Abilita backdrop blur */
  blurBackdrop?: boolean;
  /** Abilita scroll interno */
  scrollable?: boolean;
  /** Chiudi cliccando sul backdrop */
  closeOnBackdrop?: boolean;
  /** Chiudi tastiera all'apertura */
  dismissKeyboardOnOpen?: boolean;
  children: React.ReactNode;
}

/**
 * BottomSheet Component
 * Sheet modale dal basso con gesture Apple-style
 * Usa BottomSheetModal per backdrop fullscreen
 */
export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  function BottomSheet(
    {
      isOpen,
      snapPoints: customSnapPoints,
      onClose,
      onChange,
      title,
      showHandle = true,
      showCloseButton = true,
      blurBackdrop = true,
      scrollable = false,
      closeOnBackdrop = true,
      dismissKeyboardOnOpen = true,
      children,
    },
    ref
  ) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    // Default snap points
    const snapPoints = useMemo(
      () => customSnapPoints || ['50%', '90%'],
      [customSnapPoints]
    );

    // Handle controlled isOpen prop
    useEffect(() => {
      if (isOpen !== undefined) {
        if (isOpen) {
          if (dismissKeyboardOnOpen) {
            Keyboard.dismiss();
          }
          bottomSheetRef.current?.present();
        } else {
          bottomSheetRef.current?.dismiss();
        }
      }
    }, [isOpen, dismissKeyboardOnOpen]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      open: () => {
        if (dismissKeyboardOnOpen) {
          Keyboard.dismiss();
        }
        bottomSheetRef.current?.present();
      },
      close: () => {
        bottomSheetRef.current?.dismiss();
      },
      snapTo: (index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
      },
    }));

    // Handle dismiss
    const handleDismiss = useCallback(() => {
      onClose?.();
    }, [onClose]);

    // Handle change
    const handleSheetChange = useCallback(
      (index: number) => {
        onChange?.(index);
      },
      [onChange]
    );

    // Render backdrop
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          pressBehavior={closeOnBackdrop ? 'close' : 'none'}
        />
      ),
      [closeOnBackdrop]
    );

    // Render handle indicator
    const renderHandle = useCallback(
      () =>
        showHandle ? (
          <Box alignItems="center" paddingY="sm">
            <View
              style={[
                styles.handle,
                { backgroundColor: theme.colors.separatorOpaque },
              ]}
            />
          </Box>
        ) : null,
      [showHandle, theme.colors.separatorOpaque]
    );

    // Content wrapper
    const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        onDismiss={handleDismiss}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: radius.sheet,
          borderTopRightRadius: radius.sheet,
        }}
        style={shadows.sheet}
      >
        <ContentWrapper
          style={[styles.contentContainer, { paddingBottom: insets.bottom }]}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              paddingX="lg"
              paddingBottom="md"
              borderBottomWidth={1}
              borderColor="separator"
            >
              <Box flex={1}>
                {title && (
                  <Text variant="headingSmall" weight="semibold">
                    {title}
                  </Text>
                )}
              </Box>

              {showCloseButton && (
                <AnimatedPressable
                  onPress={() => bottomSheetRef.current?.dismiss()}
                  haptic="light"
                  style={[
                    styles.closeButton,
                    { backgroundColor: theme.colors.backgroundTertiary },
                  ]}
                >
                  <Icon name="close" size="sm" color="textSecondary" />
                </AnimatedPressable>
              )}
            </Box>
          )}

          {/* Content */}
          <Box flex={1} paddingX="lg" paddingTop="md">
            {children}
          </Box>
        </ContentWrapper>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  contentContainer: {
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomSheet;
