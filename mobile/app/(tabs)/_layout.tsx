import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import type { ColorValue } from 'react-native';

import { useAppTheme } from '@/theme/theme-context';

export default function TabLayout() {
  const { theme } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.primaryStrong,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: [styles.tabBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }],
      }}>
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
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabBar: {
    borderTopWidth: 1,
    height: Platform.select({ ios: 82, default: 68 }),
    paddingTop: 6,
  },
});
