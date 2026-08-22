import type { Exercise, MonthlyPlan, ProgressSnapshot, UserProfile, WorkoutSession } from '@/domain/models';

/**
 * Punto de acceso de las pantallas al perfil, plan y progreso.
 * Una implementación remota podrá respetar este contrato sin acoplar la UI a Supabase.
 */
export interface TrainingRepository {
  getProfile(): UserProfile;
  getPlan(): MonthlyPlan;
  getNextSession(): WorkoutSession;
  getSession(sessionId: string): WorkoutSession | undefined;
  getExercise(exerciseId: string): Exercise | undefined;
  getProgress(): ProgressSnapshot;
}
