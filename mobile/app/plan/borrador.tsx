import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { usePlan } from '@/plan/plan-context';
import { usePlanProposal } from '@/plan-proposal/use-plan-proposal';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

export default function PlanDraftScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { history, publishProposal } = usePlan();
  const { proposal, isLoading, hasError } = usePlanProposal();
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasPublishError, setHasPublishError] = useState(false);

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader onBack={() => router.back()} title="Propuesta del plan" />
        <Card style={styles.card}>
          <AppText variant="heading">Cargando el borrador</AppText>
          <AppText tone="secondary">Recuperamos la propuesta guardada en este dispositivo.</AppText>
        </Card>
      </Screen>
    );
  }

  if (hasError || !proposal) {
    return (
      <Screen>
        <ScreenHeader onBack={() => router.back()} title="Propuesta no disponible" />
        <Card style={styles.card}>
          <AppText variant="heading">No encontramos una propuesta</AppText>
          <AppText tone="secondary">Vuelve a la conversación y genera un borrador para revisarlo aquí.</AppText>
          <PrimaryButton label="Volver a la conversación" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  const selectedWeek = proposal.plan.weeks[selectedWeekIndex];
  const nextVersionLabel = `Versión ${history.length + 1}`;

  function confirmPublication() {
    Alert.alert(
      `Publicar ${nextVersionLabel}`,
      'Este borrador pasará a ser tu plan activo. El plan actual y las sesiones ya guardadas permanecerán en el historial.',
      [
        { style: 'cancel', text: 'Seguir revisando' },
        {
          text: `Publicar ${nextVersionLabel}`,
          onPress: () => void publish(),
        },
      ],
    );
  }

  async function publish() {
    if (!proposal) {
      return;
    }

    setIsPublishing(true);
    setHasPublishError(false);

    try {
      await publishProposal(proposal);
      router.replace('/plan');
    } catch {
      setHasPublishError(true);
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader
        description="Revísalo antes de publicarlo. Tu plan actual no ha cambiado."
        onBack={() => router.back()}
        title="Propuesta del plan"
      />

      <Card style={styles.card}>
        <Pill label="Borrador sin publicar" tone="accent" />
        <AppText variant="heading">{proposal.plan.name}</AppText>
        <AppText tone="secondary">{proposal.plan.version}</AppText>
      </Card>

      <View style={styles.section}>
        <AppText variant="heading">Cambios incluidos</AppText>
        <Card style={styles.card}>
          {proposal.changes.map((change) => (
            <Bullet key={change} text={change} />
          ))}
        </Card>
      </View>

      {proposal.exerciseSubstitutions.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="heading">Alternativas solicitadas</AppText>
          <Card style={styles.card}>
            {proposal.exerciseSubstitutions.map((substitution) => (
              <Bullet
                key={`${substitution.fromExerciseId}:${substitution.toExerciseId}`}
                text={`${substitution.fromExerciseName} → ${substitution.toExerciseName}`}
              />
            ))}
          </Card>
        </View>
      ) : null}

      <View style={styles.section}>
        <AppText variant="heading">Antes de publicar</AppText>
        <Card style={styles.card}>
          {proposal.reviewItems.map((item) => (
            <Bullet key={item} text={item} />
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Cuatro semanas propuestas</AppText>
        <ScrollView horizontal contentContainerStyle={styles.weekPicker} showsHorizontalScrollIndicator={false}>
          {proposal.plan.weeks.map((week, index) => {
            const isSelected = index === selectedWeekIndex;

            return (
              <Pressable
                key={week.number}
                accessibilityLabel={`Semana ${week.number}. ${week.goal}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedWeekIndex(index)}
                style={({ pressed }) => [
                  styles.weekButton,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    opacity: pressed ? 0.72 : 1,
                  },
                ]}>
                <AppText style={{ color: isSelected ? theme.colors.onPrimary : theme.colors.text }} variant="bodyStrong">
                  Semana {week.number}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
        <AppText tone="secondary" variant="caption">{selectedWeek.goal}</AppText>
        {selectedWeek.sessions.map((session) => (
          <Card key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeading}>
              <View style={styles.sessionCopy}>
                <AppText tone="secondary" variant="caption">{session.dayLabel} · {session.estimatedMinutes} min</AppText>
                <AppText variant="heading">{session.title}</AppText>
                <AppText tone="secondary" variant="caption">{session.focus}</AppText>
              </View>
              <Pill label={`${session.exercises.length} ejercicios`} tone="primary" />
            </View>
            <AppText tone="secondary">{session.exercises.map((exercise) => exercise.name).join(' · ')}</AppText>
          </Card>
        ))}
      </View>

      <Card style={styles.card}>
        <AppText variant="heading">Confirmación necesaria</AppText>
        <AppText tone="secondary">
          Al publicar, este borrador será tu plan activo como {nextVersionLabel}. El plan actual y tus registros terminados no se modificarán.
        </AppText>
        {hasPublishError ? (
          <AppText tone="secondary" variant="caption">
            No pudimos publicar este borrador. Puede que el plan activo haya cambiado; vuelve a generar una propuesta antes de intentarlo de nuevo.
          </AppText>
        ) : null}
        <PrimaryButton
          accessibilityHint="Pide confirmación antes de activar este plan"
          disabled={isPublishing}
          label={isPublishing ? 'Publicando…' : `Publicar ${nextVersionLabel}`}
          onPress={confirmPublication}
        />
        <PrimaryButton label="Volver a la conversación" onPress={() => router.back()} variant="secondary" />
      </Card>
    </Screen>
  );
}

interface BulletProps {
  text: string;
}

function Bullet({ text }: BulletProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.bullet}>
      <AppText style={{ color: theme.colors.primaryStrong }} variant="bodyStrong">•</AppText>
      <AppText style={styles.bulletText}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.sm,
  },
  bullet: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
  },
  weekPicker: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  weekButton: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 102,
    paddingHorizontal: spacing.md,
  },
  sessionCard: {
    gap: spacing.sm,
  },
  sessionHeading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  sessionCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
});
