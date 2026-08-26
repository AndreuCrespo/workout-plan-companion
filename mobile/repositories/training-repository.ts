import type { Exercise, MonthlyPlan, WorkoutSession } from '@/domain/models';

/**
 * Pure plan lookups shared by screens. Persistence of the active version lives
 * behind PlanRepository, so this lookup layer remains replaceable later.
 */
export interface TrainingRepository {
  getNextSession(plan: MonthlyPlan): WorkoutSession;
  getSession(plan: MonthlyPlan, sessionId: string): WorkoutSession | undefined;
  getExercise(plan: MonthlyPlan, exerciseId: string): Exercise | undefined;
}
