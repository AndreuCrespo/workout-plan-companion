import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Card>
        <AppText variant="title">Esta pantalla no existe</AppText>
        <AppText tone="secondary">Vuelve a Hoy para continuar con tu plan.</AppText>
        <PrimaryButton label="Ir a Hoy" onPress={() => router.replace('/')} />
      </Card>
    </Screen>
  );
}
