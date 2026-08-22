import { getMockExercise, getMockSession, mockNextSession, mockPlan } from '@/data/mock-plan';
import { mockProgress } from '@/data/mock-progress';
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

  getProgress() {
    return mockProgress;
  }
}

export const trainingRepository = new LocalTrainingRepository();
