import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { BasicsProfileFields, DetailsProfileFields, TrainingProfileFields } from '@/components/profile/ProfileFormSections';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { createProfileDraft, toProfileDraft } from '@/domain/profile';
import type { ProfileDraft } from '@/domain/models';
import { useProfile } from '@/profile/profile-context';
import { useAppTheme } from '@/theme/theme-context';
import { spacing } from '@/theme/tokens';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();
  const { theme } = useAppTheme();
  const [draft, setDraft] = useState<ProfileDraft>(() => (profile ? toProfileDraft(profile) : createProfileDraft()));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  if (!profile) {
    return null;
  }

  function updateDraft(changes: Partial<ProfileDraft>) {
    setDraft((currentDraft) => ({ ...currentDraft, ...changes }));
  }

  async function saveChanges() {
    setIsSaving(true);
    setSaveError(false);

    try {
      await saveProfile(draft);
      router.back();
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader
        description="Actualiza lo que necesites. Estos cambios guiarán planes futuros, no reescriben sesiones registradas."
        onBack={() => router.back()}
        title="Editar perfil"
      />

      <View style={styles.section}>
        <AppText variant="heading">Tu semana</AppText>
        <BasicsProfileFields draft={draft} onChange={updateDraft} />
        <TrainingProfileFields draft={draft} onChange={updateDraft} />
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Detalles</AppText>
        <DetailsProfileFields draft={draft} onChange={updateDraft} />
      </View>

      {saveError ? (
        <Card style={[styles.errorCard, { borderColor: theme.colors.warning }]}>
          <AppText variant="bodyStrong">No pudimos guardar los cambios</AppText>
          <AppText tone="secondary" variant="caption">
            Comprueba el almacenamiento del dispositivo e inténtalo de nuevo.
          </AppText>
        </Card>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton
          disabled={isSaving}
          label={isSaving ? 'Guardando…' : 'Guardar cambios'}
          onPress={() => void saveChanges()}
        />
        <PrimaryButton label="Cancelar" onPress={() => router.back()} variant="secondary" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  errorCard: {
    gap: spacing.xs,
  },
});
