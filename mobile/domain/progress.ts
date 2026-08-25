import { loadForDisplay, loadInKilograms } from '@/domain/measurements';
import type {
  ActivityDay,
  ExercisePersonalRecord,
  ExerciseTrendPoint,
  MeasurementUnits,
  MonthlyPlan,
  ProgressSnapshot,
  WorkoutLog,
} from '@/domain/models';

export const ESTIMATED_ONE_REP_MAX_REPETITION_CAP = 12;
const ACTIVITY_DAY_COUNT = 84;

function getCompletedLogs(logs: WorkoutLog[]): WorkoutLog[] {
  return logs
    .filter((log) => log.status === 'completed')
    .sort((firstLog, secondLog) => {
      const firstDate = firstLog.completedAt ?? firstLog.startedAt;
      const secondDate = secondLog.completedAt ?? secondLog.startedAt;
      return firstDate.localeCompare(secondDate);
    });
}

function getCompletedLogsForPlan(plan: MonthlyPlan, logs: WorkoutLog[]): WorkoutLog[] {
  return getCompletedLogs(logs).filter((log) => log.planId === plan.id);
}

function formatLogDate(log: WorkoutLog, index: number): string {
  const timestamp = log.completedAt ?? log.startedAt;
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return `Sesión ${index + 1}`;
  }

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function isMoreRecent(firstTimestamp: string, secondTimestamp: string): boolean {
  return firstTimestamp.localeCompare(secondTimestamp) > 0;
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function activityDayKey(log: WorkoutLog): string | null {
  const date = new Date(log.completedAt ?? log.startedAt);
  return Number.isNaN(date.getTime()) ? null : localDateKey(date);
}

function createActivityDays(logs: WorkoutLog[], now: Date): ActivityDay[] {
  const completedSessionsByDay = new Map<string, number>();

  getCompletedLogs(logs).forEach((log) => {
    const day = activityDayKey(log);

    if (day) {
      completedSessionsByDay.set(day, (completedSessionsByDay.get(day) ?? 0) + 1);
    }
  });

  const lastDay = new Date(now);
  lastDay.setHours(12, 0, 0, 0);
  const firstDay = new Date(lastDay);
  firstDay.setDate(firstDay.getDate() - (ACTIVITY_DAY_COUNT - 1));

  return Array.from({ length: ACTIVITY_DAY_COUNT }, (_, index) => {
    const day = new Date(firstDay);
    day.setDate(firstDay.getDate() + index);
    const date = localDateKey(day);

    return { date, completedSessions: completedSessionsByDay.get(date) ?? 0 };
  });
}

/**
 * Epley estimate. It is intentionally absent above 12 repetitions because it reflects work
 * capacity more than maximum strength at higher repetitions.
 */
export function estimateOneRepMax(loadInKilogramsValue: number, repetitions: number): number | null {
  if (
    !Number.isFinite(loadInKilogramsValue) ||
    !Number.isFinite(repetitions) ||
    loadInKilogramsValue <= 0 ||
    repetitions < 1 ||
    repetitions > ESTIMATED_ONE_REP_MAX_REPETITION_CAP
  ) {
    return null;
  }

  const estimatedValue = repetitions === 1 ? loadInKilogramsValue : loadInKilogramsValue * (1 + repetitions / 30);
  return Math.round(estimatedValue * 10) / 10;
}

function compareTrendCandidates(
  first: { loadKg: number; estimatedOneRepMaxKg: number | null },
  second: { loadKg: number; estimatedOneRepMaxKg: number | null },
): number {
  const firstScore = first.estimatedOneRepMaxKg ?? first.loadKg;
  const secondScore = second.estimatedOneRepMaxKg ?? second.loadKg;
  return firstScore - secondScore;
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
        const bestLoadKg = loadInKilograms(best.load ?? 0, log.units);
        const currentLoadKg = loadInKilograms(current.load ?? 0, log.units);
        const bestEstimate = best.repetitions === null ? null : estimateOneRepMax(bestLoadKg, best.repetitions);
        const currentEstimate = current.repetitions === null ? null : estimateOneRepMax(currentLoadKg, current.repetitions);

        return compareTrendCandidates(
          { loadKg: currentLoadKg, estimatedOneRepMaxKg: currentEstimate },
          { loadKg: bestLoadKg, estimatedOneRepMaxKg: bestEstimate },
        ) > 0
          ? current
          : best;
      });
      const loadKg = loadInKilograms(bestSet.load ?? 0, log.units);
      const estimatedOneRepMaxKg = bestSet.repetitions === null ? null : estimateOneRepMax(loadKg, bestSet.repetitions);
      const currentEntry = samplesByExercise.get(exerciseId) ?? {
        exerciseName: bestSet.exerciseName,
        points: [],
      };

      currentEntry.points.push({
        id: log.id,
        label: formatLogDate(log, logIndex),
        loadKg,
        repetitions: bestSet.repetitions,
        estimatedOneRepMaxKg,
      });
      samplesByExercise.set(exerciseId, currentEntry);
    });
  });

  const selectedExercise = [...samplesByExercise.values()].sort((first, second) => second.points.length - first.points.length)[0];

  return selectedExercise
    ? { exerciseName: selectedExercise.exerciseName, exerciseTrend: selectedExercise.points }
    : { exerciseName: null, exerciseTrend: [] };
}

