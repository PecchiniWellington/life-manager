/**
 * Main Tab Navigator
 * Con AppleTabBar custom e icone vettoriali
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from './types';
import { CalendarStack, TodosStack, WalletStack } from './stacks';
import { useTheme } from '@shared/ui/theme';
import { Icon, IconName, AnimatedPressable, Badge, Box, Text } from '@shared/ui/atoms';
import { springs } from '@shared/ui/tokens';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabIconConfig {
  icon: IconName;
  iconFilled: IconName;
  label: string;
}

const tabConfig: Record<string, TabIconConfig> = {
  CalendarTab: { icon: 'calendar', iconFilled: 'calendarFilled', label: 'Calendario' },
  TodosTab: { icon: 'todo', iconFilled: 'todoFilled', label: 'Todo' },
  WalletTab: { icon: 'wallet', iconFilled: 'walletFilled', label: 'Wallet' },
};

/**
 * Animated Tab Bar Button
 */
function TabBarButton({
  routeName,
  focused,
  onPress,
  badge,
}: {
  routeName: string;
  focused: boolean;
  onPress: () => void;
  badge?: number;
}) {
  const scale = useSharedValue(1);
  const config = tabConfig[routeName];

  const handlePress = () => {
    // Bounce animation
    scale.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withSpring(1.1, springs.bouncy),
      withSpring(1, springs.stiff)
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      haptic="selection"
      pressScale={1}
      style={styles.tabButton}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={config.label}
    >
      <Animated.View style={animatedStyle}>
        <Box position="relative" alignItems="center">
          <Icon
            name={focused ? config.iconFilled : config.icon}
            size="md"
            color={focused ? 'tabBarActive' : 'tabBarInactive'}
          />
          {badge !== undefined && badge > 0 && (
            <Box position="absolute" top={-6} right={-12}>
              <Badge content={badge} size="sm" max={99} />
            </Box>
          )}
        </Box>
      </Animated.View>
      <Text
        variant="caption"
        color={focused ? 'tabBarActive' : 'tabBarInactive'}
        weight={focused ? 'semibold' : 'regular'}
        style={styles.tabLabel}
      >
        {config.label}
      </Text>
    </AnimatedPressable>
  );
}

/**
 * Custom Tab Bar Component
 */
function CustomTabBar({
  state,
  navigation,
}: {
  state: any;
  navigation: any;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: insets.bottom,
          borderTopColor: theme.colors.separator,
        },
      ]}
    >
      {/* Blur background */}
      <BlurView
        intensity={80}
        tint={theme.isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      {/* Tab buttons */}
      <View style={styles.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;

          return (
            <TabBarButton
              key={route.key}
              routeName={route.name}
              focused={focused}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export function MainTabNavigator(): JSX.Element {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="CalendarTab" component={CalendarStack} />
      <Tab.Screen name="TodosTab" component={TodosStack} />
      <Tab.Screen name="WalletTab" component={WalletStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabBarContent: {
    flexDirection: 'row',
    height: 49,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  tabLabel: {
    marginTop: 2,
  },
});
