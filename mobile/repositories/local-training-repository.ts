import { getMockExercise, getMockSession, mockNextSession, mockPlan } from '@/data/mock-plan';
import type { TrainingRepository } from '@/repositories/training-repository';

class LocalTrainingRepository implements TrainingRepository {
  getPlan() {
    return mockPlan;
  }

  getNextSession() {
    return mockNextSession;
  }

  getSession(sessionId: string) {
    return getMockSession(sessionId);
  }

  getExercise(exerciseId: string) {
    return getMockExercise(exerciseId);
  }

}

export const trainingRepository = new LocalTrainingRepository();
