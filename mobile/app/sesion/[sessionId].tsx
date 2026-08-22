import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { trainingRepository } from '@/repositories/local-training-repository';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

type SessionFlowState = 'ready' | 'in-progress' | 'completed';

export default function SessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { theme } = useAppTheme();
  const session = trainingRepository.getSession(sessionId);
  const [flowState, setFlowState] = useState<SessionFlowState>('ready');
  const [completedSeries, setCompletedSeries] = useState<string[]>([]);
  const [note, setNote] = useState('');

  if (!session) {
    return (
      <Screen>
        <ScreenHeader onBack={() => router.replace('/plan')} title="Sesión no disponible" />
        <Card style={styles.card}>
          <AppText variant="heading">No encontramos esta sesión.</AppText>
          <AppText tone="secondary">Vuelve a Mi plan para elegir una sesión de muestra disponible.</AppText>
          <PrimaryButton label="Ir a Mi plan" onPress={() => router.replace('/plan')} />
        </Card>
      </Screen>
    );
  }

  function toggleSeries(seriesId: string) {
    setCompletedSeries((current) =>
      current.includes(seriesId) ? current.filter((item) => item !== seriesId) : [...current, seriesId],
    );
  }

  function advanceSession() {
    if (flowState === 'ready') {
      setFlowState('in-progress');
      return;
    }
    if (flowState === 'in-progress') {
      setFlowState('completed');
    }
  }

  const trackedSeriesCount = 3;
  const isComplete = flowState === 'completed';
  const actionLabel = flowState === 'ready' ? 'Empezar sesión' : isComplete ? 'Sesión completada' : 'Finalizar sesión';

  return (
    <Screen>
      <ScreenHeader
        description={`${session.estimatedMinutes} min · ${session.focus}`}
        eyebrow={session.dayLabel}
        onBack={() => router.back()}
        title={session.title}
      />

      <Card style={[styles.statusCard, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}>
        <Pill label={isComplete ? 'Registro simulado completado' : flowState === 'ready' ? 'Lista para empezar' : 'Sesión en curso'} tone="accent" />
        <AppText variant="bodyStrong">
          {isComplete ? 'Has marcado la sesión como completada.' : 'Registra solo lo que te resulte útil durante el entrenamiento.'}
        </AppText>
        <AppText tone="secondary" variant="caption">
          {isComplete && note.trim().length > 0
            ? 'Tu nota queda mostrada en este flujo de muestra.'
            : 'Los registros de esta primera entrega son datos simulados y no se envían fuera del dispositivo.'}
        </AppText>
      </Card>

      <View style={styles.section}>
        <AppText variant="heading">Calentamiento</AppText>
        <Card style={styles.card}>
          {session.warmUp.map((step, index) => (
            <View key={step} style={styles.bulletRow}>
              <AppText style={{ color: theme.colors.primaryStrong }} variant="bodyStrong">
                {index + 1}
              </AppText>
              <AppText style={styles.bulletText}>{step}</AppText>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <AppText variant="heading">Ejercicios</AppText>
          <AppText tone="secondary" variant="caption">
            {completedSeries.length}/{trackedSeriesCount} series marcadas
          </AppText>
        </View>

        {session.exercises.map((exercise, exerciseIndex) => (
          <Card key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeading}>
              <View style={styles.exerciseTitle}>
                <Pill label={exercise.equipment} tone="primary" />
                <AppText variant="heading">{exercise.name}</AppText>
              </View>
              <AppText tone="secondary" variant="caption">
                {exercise.coachingCue}
              </AppText>
            </View>

            <View style={styles.targetList}>
              {exercise.sets.map((set) => (
                <View key={set.target} style={styles.targetRow}>
                  <AppText variant="bodyStrong">{set.target}</AppText>
                  <AppText tone="secondary" variant="caption">
                    Descanso {set.rest}
                  </AppText>
                </View>
              ))}
            </View>

            {exerciseIndex === 0 ? (
              <View style={styles.logger}>
                <AppText tone="secondary" variant="caption">
                  Registro rápido de ejemplo
                </AppText>
                {[1, 2, 3].map((seriesNumber) => {
                  const seriesId = `${exercise.id}-${seriesNumber}`;
                  const isSeriesCompleted = completedSeries.includes(seriesId);
                  return (
                    <View key={seriesId} style={styles.seriesRow}>
                      <Pressable
                        accessibilityLabel={`Serie ${seriesNumber}`}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isSeriesCompleted }}
                        disabled={flowState !== 'in-progress' || isComplete}
                        onPress={() => toggleSeries(seriesId)}
                        style={({ pressed }) => [
                          styles.seriesToggle,
                          {
                            backgroundColor: isSeriesCompleted ? theme.colors.primary : theme.colors.surface,
                            borderColor: theme.colors.primaryStrong,
                            opacity: pressed || flowState !== 'in-progress' || isComplete ? 0.72 : 1,
                          },
                        ]}>
                        <AppText style={{ color: isSeriesCompleted ? theme.colors.onPrimary : theme.colors.primaryStrong }} variant="bodyStrong">
                          {isSeriesCompleted ? '✓' : seriesNumber}
                        </AppText>
                      </Pressable>
                      <TextInput
                        accessibilityLabel={`Carga de la serie ${seriesNumber}`}
                        editable={flowState === 'in-progress' && !isComplete}
                        keyboardType="decimal-pad"
                        placeholder="kg"
                        placeholderTextColor={theme.colors.textSecondary}
                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                      />
                      <TextInput
                        accessibilityLabel={`Repeticiones de la serie ${seriesNumber}`}
                        editable={flowState === 'in-progress' && !isComplete}
                        keyboardType="number-pad"
                        placeholder="reps"
                        placeholderTextColor={theme.colors.textSecondary}
                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                      />
                    </View>
                  );
                })}
              </View>
            ) : null}

            <PrimaryButton
              accessibilityHint={`Abre instrucciones de ${exercise.name}`}
              label="Ver técnica"
              onPress={() => router.push({ pathname: '/ejercicios/[exerciseId]', params: { exerciseId: exercise.id } })}
              variant="secondary"
            />
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Cierre</AppText>
        <Card style={styles.card}>
          <AppText>{session.coolDown}</AppText>
          <TextInput
            accessibilityLabel="Nota opcional de la sesión"
            editable={!isComplete}
            multiline
            onChangeText={setNote}
            placeholder="Añade una nota opcional sobre cómo te has sentido"
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.noteInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
            textAlignVertical="top"
            value={note}
          />
        </Card>
      </View>

      <PrimaryButton disabled={isComplete} label={actionLabel} onPress={advanceSession} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.sm,
  },
  statusCard: {
    gap: spacing.sm,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
  },
  rowBetween: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  exerciseCard: {
    gap: spacing.md,
  },
  exerciseHeading: {
    gap: spacing.xs,
  },
  exerciseTitle: {
    gap: spacing.xs,
  },
  targetList: {
    gap: spacing.xs,
  },
  targetRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  logger: {
    gap: spacing.xs,
  },
  seriesRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  seriesToggle: {
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  input: {
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  noteInput: {
    borderRadius: radius.sm,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 96,
    padding: spacing.sm,
  },
});
