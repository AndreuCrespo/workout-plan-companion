import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/theme-context';

export default function TabLayout() {
  const { theme } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
      tabBar={(props) => <AppTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoy',
          tabBarAccessibilityLabel: 'Ir a Hoy',
          tabBarIcon: ({ color }) => <TabIcon color={color} ios="house.fill" android="home" web="home" />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Mi plan',
          tabBarAccessibilityLabel: 'Ir a Mi plan',
          tabBarIcon: ({ color }) => <TabIcon color={color} ios="calendar" android="calendar_month" web="calendar_month" />,
        }}
      />
      <Tabs.Screen
        name="progreso"
        options={{
          title: 'Progreso',
          tabBarAccessibilityLabel: 'Ir a Progreso',
          tabBarIcon: ({ color }) => <TabIcon color={color} ios="chart.line.uptrend.xyaxis" android="trending_up" web="trending_up" />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Ir a Perfil',
          tabBarIcon: ({ color }) => <TabIcon color={color} ios="person.crop.circle" android="person" web="person" />,
        }}
      />
    </Tabs>
  );
}

function AppTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: insets.bottom + 8,
        },
      ]}>
      <View style={styles.tabActions}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const options = descriptors[route.key].options;
          const color = isFocused ? theme.colors.primaryStrong : theme.colors.textSecondary;
          const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name;

          function onPress() {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: 'tabPress',
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          return (
            <Pressable
              accessibilityLabel={options.tabBarAccessibilityLabel ?? `Ir a ${label}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              key={route.key}
              onLongPress={() => navigation.emit({ target: route.key, type: 'tabLongPress' })}
              onPress={onPress}
              style={({ pressed }) => [styles.tabAction, pressed && styles.tabActionPressed]}>
              {options.tabBarIcon?.({ color, focused: isFocused, size: 24 })}
              <Text allowFontScaling numberOfLines={1} style={[styles.tabLabel, { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface TabIconProps {
  color: ColorValue;
  ios: 'house.fill' | 'calendar' | 'chart.line.uptrend.xyaxis' | 'person.crop.circle';
  android: 'home' | 'calendar_month' | 'trending_up' | 'person';
  web: 'home' | 'calendar_month' | 'trending_up' | 'person';
}

function TabIcon({ color, ios, android, web }: TabIconProps) {
  return <SymbolView name={{ ios, android, web }} size={24} tintColor={color} />;
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
  },
  tabActions: {
    flexDirection: 'row',
    minHeight: 64,
  },
  tabAction: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: 48,
  },
  tabActionPressed: {
    opacity: 0.72,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