function calculatePersonalRecords(logs: WorkoutLog[]): ExercisePersonalRecord[] {
  const recordByExercise = new Map<string, ExercisePersonalRecord>();

  logs.forEach((log) => {
    const recordedAt = log.completedAt ?? log.startedAt;

    log.sets
      .filter((set) => set.completed && set.load !== null && set.repetitions !== null)
      .forEach((set) => {
        const loadKg = loadInKilograms(set.load ?? 0, log.units);
        const estimatedOneRepMaxKg = estimateOneRepMax(loadKg, set.repetitions ?? 0);

        if (estimatedOneRepMaxKg === null) {
          return;
        }

        const candidate: ExercisePersonalRecord = {
          exerciseId: set.exerciseId,
          exerciseName: set.exerciseName,
          loadKg,
          repetitions: set.repetitions ?? 0,
          estimatedOneRepMaxKg,
          recordedAt,
        };
        const currentRecord = recordByExercise.get(set.exerciseId);

        if (
          !currentRecord ||
          candidate.estimatedOneRepMaxKg > currentRecord.estimatedOneRepMaxKg ||
          (candidate.estimatedOneRepMaxKg === currentRecord.estimatedOneRepMaxKg && isMoreRecent(candidate.recordedAt, currentRecord.recordedAt))
        ) {
          recordByExercise.set(set.exerciseId, candidate);
        }
      });
  });

  return [...recordByExercise.values()].sort((first, second) => second.recordedAt.localeCompare(first.recordedAt));
}

export function calculateProgressSnapshot(plan: MonthlyPlan, logs: WorkoutLog[], now = new Date()): ProgressSnapshot {
  const plannedSessions = plan.weeks.flatMap((week) => week.sessions).filter((session) => session.status !== 'rest');
  const completedPlanLogs = getCompletedLogsForPlan(plan, logs);
  const completedSessionIds = new Set(completedPlanLogs.map((log) => log.sessionId));
  const monthlyVolumeKg = completedPlanLogs.reduce(
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
  const latestNote = [...completedPlanLogs]
    .reverse()
    .map((log) => log.note.trim())
    .find((note) => note.length > 0) ?? null;
  const { exerciseName, exerciseTrend } = calculateExerciseTrend(completedPlanLogs);

  return {
    adherencePercent: plannedSessions.length > 0 ? Math.round((completedSessionIds.size / plannedSessions.length) * 100) : 0,
    completedSessions: completedSessionIds.size,
    plannedSessions: plannedSessions.length,
    monthlyVolumeKg: Math.round(monthlyVolumeKg * 10) / 10,
    activityDays: createActivityDays(logs, now),
    personalRecords: calculatePersonalRecords(getCompletedLogs(logs)),
    exerciseName,
    exerciseTrend,
    latestNote,
  };
}

export function convertKilogramsForDisplay(valueInKilograms: number, units: MeasurementUnits): number {
  return loadForDisplay(valueInKilograms, units);
}
