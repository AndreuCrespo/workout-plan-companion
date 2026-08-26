import type { MonthlyPlan } from '@/domain/models';
import type { TrainingRepository } from '@/repositories/training-repository';

function sessionsForPlan(plan: MonthlyPlan) {
  return plan.weeks.flatMap((week) => week.sessions);
}

class LocalTrainingRepository implements TrainingRepository {
  getNextSession(plan: MonthlyPlan) {
    return sessionsForPlan(plan).find((session) => session.status === 'upcoming') ?? sessionsForPlan(plan)[0];
  }

  getSession(plan: MonthlyPlan, sessionId: string) {
    return sessionsForPlan(plan).find((session) => session.id === sessionId);
  }

  getExercise(plan: MonthlyPlan, exerciseId: string) {
    return sessionsForPlan(plan)
      .flatMap((session) => session.exercises)
      .find((exercise) => exercise.id === exerciseId);
  }
}

export const trainingRepository = new LocalTrainingRepository();
