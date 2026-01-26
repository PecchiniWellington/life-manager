/**
 * BaseModal Atom
 * Wrapper per Modal RN con API uniforme
 * ATOM: Può usare componenti nativi RN
 */

import React, { ReactNode, useEffect, useCallback } from 'react';
import {
  Modal as RNModal,
  View,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, radius, sizes, overlay, timings, easings } from '../tokens';
import { useTheme } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============ BaseModal ============

export interface BaseModalProps {
  /** Visibilità */
  visible: boolean;
  /** Callback chiusura */
  onClose: () => void;
  /** Contenuto */
  children: ReactNode;
  /** Tipo di presentazione */
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
  /** Se true, chiude toccando lo sfondo */
  dismissOnBackdrop?: boolean;
  /** Animazione entrata */
  animationType?: 'none' | 'slide' | 'fade';
  /** Colore sfondo overlay */
  overlayColor?: string;
}

export function BaseModal({
  visible,
  onClose,
  children,
  presentationStyle = 'overFullScreen',
  dismissOnBackdrop = true,
  animationType = 'fade',
  overlayColor = overlay.heavy,
}: BaseModalProps): JSX.Element {
  return (
    <RNModal
      visible={visible}
      onRequestClose={onClose}
      transparent={presentationStyle === 'overFullScreen'}
      animationType={animationType}
      presentationStyle={Platform.OS === 'ios' ? presentationStyle : undefined}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {dismissOnBackdrop && (
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]}
            onPress={onClose}
          />
        )}
        <View style={[styles.overlay, !dismissOnBackdrop && { backgroundColor: overlayColor }]} pointerEvents="box-none">
          {children}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

// ============ BottomSheetModal ============

export interface BottomSheetModalProps {
  /** Visibilità */
  visible: boolean;
  /** Callback chiusura */
  onClose: () => void;
  /** Contenuto */
  children: ReactNode;
  /** Altezza massima (default: 90% schermo) */
  maxHeight?: number | string;
  /** Se true, mostra handle */
  showHandle?: boolean;
  /** Se true, chiude toccando lo sfondo */
  dismissOnBackdrop?: boolean;
}

const DISMISS_THRESHOLD = 100; // Soglia in px per chiudere

export function BottomSheetModal({
  visible,
  onClose,
  children,
  maxHeight = '90%',
  showHandle = true,
  dismissOnBackdrop = true,
}: BottomSheetModalProps): JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const maxHeightValue = typeof maxHeight === 'string'
    ? SCREEN_HEIGHT * (parseInt(maxHeight) / 100)
    : maxHeight;

  // Animazioni separate per backdrop e contenuto
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: timings.normal, easing: easings.decelerate });
      translateY.value = withTiming(0, { duration: timings.normal, easing: easings.decelerate });
    } else {
      backdropOpacity.value = withTiming(0, { duration: timings.fast, easing: easings.accelerate });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: timings.fast, easing: easings.accelerate });
    }
  }, [visible]);

  // Pan gesture per swipe down to close
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Solo movimento verso il basso (translateY > 0)
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        // Fade out backdrop proporzionalmente
        backdropOpacity.value = interpolate(
          event.translationY,
          [0, SCREEN_HEIGHT * 0.5],
          [1, 0],
          Extrapolation.CLAMP
        );
      }
    })
    .onEnd((event) => {
      // Se supera la soglia o ha velocità sufficiente, chiudi
      if (event.translationY > DISMISS_THRESHOLD || event.velocityY > 500) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: timings.fast, easing: easings.accelerate });
        backdropOpacity.value = withTiming(0, { duration: timings.fast, easing: easings.accelerate });
        runOnJS(handleClose)();
      } else {
        // Altrimenti torna alla posizione originale
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
        backdropOpacity.value = withTiming(1, { duration: timings.fast });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <RNModal
      visible={visible}
      onRequestClose={onClose}
      transparent
      animationType="none"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Backdrop animato separatamente */}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: overlay.heavy }, backdropStyle]}>
          {dismissOnBackdrop && (
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          )}
        </Animated.View>

        {/* Contenuto che scivola dal basso */}
        <View style={styles.overlay} pointerEvents="box-none">
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.bottomSheetWrapper, sheetStyle]}>
              <View
                style={[
                  styles.bottomSheet,
                  {
                    backgroundColor: theme.colors.surface,
                    maxHeight: maxHeightValue,
                    paddingBottom: insets.bottom + spacing.lg,
                  },
                ]}
              >
                {showHandle && (
                  <View style={styles.handleContainer}>
                    <View
                      style={[
                        styles.handle,
                        { backgroundColor: theme.colors.border },
                      ]}
                    />
                  </View>
                )}
                {children}
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

