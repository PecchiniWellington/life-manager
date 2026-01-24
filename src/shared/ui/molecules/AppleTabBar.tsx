/**
 * AppleTabBar
 * Tab bar Apple-style con blur, badge e animazioni
 * MOLECULE: Usa solo atoms del design system
 */

import React from 'react';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable, Icon, IconName, Text, Badge, Box } from '../atoms';
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
      pressScale={1}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
    >
      <Box flex={1} alignItems="center" justifyContent="center" paddingVertical="xs" minHeight={49}>
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
          <Box marginTop="xxs">
            <Text
              variant="caption"
              color={isActive ? 'tabBarActive' : 'tabBarInactive'}
              weight={isActive ? 'semibold' : 'regular'}
            >
              {tab.label}
            </Text>
          </Box>
        )}
      </Box>
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
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      height={tabBarHeight}
      paddingBottom={insets.bottom}
      borderTopWidth={1}
      borderColor="separator"
    >
      {/* Blur background */}
      {showBlur && (
        <BlurView
          intensity={80}
          tint={theme.isDark ? 'dark' : 'light'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}

      {/* Fallback solid background */}
      {!showBlur && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="tabBarBackground"
        />
      )}

      {/* Tab items */}
      <Box flex={1} flexDirection="row" justifyContent="space-around" alignItems="center">
        {tabs.map((tab) => (
          <TabBarItem
            key={tab.key}
            tab={tab}
            isActive={tab.key === activeTab}
            onPress={() => onTabPress(tab.key)}
            showLabel={showLabels}
          />
        ))}
      </Box>
    </Box>
  );
}

export default AppleTabBar;
