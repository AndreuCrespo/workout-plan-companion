import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Pill } from '@/components/ui/Pill';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { trainingRepository } from '@/repositories/local-training-repository';
import { useAppTheme } from '@/theme/theme-context';
import { spacing } from '@/theme/tokens';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const profile = trainingRepository.getProfile();

  return (
    <Screen>
      <ScreenHeader description="Tus preferencias guiarán próximos planes." title="Perfil" />

      <Card style={styles.profileCard}>
        <Pill label="Perfil local" tone="primary" />
        <View style={styles.copyBlock}>
          <AppText variant="heading">Objetivo actual</AppText>
          <AppText tone="secondary">{profile.primaryGoal}</AppText>
        </View>
      </Card>

      <View style={styles.section}>
        <AppText variant="heading">Tu contexto</AppText>
        <ListRow label="Experiencia" value={profile.experience} />
        <ListRow label="Disponibilidad" value={profile.availability} />
        <ListRow label="Duración" value={profile.sessionDuration} />
        <ListRow label="Equipamiento" value={profile.equipment} />
        <ListRow label="Limitaciones declaradas" value={profile.limitations} />
        <ListRow label="Unidades" value={profile.units} />
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Preferencias</AppText>
        <ListRow
          accessibilityHint="Abre el selector de temas"
          label="Apariencia"
          onPress={() => router.push('/perfil/apariencia')}
          value={theme.label}
        />
      </View>

      <Card style={styles.privacyCard}>
        <AppText variant="bodyStrong">Datos de muestra en este dispositivo</AppText>
        <AppText tone="secondary" variant="caption">
          Esta primera entrega no crea una cuenta ni envía información a servicios externos.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    gap: spacing.sm,
  },
  copyBlock: {
    gap: spacing.xxs,
  },
  section: {
    gap: spacing.sm,
  },
  privacyCard: {
    gap: spacing.xs,
  },
});