// ============ CenterModal ============

export interface CenterModalProps {
  /** Visibilità */
  visible: boolean;
  /** Callback chiusura */
  onClose: () => void;
  /** Contenuto */
  children: ReactNode;
  /** Larghezza (default: 90% schermo) */
  width?: number | string;
  /** Se true, chiude toccando lo sfondo */
  dismissOnBackdrop?: boolean;
}

export function CenterModal({
  visible,
  onClose,
  children,
  width = '90%',
  dismissOnBackdrop = true,
}: CenterModalProps): JSX.Element {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const computedWidth = typeof width === 'string'
    ? screenWidth * (parseInt(width) / 100)
    : width;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      dismissOnBackdrop={dismissOnBackdrop}
      animationType="fade"
    >
      <View style={styles.centerWrapper}>
        <View
          style={[
            styles.centerModal,
            {
              backgroundColor: theme.colors.surface,
              width: computedWidth,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </BaseModal>
  );
}

// ============ AlertModal ============

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertModalProps {
  /** Visibilità */
  visible: boolean;
  /** Callback chiusura */
  onClose: () => void;
  /** Titolo */
  title: string;
  /** Messaggio */
  message?: string;
  /** Pulsanti */
  buttons?: AlertButton[];
}

export function AlertModal({
  visible,
  onClose,
  title,
  message,
  buttons = [{ text: 'OK', onPress: onClose }],
}: AlertModalProps): JSX.Element {
  const theme = useTheme();

  return (
    <CenterModal visible={visible} onClose={onClose} width={300}>
      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <Animated.Text
            style={[
              styles.alertTitle,
              { color: theme.colors.textPrimary },
            ]}
          >
            {title}
          </Animated.Text>
          {message && (
            <Animated.Text
              style={[
                styles.alertMessage,
                { color: theme.colors.textSecondary },
              ]}
            >
              {message}
            </Animated.Text>
          )}
        </View>
        <View
          style={[
            styles.alertDivider,
            { backgroundColor: theme.colors.border },
          ]}
        />
        <View style={styles.alertButtons}>
          {buttons.map((button, index) => (
            <Pressable
              key={index}
              onPress={() => {
                button.onPress?.();
                onClose();
              }}
              style={[
                styles.alertButton,
                index > 0 && {
                  borderLeftWidth: StyleSheet.hairlineWidth,
                  borderLeftColor: theme.colors.border,
                },
              ]}
            >
              <Animated.Text
                style={[
                  styles.alertButtonText,
                  {
                    color:
                      button.style === 'destructive'
                        ? theme.colors.error
                        : button.style === 'cancel'
                        ? theme.colors.textSecondary
                        : theme.colors.primary,
                    fontWeight: button.style === 'cancel' ? '400' : '600',
                  },
                ]}
              >
                {button.text}
              </Animated.Text>
            </Pressable>
          ))}
        </View>
      </View>
    </CenterModal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  // Bottom Sheet
  bottomSheetWrapper: {
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: sizes.modalHandle.width,
    height: sizes.modalHandle.height,
    borderRadius: sizes.modalHandle.height / 2,
  },
  // Center Modal
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerModal: {
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  // Alert
  alertContent: {
    minWidth: 270,
  },
  alertHeader: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: sizes.alertFontSize.title,
    fontWeight: '600',
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: sizes.alertFontSize.message,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  alertDivider: {
    height: StyleSheet.hairlineWidth,
  },
  alertButtons: {
    flexDirection: 'row',
  },
  alertButton: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonText: {
    fontSize: sizes.alertFontSize.button,
  },
});
