import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AppThemeProvider, useAppTheme } from '@/theme/theme-context';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <RootNavigator />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { isHydrated, theme } = useAppTheme();

  useEffect(() => {
    if (isHydrated) {
      void SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return (
    <>
      <StatusBar style={theme.statusBarStyle} />
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sesion/[sessionId]" options={{ headerShown: false }} />
        <Stack.Screen name="ejercicios/[exerciseId]" options={{ headerShown: false }} />
        <Stack.Screen name="perfil/apariencia" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'No encontrada' }} />
      </Stack>
    </>
  );
}
