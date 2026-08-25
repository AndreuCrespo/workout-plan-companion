import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ExerciseFeedbackControl } from '@/components/session/ExerciseFeedbackControl';
import { RestTimerCard } from '@/components/session/RestTimerCard';
import { SessionCompletionSummary } from '@/components/session/SessionCompletionSummary';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { getLatestExercisePerformances } from '@/domain/workout-history';
import type { PreviousExercisePerformance } from '@/domain/workout-history';
import { createWorkoutLog, updateWorkoutLog } from '@/domain/workout-log';
import type { ExerciseFeedback, LoggedSet, WorkoutLog } from '@/domain/models';
import { useProfile } from '@/profile/profile-context';
import { useRestTimer } from '@/session/use-rest-timer';
import { trainingRepository } from '@/repositories/local-training-repository';
import { workoutLogRepository } from '@/repositories/local-workout-log-repository';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

type SessionFlowState = 'ready' | 'in-progress' | 'completed';

function parseNumericValue(value: string): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue.replace(',', '.'));
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null;
}

interface SetInputProps {
  accessibilityLabel: string;
  label: string;
  value: number | null;
  editable: boolean;
  keyboardType: 'decimal-pad' | 'number-pad';
  onChange: (value: number | null) => void;
}

function SetInput({ accessibilityLabel, label, value, editable, keyboardType, onChange }: SetInputProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.setInput}>
      <AppText tone="secondary" variant="caption">{label}</AppText>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        editable={editable}
        keyboardType={keyboardType}
        onChangeText={(nextValue) => onChange(parseNumericValue(nextValue))}
        placeholder="—"
        placeholderTextColor={theme.colors.textSecondary}
        selectTextOnFocus
        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
        value={value?.toString() ?? ''}
      />
    </View>
  );
}

interface LoggedSetRowProps {
  loggedSet: LoggedSet;
  canEdit: boolean;
  loadUnit: string;
  onChange: (changes: Partial<Pick<LoggedSet, 'completed' | 'load' | 'repetitions' | 'rpe'>>) => void;
}

function LoggedSetRow({ loggedSet, canEdit, loadUnit, onChange }: LoggedSetRowProps) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.loggedSet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.loggedSetHeader}>
        <Pressable
          accessibilityLabel={`Serie ${loggedSet.setNumber} de ${loggedSet.exerciseName}`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: loggedSet.completed, disabled: !canEdit }}
          disabled={!canEdit}
          onPress={() => onChange({ completed: !loggedSet.completed })}
          style={({ pressed }) => [
            styles.seriesToggle,
            {
              backgroundColor: loggedSet.completed ? theme.colors.primary : theme.colors.surface,
              borderColor: theme.colors.primaryStrong,
              opacity: pressed || !canEdit ? 0.72 : 1,
            },
          ]}>
          <AppText style={{ color: loggedSet.completed ? theme.colors.onPrimary : theme.colors.primaryStrong }} variant="bodyStrong">
            {loggedSet.completed ? '✓' : loggedSet.setNumber}
          </AppText>
        </Pressable>
        <View style={styles.loggedSetCopy}>
          <AppText variant="bodyStrong">Serie {loggedSet.setNumber}</AppText>
          <AppText tone="secondary" variant="caption">
            Objetivo {loggedSet.target} · Descanso {loggedSet.rest}
          </AppText>
        </View>
      </View>

      <View style={styles.setInputs}>
        <SetInput
          accessibilityLabel={`Carga de la serie ${loggedSet.setNumber} de ${loggedSet.exerciseName}`}
          editable={canEdit}
          keyboardType="decimal-pad"
          label={`Carga (${loadUnit})`}
          onChange={(load) => onChange({ load })}
          value={loggedSet.load}
        />
        <SetInput
          accessibilityLabel={`Repeticiones de la serie ${loggedSet.setNumber} de ${loggedSet.exerciseName}`}
          editable={canEdit}
          keyboardType="number-pad"
          label="Repeticiones"
          onChange={(repetitions) => onChange({ repetitions })}
          value={loggedSet.repetitions}
        />
        <SetInput
          accessibilityLabel={`RPE de la serie ${loggedSet.setNumber} de ${loggedSet.exerciseName}`}
          editable={canEdit}
          keyboardType="decimal-pad"
          label="RPE"
          onChange={(rpe) => onChange({ rpe })}
          value={loggedSet.rpe}
        />
      </View>
    </View>
  );
}

