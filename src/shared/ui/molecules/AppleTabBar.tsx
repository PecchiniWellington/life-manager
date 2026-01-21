/**
 * AppleTabBar
 * Tab bar Apple-style con blur, badge e animazioni
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../atoms/AnimatedPressable';
import { Icon, IconName } from '../atoms/Icon';
import { Text } from '../atoms/Text';
import { Badge } from '../atoms/Badge';
import { Box } from '../atoms/Box';
import { useTheme } from '../theme';
import { springs } from '../tokens';

export interface TabItem {
  /** Chiave univoca */
  key: string;
  /** Label visualizzata */
  label: string;
  /** Icona outline (inactive state) */
  icon: IconName;
  /** Icona filled (active state) - opzionale */
  iconFilled?: IconName;
  /** Badge count (opzionale) */
  badge?: number;
}

export interface AppleTabBarProps {
  /** Tab disponibili */
  tabs: TabItem[];
  /** Tab attiva */
  activeTab: string;
  /** Callback cambio tab */
  onTabPress: (key: string) => void;
  /** Mostra blur background */
  showBlur?: boolean;
  /** Mostra labels */
  showLabels?: boolean;
}

/**
 * Tab Bar Item Component
 */
function TabBarItem({
  tab,
  isActive,
  onPress,
  showLabel,
}: {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
  showLabel: boolean;
}) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  // Bounce animation on press
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withSpring(1.1, springs.bouncy),
      withSpring(1, springs.stiff)
    );
    onPress();
  };

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      haptic="selection"
      pressScale={1} // We handle animation manually
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
    >
      <Animated.View style={iconAnimatedStyle}>
        <Box position="relative">
          <Icon
            name={isActive && tab.iconFilled ? tab.iconFilled : tab.icon}
            size="md"
            color={isActive ? 'tabBarActive' : 'tabBarInactive'}
          />
          {tab.badge !== undefined && tab.badge > 0 && (
            <Box position="absolute" top={-6} right={-10}>
              <Badge
                content={tab.badge}
                size="sm"
                max={99}
              />
            </Box>
          )}
        </Box>
      </Animated.View>

      {showLabel && (
        <Text
          variant="caption"
          color={isActive ? 'tabBarActive' : 'tabBarInactive'}
          weight={isActive ? 'semibold' : 'regular'}
          style={styles.label}
        >
          {tab.label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

/**
 * AppleTabBar Component
 * Tab bar con stile iOS nativo
 */
export function AppleTabBar({
  tabs,
  activeTab,
  onTabPress,
  showBlur = true,
  showLabels = true,
}: AppleTabBarProps): JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Calculate height with safe area
  const tabBarHeight = 49 + insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          borderTopColor: theme.colors.separator,
        },
      ]}
    >
      {/* Blur background */}
      {showBlur && (
        <BlurView
          intensity={80}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Fallback solid background (when blur not visible) */}
      {!showBlur && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.tabBarBackground },
          ]}
        />
      )}

      {/* Tab items */}
      <View style={styles.content}>
        {tabs.map((tab) => (
          <TabBarItem
            key={tab.key}
            tab={tab}
            isActive={tab.key === activeTab}
            onPress={() => onTabPress(tab.key)}
            showLabel={showLabels}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 49,
  },
  label: {
    marginTop: 2,
  },
});

export default AppleTabBar;
