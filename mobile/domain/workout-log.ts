import type { ExerciseFeedback, LoggedSet, MeasurementUnits, MonthlyPlan, WorkoutLog, WorkoutSession } from '@/domain/models';

function getPlannedSetCount(target: string): number {
  const firstNumber = Number.parseInt(target, 10);
  return Number.isInteger(firstNumber) && firstNumber > 0 ? firstNumber : 1;
}

function createLoggedSets(session: WorkoutSession): LoggedSet[] {
  return session.exercises.flatMap((exercise) => {
    let nextSetNumber = 1;

    return exercise.sets.flatMap((set) => {
      const plannedSetCount = getPlannedSetCount(set.target);
      const sets = Array.from({ length: plannedSetCount }, () => {
        const loggedSet: LoggedSet = {
          id: `${exercise.id}-${nextSetNumber}`,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          setNumber: nextSetNumber,
          target: set.target,
          rest: set.rest,
          load: null,
          repetitions: null,
          rpe: null,
          completed: false,
        };

        nextSetNumber += 1;
        return loggedSet;
      });

      return sets;
    });
  });
}

function createExerciseFeedback(session: WorkoutSession): ExerciseFeedback[] {
  return session.exercises.map((exercise) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    reaction: null,
    note: '',
  }));
}

export function createWorkoutLog(plan: MonthlyPlan, session: WorkoutSession, units: MeasurementUnits): WorkoutLog {
  const timestamp = new Date().toISOString();

  return {
    id: `${plan.id}-${session.id}-${timestamp}`,
    planId: plan.id,
    planVersion: plan.version,
    sessionId: session.id,
    sessionTitle: session.title,
    startedAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
    status: 'in-progress',
    units,
    note: '',
    sets: createLoggedSets(session),
    exerciseFeedback: createExerciseFeedback(session),
  };
}

export function updateWorkoutLog(log: WorkoutLog, changes: Pick<WorkoutLog, 'note' | 'sets' | 'exerciseFeedback'>): WorkoutLog {
  return {
    ...log,
    ...changes,
    updatedAt: new Date().toISOString(),
  };
}
