import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Pill } from '@/components/ui/Pill';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import {
  availabilityOptions,
  durationOptions,
  getLimitationsLabel,
  getProfileOptionLabel,
  unitOptions,
} from '@/data/profile-options';
import { useProfile } from '@/profile/profile-context';
import { useAppTheme } from '@/theme/theme-context';
import { spacing } from '@/theme/tokens';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { profile } = useProfile();

  if (!profile) {
    return null;
  }

  const profileName = profile.firstName ? `Perfil de ${profile.firstName}` : 'Tu perfil';
  const weeklyRhythm = `${getProfileOptionLabel(availabilityOptions, profile.availability)} · ${getProfileOptionLabel(durationOptions, profile.sessionDurationMinutes)}`;

  return (
    <Screen>
      <ScreenHeader description="Tus preferencias guiarán próximos planes." title="Perfil" />

      <Card style={styles.profileCard}>
        <Pill label="Perfil local" tone="primary" />
        <View style={styles.copyBlock}>
          <AppText variant="heading">{profileName}</AppText>
          <AppText tone="secondary">{weeklyRhythm}</AppText>
        </View>
        <PrimaryButton
          accessibilityHint="Abre el formulario para cambiar tu perfil"
          label="Editar mi perfil"
          onPress={() => router.push('/perfil/editar')}
          variant="secondary"
        />
      </Card>

      <View style={styles.section}>
        <AppText variant="heading">Tu semana</AppText>
        <ListRow label="Disponibilidad" value={getProfileOptionLabel(availabilityOptions, profile.availability)} />
        <ListRow label="Duración" value={getProfileOptionLabel(durationOptions, profile.sessionDurationMinutes)} />
        <ListRow label="Limitaciones declaradas" value={getLimitationsLabel(profile.limitations)} />
        <ListRow label="Unidades" value={getProfileOptionLabel(unitOptions, profile.units)} />
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
        <AppText variant="bodyStrong">Datos guardados en este dispositivo</AppText>
        <AppText tone="secondary" variant="caption">
          Esta versión no crea una cuenta ni envía información a servicios externos. Podrás editar tu perfil cuando quieras.
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
