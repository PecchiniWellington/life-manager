/**
 * Box Atom
 * Componente base per layout, unico punto di accesso a View
 */

import React, { forwardRef } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  ViewProps,
  FlexStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { SpacingKey, RadiusKey, ShadowKey, SemanticColorKey } from '../tokens';

/**
 * Box Props
 */
export interface BoxProps extends Omit<ViewProps, 'style'> {
  // Spacing
  padding?: SpacingKey;
  paddingX?: SpacingKey;
  paddingY?: SpacingKey;
  paddingTop?: SpacingKey;
  paddingBottom?: SpacingKey;
  paddingLeft?: SpacingKey;
  paddingRight?: SpacingKey;
  margin?: SpacingKey;
  marginX?: SpacingKey;
  marginY?: SpacingKey;
  marginTop?: SpacingKey;
  marginBottom?: SpacingKey;
  marginLeft?: SpacingKey;
  marginRight?: SpacingKey;
  gap?: SpacingKey;

  // Layout
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: FlexStyle['flexBasis'];
  flexDirection?: FlexStyle['flexDirection'];
  flexWrap?: FlexStyle['flexWrap'];
  alignItems?: FlexStyle['alignItems'];
  alignSelf?: FlexStyle['alignSelf'];
  justifyContent?: FlexStyle['justifyContent'];
  position?: FlexStyle['position'];
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  zIndex?: number;

  // Sizing
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  minWidth?: ViewStyle['minWidth'];
  minHeight?: ViewStyle['minHeight'];
  maxWidth?: ViewStyle['maxWidth'];
  maxHeight?: ViewStyle['maxHeight'];

  // Appearance
  backgroundColor?: SemanticColorKey;
  borderRadius?: RadiusKey;
  borderTopLeftRadius?: RadiusKey;
  borderTopRightRadius?: RadiusKey;
  borderBottomLeftRadius?: RadiusKey;
  borderBottomRightRadius?: RadiusKey;
  borderWidth?: number;
  borderColor?: SemanticColorKey;
  borderTopWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  overflow?: ViewStyle['overflow'];
  opacity?: number;
  shadow?: ShadowKey;

  // Custom style override (use sparingly)
  style?: ViewStyle;

  children?: React.ReactNode;
}

/**
 * Box Component
 * Atom base per tutti i layout containers
 */
export const Box = forwardRef<View, BoxProps>(function Box(
  {
    // Spacing
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    margin,
    marginX,
    marginY,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    gap,

    // Layout
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    flexDirection,
    flexWrap,
    alignItems,
    alignSelf,
    justifyContent,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,

    // Sizing
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,

    // Appearance
    backgroundColor,
    borderRadius,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius,
    borderWidth,
    borderColor,
    borderTopWidth,
    borderBottomWidth,
    borderLeftWidth,
    borderRightWidth,
    overflow,
    opacity,
    shadow,

    // Other
    style,
    children,
    ...rest
  },
  ref
) {
  const theme = useTheme();

  const computedStyle: ViewStyle = {
    // Spacing
    ...(padding !== undefined && { padding: theme.spacing[padding] }),
    ...(paddingX !== undefined && { paddingHorizontal: theme.spacing[paddingX] }),
    ...(paddingY !== undefined && { paddingVertical: theme.spacing[paddingY] }),
    ...(paddingTop !== undefined && { paddingTop: theme.spacing[paddingTop] }),
    ...(paddingBottom !== undefined && { paddingBottom: theme.spacing[paddingBottom] }),
    ...(paddingLeft !== undefined && { paddingLeft: theme.spacing[paddingLeft] }),
    ...(paddingRight !== undefined && { paddingRight: theme.spacing[paddingRight] }),
    ...(margin !== undefined && { margin: theme.spacing[margin] }),
    ...(marginX !== undefined && { marginHorizontal: theme.spacing[marginX] }),
    ...(marginY !== undefined && { marginVertical: theme.spacing[marginY] }),
    ...(marginTop !== undefined && { marginTop: theme.spacing[marginTop] }),
    ...(marginBottom !== undefined && { marginBottom: theme.spacing[marginBottom] }),
    ...(marginLeft !== undefined && { marginLeft: theme.spacing[marginLeft] }),
    ...(marginRight !== undefined && { marginRight: theme.spacing[marginRight] }),
    ...(gap !== undefined && { gap: theme.spacing[gap] }),

    // Layout
    ...(flex !== undefined && { flex }),
    ...(flexGrow !== undefined && { flexGrow }),
    ...(flexShrink !== undefined && { flexShrink }),
    ...(flexBasis !== undefined && { flexBasis }),
    ...(flexDirection !== undefined && { flexDirection }),
    ...(flexWrap !== undefined && { flexWrap }),
    ...(alignItems !== undefined && { alignItems }),
    ...(alignSelf !== undefined && { alignSelf }),
    ...(justifyContent !== undefined && { justifyContent }),
    ...(position !== undefined && { position }),
    ...(top !== undefined && { top }),
    ...(bottom !== undefined && { bottom }),
    ...(left !== undefined && { left }),
    ...(right !== undefined && { right }),
    ...(zIndex !== undefined && { zIndex }),

    // Sizing
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    ...(minWidth !== undefined && { minWidth }),
    ...(minHeight !== undefined && { minHeight }),
    ...(maxWidth !== undefined && { maxWidth }),
    ...(maxHeight !== undefined && { maxHeight }),

    // Appearance
    ...(backgroundColor !== undefined && {
      backgroundColor: theme.colors[backgroundColor],
    }),
    ...(borderRadius !== undefined && { borderRadius: theme.radius[borderRadius] }),
    ...(borderTopLeftRadius !== undefined && {
      borderTopLeftRadius: theme.radius[borderTopLeftRadius],
    }),
    ...(borderTopRightRadius !== undefined && {
      borderTopRightRadius: theme.radius[borderTopRightRadius],
    }),
    ...(borderBottomLeftRadius !== undefined && {
      borderBottomLeftRadius: theme.radius[borderBottomLeftRadius],
    }),
    ...(borderBottomRightRadius !== undefined && {
      borderBottomRightRadius: theme.radius[borderBottomRightRadius],
    }),
    ...(borderWidth !== undefined && { borderWidth }),
    ...(borderColor !== undefined && { borderColor: theme.colors[borderColor] }),
    ...(borderTopWidth !== undefined && { borderTopWidth }),
    ...(borderBottomWidth !== undefined && { borderBottomWidth }),
    ...(borderLeftWidth !== undefined && { borderLeftWidth }),
    ...(borderRightWidth !== undefined && { borderRightWidth }),
    ...(overflow !== undefined && { overflow }),
    ...(opacity !== undefined && { opacity }),
    ...(shadow !== undefined && theme.shadows[shadow]),
  };

  return (
    <View ref={ref} style={[computedStyle, style]} {...rest}>
      {children}
    </View>
  );
});
