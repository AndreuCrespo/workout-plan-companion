import type { WorkoutLog } from '@/domain/models';

/**
 * Persiste borradores de sesión y registros terminados sin acoplar la UI
 * al almacenamiento local actual ni a una futura implementación remota.
 */
export interface WorkoutLogRepository {
  getDraft(sessionId: string): Promise<WorkoutLog | null>;
  getCompletedLog(sessionId: string): Promise<WorkoutLog | null>;
  getCompletedLogs(): Promise<WorkoutLog[]>;
  saveDraft(log: WorkoutLog): Promise<void>;
  complete(log: WorkoutLog): Promise<WorkoutLog>;
}
