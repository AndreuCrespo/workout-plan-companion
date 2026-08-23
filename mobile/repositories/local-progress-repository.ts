import { calculateProgressSnapshot } from '@/domain/progress';
import type { MonthlyPlan } from '@/domain/models';
import type { ProgressRepository } from '@/repositories/progress-repository';
import { workoutLogRepository } from '@/repositories/local-workout-log-repository';

class LocalProgressRepository implements ProgressRepository {
  async getProgress(plan: MonthlyPlan) {
    const completedLogs = await workoutLogRepository.getCompletedLogs();
    return calculateProgressSnapshot(plan, completedLogs);
  }
}

export const progressRepository = new LocalProgressRepository();