interface PreviousPerformanceProps {
  performance: PreviousExercisePerformance;
  loadUnit: string;
}

function PreviousPerformance({ performance, loadUnit }: PreviousPerformanceProps) {
  const { theme } = useAppTheme();
  const performedDate = new Date(performance.performedAt);
  const dateLabel = Number.isNaN(performedDate.getTime())
    ? 'una sesión anterior'
    : performedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  return (
    <View style={[styles.previousPerformance, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}>
      <AppText tone="primary" variant="caption">Última vez · {dateLabel}</AppText>
      <AppText tone="secondary" variant="caption">
        {performance.sets.map((set) => {
          const load = set.load === null ? 'Sin carga' : `${set.load} ${loadUnit}`;
          const repetitions = set.repetitions === null ? 'sin repeticiones' : `× ${set.repetitions}`;
          const rpe = set.rpe === null ? '' : ` · RPE ${set.rpe}`;
          return `${load} ${repetitions}${rpe}`;
        }).join(' · ')}
      </AppText>
    </View>
  );
}

export default function SessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { profile } = useProfile();
  const { theme } = useAppTheme();
  const session = trainingRepository.getSession(sessionId);
  const plan = trainingRepository.getPlan();
  const [flowState, setFlowState] = useState<SessionFlowState>('ready');
  const [log, setLog] = useState<WorkoutLog | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [previousPerformances, setPreviousPerformances] = useState<PreviousExercisePerformance[]>([]);
  const { timer, start: startRestTimer, pause: pauseRestTimer, resume: resumeRestTimer, restart: restartRestTimer, dismiss: dismissRestTimer } = useRestTimer();

  useEffect(() => {
    let isMounted = true;

    async function hydrateLog() {
      if (!session) {
        if (isMounted) {
          setIsHydrating(false);
        }
        return;
      }

      try {
        const [completedLogs, draft] = await Promise.all([
          workoutLogRepository.getCompletedLogs(),
          workoutLogRepository.getDraft(session.id),
        ]);
        const completedLog = completedLogs.find((storedLog) => storedLog.sessionId === session.id) ?? null;

        if (!isMounted) {
          return;
        }

        setPreviousPerformances(
          getLatestExercisePerformances(completedLogs, session.exercises.map((exercise) => exercise.id), profile?.units ?? 'metric'),
        );
        if (completedLog) {
          setLog(completedLog);
          setFlowState('completed');
        } else if (draft) {
          setLog(draft);
          setFlowState('in-progress');
        } else {
          setLog(null);
          setFlowState('ready');
        }
      } catch {
        if (isMounted) {
          setStorageError(true);
        }
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    }

    void hydrateLog();

    return () => {
      isMounted = false;
    };
  }, [profile?.units, session]);

  const completedSetCount = useMemo(
    () => log?.sets.filter((loggedSet) => loggedSet.completed).length ?? 0,
    [log?.sets],
  );
  const loadUnit = profile?.units === 'imperial' ? 'lb' : 'kg';
  const isCompleted = flowState === 'completed';
  const canEdit = flowState === 'in-progress' && !isCompleted && !isSaving;

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

  async function startSession() {
    if (!session) {
      return;
    }

    const nextLog = createWorkoutLog(plan, session, profile?.units ?? 'metric', previousPerformances);
    setIsSaving(true);
    setStorageError(false);

    try {
      await workoutLogRepository.saveDraft(nextLog);
      setLog(nextLog);
      setFlowState('in-progress');
    } catch {
      setStorageError(true);
    } finally {
      setIsSaving(false);
    }
  }

  function persistLog(nextLog: WorkoutLog) {
    setLog(nextLog);
    setStorageError(false);
    void workoutLogRepository.saveDraft(nextLog).catch(() => setStorageError(true));
  }

  function updateLoggedSet(setId: string, changes: Partial<Pick<LoggedSet, 'completed' | 'load' | 'repetitions' | 'rpe'>>) {
    if (!log || !canEdit) {
      return;
    }

    const currentSet = log.sets.find((loggedSet) => loggedSet.id === setId);
    const nextLog = updateWorkoutLog(log, {
      note: log.note,
      sets: log.sets.map((loggedSet) => (loggedSet.id === setId ? { ...loggedSet, ...changes } : loggedSet)),
      exerciseFeedback: log.exerciseFeedback,
    });
    persistLog(nextLog);

    if (changes.completed === true && !currentSet?.completed && currentSet) {
      startRestTimer(currentSet.exerciseName, currentSet.rest);
    }
  }

  function updateNote(note: string) {
    if (!log || !canEdit) {
      return;
    }

    persistLog(updateWorkoutLog(log, { note, sets: log.sets, exerciseFeedback: log.exerciseFeedback }));
  }

  function updateExerciseFeedback(
    exerciseId: string,
    exerciseName: string,
    changes: Partial<Pick<ExerciseFeedback, 'reaction' | 'note'>>,
  ) {
    if (!log || !canEdit) {
      return;
    }

    const currentFeedback = log.exerciseFeedback.find((feedback) => feedback.exerciseId === exerciseId) ?? {
      exerciseId,
      exerciseName,
      reaction: null,
      note: '',
    };
    const otherFeedback = log.exerciseFeedback.filter((feedback) => feedback.exerciseId !== exerciseId);

    persistLog(
      updateWorkoutLog(log, {
        note: log.note,
        sets: log.sets,
        exerciseFeedback: [...otherFeedback, { ...currentFeedback, ...changes }],
      }),
    );
  }

  async function completeSession() {
    if (!log || flowState !== 'in-progress') {
      return;
    }

    setIsSaving(true);
    setStorageError(false);

    try {
      const completedLog = await workoutLogRepository.complete(log);
      setLog(completedLog);
      setFlowState('completed');
    } catch {
      setStorageError(true);
    } finally {
      setIsSaving(false);
    }
  }

  if (isHydrating) {
    return (
      <Screen>
        <ScreenHeader
          description={`${session.estimatedMinutes} min · ${session.focus}`}
          eyebrow={session.dayLabel}
          onBack={() => router.back()}
          title={session.title}
        />
        <Card style={styles.card}>
          <AppText variant="heading">Cargando tu registro</AppText>
          <AppText tone="secondary">Comprobamos si tienes una sesión en curso o ya guardada.</AppText>
        </Card>
      </Screen>
    );
  }

  const actionLabel = flowState === 'ready' ? 'Empezar sesión' : isCompleted ? 'Sesión guardada' : 'Finalizar y guardar';

  return (
    <Screen>
      <ScreenHeader
        description={`${session.estimatedMinutes} min · ${session.focus}`}
        eyebrow={session.dayLabel}
        onBack={() => router.back()}
        title={session.title}
      />

      <Card style={[styles.statusCard, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}>
        <Pill label={isCompleted ? 'Sesión guardada' : flowState === 'ready' ? 'Lista para empezar' : 'Borrador guardado'} tone="accent" />
        <AppText variant="bodyStrong">
          {isCompleted
            ? 'Este registro queda guardado como parte de esta sesión.'
            : flowState === 'ready'
              ? 'Empieza cuando estés preparado y registra cada serie a tu ritmo.'
              : 'Tus cambios se guardan en este dispositivo mientras entrenas.'}
        </AppText>
        {log ? (
          <AppText tone="secondary" variant="caption">
            {completedSetCount} de {log.sets.length} series marcadas
          </AppText>
        ) : null}
      </Card>

      {timer ? (
        <RestTimerCard
          exerciseName={timer.exerciseName}
          isFinished={timer.isFinished}
          isRunning={timer.isRunning}
          onDismiss={dismissRestTimer}
          onPause={pauseRestTimer}
          onRestart={restartRestTimer}
          onResume={resumeRestTimer}
          remainingSeconds={timer.remainingSeconds}
        />
      ) : null}

      {isCompleted && log ? (
        <SessionCompletionSummary
          displayUnits={profile?.units ?? log.units}
          log={log}
          onOpenProgress={() => router.replace('/progreso')}
        />
      ) : null}

      {storageError ? (
        <Card style={[styles.errorCard, { borderColor: theme.colors.warning }]}>
          <AppText variant="bodyStrong">No pudimos guardar el registro</AppText>
          <AppText tone="secondary" variant="caption">
            Comprueba el almacenamiento del dispositivo e inténtalo de nuevo antes de cerrar la sesión.
          </AppText>
        </Card>
      ) : null}

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
        <AppText variant="heading">Ejercicios</AppText>

        {session.exercises.map((exercise) => {
          const loggedSets = log?.sets.filter((loggedSet) => loggedSet.exerciseId === exercise.id) ?? [];
          const feedback = log?.exerciseFeedback.find((item) => item.exerciseId === exercise.id) ?? {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            reaction: null,
            note: '',
          };
          const previousPerformance = previousPerformances.find((performance) => performance.exerciseId === exercise.id);

          return (
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

              {flowState === 'ready' ? (
                <View style={styles.targetList}>
                  {previousPerformance ? <PreviousPerformance loadUnit={loadUnit} performance={previousPerformance} /> : null}
                  {exercise.sets.map((set) => (
                    <View key={set.target} style={styles.targetRow}>
                      <AppText variant="bodyStrong">{set.target}</AppText>
                      <AppText tone="secondary" variant="caption">
                        Descanso {set.rest}
                      </AppText>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.loggedSetList}>
                  {loggedSets.map((loggedSet) => (
                    <LoggedSetRow
                      canEdit={canEdit}
                      key={loggedSet.id}
                      loadUnit={loadUnit}
                      loggedSet={loggedSet}
                      onChange={(changes) => updateLoggedSet(loggedSet.id, changes)}
                    />
                  ))}
                </View>
              )}

              {flowState !== 'ready' ? (
                <ExerciseFeedbackControl
                  editable={canEdit}
                  feedback={feedback}
                  onChange={(changes) => updateExerciseFeedback(exercise.id, exercise.name, changes)}
                />
              ) : null}

              <PrimaryButton
                accessibilityHint={`Abre instrucciones de ${exercise.name}`}
                label="Ver técnica"
                onPress={() => router.push({ pathname: '/ejercicios/[exerciseId]', params: { exerciseId: exercise.id } })}
                variant="secondary"
              />
            </Card>
          );
        })}
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Cierre</AppText>
        <Card style={styles.card}>
          <AppText>{session.coolDown}</AppText>
          {log ? (
            <TextInput
              accessibilityLabel="Nota opcional de la sesión"
              editable={canEdit}
              multiline
              onChangeText={updateNote}
              placeholder="Añade una nota opcional sobre cómo te has sentido"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.noteInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
              textAlignVertical="top"
              value={log.note}
            />
          ) : null}
        </Card>
      </View>

      <PrimaryButton
        disabled={isCompleted || isSaving}
        label={isSaving ? 'Guardando…' : actionLabel}
        onPress={() => void (flowState === 'ready' ? startSession() : completeSession())}
      />
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
  errorCard: {
    gap: spacing.xs,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
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
  previousPerformance: {
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.xxs,
    padding: spacing.sm,
  },
  targetRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  loggedSetList: {
    gap: spacing.sm,
  },
  loggedSet: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm,
  },
  loggedSetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  seriesToggle: {
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  loggedSetCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  setInputs: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  setInput: {
    flex: 1,
    gap: spacing.xxs,
  },
  input: {
    borderRadius: radius.sm,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.xs,
    textAlign: 'center',
  },
  noteInput: {
    borderRadius: radius.sm,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 96,
    padding: spacing.sm,
  },
});
