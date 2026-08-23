import type { ExerciseTrendPoint, MonthlyPlan, ProgressSnapshot, WorkoutLog } from '@/domain/models';

const KILOGRAMS_PER_POUND = 0.45359237;

function getCompletedLogsForPlan(plan: MonthlyPlan, logs: WorkoutLog[]): WorkoutLog[] {
  return logs
    .filter((log) => log.status === 'completed' && log.planId === plan.id)
    .sort((firstLog, secondLog) => {
      const firstDate = firstLog.completedAt ?? firstLog.startedAt;
      const secondDate = secondLog.completedAt ?? secondLog.startedAt;
      return firstDate.localeCompare(secondDate);
    });
}

function loadInKilograms(load: number, units: WorkoutLog['units']): number {
  return units === 'imperial' ? load * KILOGRAMS_PER_POUND : load;
}

function formatLogDate(log: WorkoutLog, index: number): string {
  const timestamp = log.completedAt ?? log.startedAt;
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return `Sesión ${index + 1}`;
  }

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function calculateExerciseTrend(logs: WorkoutLog[]): { exerciseName: string | null; exerciseTrend: ExerciseTrendPoint[] } {
  const samplesByExercise = new Map<string, { exerciseName: string; points: ExerciseTrendPoint[] }>();

  logs.forEach((log, logIndex) => {
    const setsByExercise = new Map<string, typeof log.sets>();

    log.sets
      .filter((set) => set.completed && set.load !== null)
      .forEach((set) => {
        const currentSets = setsByExercise.get(set.exerciseId) ?? [];
        setsByExercise.set(set.exerciseId, [...currentSets, set]);
      });

    setsByExercise.forEach((sets, exerciseId) => {
      const bestSet = sets.reduce((best, current) => {
        const currentLoad = loadInKilograms(current.load ?? 0, log.units);
        const bestLoad = loadInKilograms(best.load ?? 0, log.units);
        return currentLoad > bestLoad ? current : best;
      });
      const currentEntry = samplesByExercise.get(exerciseId) ?? {
        exerciseName: bestSet.exerciseName,
        points: [],
      };

      currentEntry.points.push({
        id: log.id,
        label: formatLogDate(log, logIndex),
        loadKg: loadInKilograms(bestSet.load ?? 0, log.units),
      });
      samplesByExercise.set(exerciseId, currentEntry);
    });
  });

  const selectedExercise = [...samplesByExercise.values()].sort((first, second) => second.points.length - first.points.length)[0];

  return selectedExercise
    ? { exerciseName: selectedExercise.exerciseName, exerciseTrend: selectedExercise.points }
    : { exerciseName: null, exerciseTrend: [] };
}

export function calculateProgressSnapshot(plan: MonthlyPlan, logs: WorkoutLog[]): ProgressSnapshot {
  const plannedSessions = plan.weeks.flatMap((week) => week.sessions).filter((session) => session.status !== 'rest');
  const completedLogs = getCompletedLogsForPlan(plan, logs);
  const completedSessionIds = new Set(completedLogs.map((log) => log.sessionId));
  const monthlyVolumeKg = completedLogs.reduce(
    (totalVolume, log) =>
      totalVolume +
      log.sets.reduce((sessionVolume, set) => {
        if (!set.completed || set.load === null || set.repetitions === null) {
          return sessionVolume;
        }

        return sessionVolume + loadInKilograms(set.load, log.units) * set.repetitions;
      }, 0),
    0,
  );
  const latestNote = [...completedLogs]
    .reverse()
    .map((log) => log.note.trim())
    .find((note) => note.length > 0) ?? null;
  const { exerciseName, exerciseTrend } = calculateExerciseTrend(completedLogs);

  return {
    adherencePercent: plannedSessions.length > 0 ? Math.round((completedSessionIds.size / plannedSessions.length) * 100) : 0,
    completedSessions: completedSessionIds.size,
    plannedSessions: plannedSessions.length,
    monthlyVolumeKg: Math.round(monthlyVolumeKg * 10) / 10,
    exerciseName,
    exerciseTrend,
    latestNote,
  };
}

export function convertKilogramsForDisplay(valueInKilograms: number, units: WorkoutLog['units']): number {
  const convertedValue = units === 'imperial' ? valueInKilograms / KILOGRAMS_PER_POUND : valueInKilograms;
  return Math.round(convertedValue * 10) / 10;
}
