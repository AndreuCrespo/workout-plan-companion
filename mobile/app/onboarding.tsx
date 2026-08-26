import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { BasicsProfileFields, DetailsProfileFields, TrainingProfileFields } from '@/components/profile/ProfileFormSections';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { createProfileDraft } from '@/domain/profile';
import type { ProfileDraft, ThemeName } from '@/domain/models';
import { useProfile } from '@/profile/profile-context';
import { useAppTheme } from '@/theme/theme-context';
import { spacing } from '@/theme/tokens';

const onboardingSteps = [
  {
    eyebrow: 'Paso 1 de 2',
    title: 'Tu ritmo semanal',
    description: 'Unos pocos detalles para presentar el plan de muestra de forma clara.',
  },
  {
    eyebrow: 'Paso 2 de 2',
    title: 'Últimos ajustes',
    description: 'Podrás cambiar esto desde Perfil cuando lo necesites.',
  },
] as const;

const themeOptions: readonly { value: ThemeName; label: string; description: string }[] = [
  { value: 'verde-activo', label: 'Verde activo', description: 'Claro, cálido y enfocado.' },
  { value: 'grafito-naranja', label: 'Grafito naranja', description: 'Oscuro con acento naranja.' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { saveProfile } = useProfile();
  const { setThemeName, themeName, theme } = useAppTheme();
  const [draft, setDraft] = useState<ProfileDraft>(() => createProfileDraft());
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const currentStep = onboardingSteps[step];
  const isLastStep = step === onboardingSteps.length - 1;

  function updateDraft(changes: Partial<ProfileDraft>) {
    setDraft((currentDraft) => ({ ...currentDraft, ...changes }));
  }

  async function continueOnboarding() {
    if (!isLastStep) {
      setStep(1);
      return;
    }

    setIsSaving(true);
    setSaveError(false);

    try {
      await saveProfile(draft);
      router.replace('/');
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.progressSection}>
        <AppText tone="secondary" variant="label">{currentStep.eyebrow}</AppText>
        <ProgressBar accessibilityLabel={`Progreso del onboarding, ${currentStep.eyebrow}`} value={((step + 1) / onboardingSteps.length) * 100} />
      </View>

      <ScreenHeader description={currentStep.description} title={currentStep.title} />

      {step === 0 ? (
        <View style={styles.stepContent}>
          <BasicsProfileFields draft={draft} onChange={updateDraft} />
          <TrainingProfileFields draft={draft} onChange={updateDraft} />
        </View>
      ) : (
        <View style={styles.stepContent}>
          <DetailsProfileFields draft={draft} onChange={updateDraft} />
          <ChoiceGroup
            description="Se aplica ahora mismo y podrás cambiarlo después en Perfil."
            label="Apariencia"
            onValueChange={setThemeName}
            options={themeOptions}
            value={themeName}
          />
        </View>
      )}

      {saveError ? (
        <Card style={[styles.errorCard, { borderColor: theme.colors.warning }]}>
          <AppText variant="bodyStrong">No pudimos guardar tu perfil</AppText>
          <AppText tone="secondary" variant="caption">
            Comprueba el almacenamiento del dispositivo e inténtalo de nuevo.
          </AppText>
        </Card>
      ) : null}

      <View style={styles.actions}>
        {step > 0 ? (
          <PrimaryButton
            accessibilityHint="Vuelve al paso anterior"
            label="Volver"
            onPress={() => setStep(0)}
            variant="secondary"
          />
        ) : null}
        {step === 0 ? (
          <PrimaryButton
            accessibilityHint="Abre el acceso para recuperar una copia privada existente"
            label="Ya tengo una cuenta"
            onPress={() => router.push('/auth/iniciar-sesion')}
            variant="secondary"
          />
        ) : null}
        <PrimaryButton
          disabled={isSaving}
          label={isLastStep ? (isSaving ? 'Guardando…' : 'Guardar y ver mi plan') : 'Continuar'}
          onPress={() => void continueOnboarding()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
  },
  progressSection: {
    gap: spacing.xs,
  },
  stepContent: {
    gap: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  errorCard: {
    gap: spacing.xs,
  },
});
