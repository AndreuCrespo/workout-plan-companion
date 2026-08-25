import { loadForDisplay, loadInKilograms } from '@/domain/measurements';
import type { MeasurementUnits, WorkoutLog } from '@/domain/models';

export interface PreviousExerciseSet {
  load: number | null;
  repetitions: number | null;
  rpe: number | null;
}

export interface PreviousExercisePerformance {
  exerciseId: string;
  exerciseName: string;
  performedAt: string;
  sets: PreviousExerciseSet[];
}

function isMoreRecent(firstTimestamp: string, secondTimestamp: string): boolean {
  return firstTimestamp.localeCompare(secondTimestamp) > 0;
}

/**
 * Returns the most recent completed performance for each requested exercise. Values are
 * converted to the current display unit but never mark a future set as completed.
 */
export function getLatestExercisePerformances(
  logs: WorkoutLog[],
  exerciseIds: string[],
  displayUnits: MeasurementUnits,
): PreviousExercisePerformance[] {
  const requestedExerciseIds = new Set(exerciseIds);
  const performanceByExercise = new Map<string, PreviousExercisePerformance>();

  logs
    .filter((log) => log.status === 'completed')
    .forEach((log) => {
      const performedAt = log.completedAt ?? log.startedAt;
      const setsByExercise = new Map<string, typeof log.sets>();

      log.sets
        .filter((set) => set.completed && requestedExerciseIds.has(set.exerciseId))
        .forEach((set) => {
          const currentSets = setsByExercise.get(set.exerciseId) ?? [];
          setsByExercise.set(set.exerciseId, [...currentSets, set]);
        });

      setsByExercise.forEach((sets, exerciseId) => {
        const currentPerformance = performanceByExercise.get(exerciseId);

        if (currentPerformance && !isMoreRecent(performedAt, currentPerformance.performedAt)) {
          return;
        }

        performanceByExercise.set(exerciseId, {
          exerciseId,
          exerciseName: sets[0]?.exerciseName ?? 'Ejercicio',
          performedAt,
          sets: sets
            .sort((firstSet, secondSet) => firstSet.setNumber - secondSet.setNumber)
            .map((set) => ({
              load: set.load === null ? null : loadForDisplay(loadInKilograms(set.load, log.units), displayUnits),
              repetitions: set.repetitions,
              rpe: set.rpe,
            })),
        });
      });
    });

  return [...performanceByExercise.values()];
}
