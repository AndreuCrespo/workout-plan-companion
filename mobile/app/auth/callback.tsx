import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { useAuth } from '@/auth/auth-context';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { authError, isHydrated, user } = useAuth();

  useEffect(() => {
    if (isHydrated && user) {
      router.replace('/(tabs)/perfil');
    }
  }, [isHydrated, router, user]);

  return (
    <Screen>
      <ScreenHeader title="Acceso a la cuenta" />
      <Card style={styles.card}>
        <AppText variant="heading">{authError ? 'No pudimos completar el acceso' : 'Conectando tu cuenta'}</AppText>
        <AppText tone="secondary">
          {authError ?? 'Verificamos el enlace de acceso. Esto puede tardar unos segundos.'}
        </AppText>
        {authError ? <PrimaryButton label="Volver a Cuenta" onPress={() => router.replace('/auth/iniciar-sesion')} /> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
});
