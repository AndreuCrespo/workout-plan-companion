import { loadInKilograms } from '@/domain/measurements';
import type { WorkoutLog } from '@/domain/models';

export interface WorkoutSummary {
  completedSets: number;
  totalSets: number;
  volumeKg: number;
  feedbackCount: number;
  durationMinutes: number | null;
}

export function calculateWorkoutSummary(log: WorkoutLog): WorkoutSummary {
  const completedSets = log.sets.filter((set) => set.completed).length;
  const volumeKg = log.sets.reduce((total, set) => {
    if (!set.completed || set.load === null || set.repetitions === null) {
      return total;
    }

    return total + loadInKilograms(set.load, log.units) * set.repetitions;
  }, 0);
  const feedbackCount = log.exerciseFeedback.filter(
    (feedback) => feedback.reaction !== null || feedback.note.trim().length > 0,
  ).length;
  const startedAt = new Date(log.startedAt).getTime();
  const completedAt = log.completedAt ? new Date(log.completedAt).getTime() : Number.NaN;
  const durationMinutes = Number.isFinite(startedAt) && Number.isFinite(completedAt) && completedAt >= startedAt
    ? Math.max(1, Math.round((completedAt - startedAt) / 60000))
    : null;

  return {
    completedSets,
    totalSets: log.sets.length,
    volumeKg: Math.round(volumeKg * 10) / 10,
    feedbackCount,
    durationMinutes,
  };
}
