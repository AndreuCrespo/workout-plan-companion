import type { MonthlyPlan, ProgressSnapshot } from '@/domain/models';

/**
 * Consulta el progreso derivado de los entrenamientos terminados.
 * Una implementación remota podrá reemplazar este cálculo local en el futuro.
 */
export interface ProgressRepository {
  getProgress(plan: MonthlyPlan): Promise<ProgressSnapshot>;
}
