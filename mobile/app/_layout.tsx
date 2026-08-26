import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/auth/auth-context';
import { PlanProvider, usePlan } from '@/plan/plan-context';
import { ProfileProvider, useProfile } from '@/profile/profile-context';
import { AppThemeProvider, useAppTheme } from '@/theme/theme-context';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AuthProvider>
          <PlanProvider>
            <ProfileProvider>
              <RootNavigator />
            </ProfileProvider>
          </PlanProvider>
        </AuthProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { isHydrated: isThemeHydrated, theme } = useAppTheme();
  const { isHydrated: isAuthHydrated } = useAuth();
  const { isHydrated: isPlanHydrated } = usePlan();
  const { isHydrated: isProfileHydrated, profile } = useProfile();
  const isHydrated = isThemeHydrated && isAuthHydrated && isPlanHydrated && isProfileHydrated;
  const hasProfile = profile !== null;

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
      <Stack initialRouteName={hasProfile ? '(tabs)' : 'onboarding'} screenOptions={{ contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Protected guard={!hasProfile}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={hasProfile}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="sesion/[sessionId]" options={{ headerShown: false }} />
          <Stack.Screen name="ejercicios/[exerciseId]" options={{ headerShown: false }} />
          <Stack.Screen name="perfil/apariencia" options={{ headerShown: false }} />
          <Stack.Screen name="perfil/editar" options={{ headerShown: false }} />
          <Stack.Screen name="plan/propuesta" options={{ headerShown: false }} />
          <Stack.Screen name="plan/borrador" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="auth/iniciar-sesion" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="auth/recuperar-copia" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'No encontrada' }} />
      </Stack>
    </>
  );
}
