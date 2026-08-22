import type { Exercise, MonthlyPlan, ProgressSnapshot, WorkoutSession } from '@/domain/models';

/**
 * Punto de acceso de las pantallas al plan y al progreso.
 * Una implementación remota podrá respetar este contrato sin acoplar la UI a Supabase.
 */
export interface TrainingRepository {
  getPlan(): MonthlyPlan;
  getNextSession(): WorkoutSession;
  getSession(sessionId: string): WorkoutSession | undefined;
  getExercise(exerciseId: string): Exercise | undefined;
  getProgress(): ProgressSnapshot;
}
