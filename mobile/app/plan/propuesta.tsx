import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/auth/auth-context';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing } from '@/theme/tokens';

export default function PlanProposalScreen() {
  const router = useRouter();
  const { isConfigured, user } = useAuth();

  return (
    <Screen>
      <ScreenHeader
        description="El próximo ciclo se preparará con el asistente IA y se revisará antes de publicarse."
        onBack={() => router.back()}
        title="Preparar próximo ciclo"
      />

      {!isConfigured ? (
        <Card style={styles.card}>
          <AppText variant="heading">Asistente IA no configurado</AppText>
          <AppText tone="secondary">
            Esta instalación no tiene la conexión remota necesaria para pedir una propuesta. Tus planes y entrenamientos actuales siguen disponibles en este dispositivo.
          </AppText>
        </Card>
      ) : !user ? (
        <Card style={styles.card}>
          <AppText variant="heading">Conecta tu cuenta para continuar</AppText>
          <AppText tone="secondary">
            El asistente IA usa una sesión autenticada y solo enviará el contexto que aceptes para preparar un borrador revisable.
          </AppText>
          <PrimaryButton label="Conectar con correo" onPress={() => router.push('/auth/iniciar-sesion')} />
        </Card>
      ) : (
        <Card style={styles.card}>
          <AppText variant="heading">Asistente IA en preparación</AppText>
          <AppText tone="secondary">
            No usamos plantillas locales para generar planes nuevos. Falta activar y validar el servicio remoto antes de poder enviar una petición.
          </AppText>
          <AppText tone="secondary" variant="caption">
            Cuando esté activo, podrás explicar lo que necesitas con tus palabras y revisar el borrador antes de publicar una nueva versión.
          </AppText>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
});
