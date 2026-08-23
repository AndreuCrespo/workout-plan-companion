import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ExerciseFeedback, LoggedSet, WorkoutLog } from '@/domain/models';
import type { WorkoutLogRepository } from '@/repositories/workout-log-repository';

const DRAFTS_STORAGE_KEY = '@gimnasio/workout-log-drafts';
const COMPLETED_LOGS_STORAGE_KEY = '@gimnasio/workout-logs';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isLoggedSet(value: unknown): value is LoggedSet {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.exerciseId === 'string' &&
    typeof value.exerciseName === 'string' &&
    typeof value.setNumber === 'number' &&
    typeof value.target === 'string' &&
    typeof value.rest === 'string' &&
    isNullableNumber(value.load) &&
    isNullableNumber(value.repetitions) &&
    isNullableNumber(value.rpe) &&
    typeof value.completed === 'boolean'
  );
}

function isExerciseFeedback(value: unknown): value is ExerciseFeedback {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.exerciseId === 'string' &&
    typeof value.exerciseName === 'string' &&
    (value.reaction === 'up' || value.reaction === 'down' || value.reaction === null) &&
    typeof value.note === 'string'
  );
}

function getExerciseFeedback(value: unknown): ExerciseFeedback[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isExerciseFeedback);
}

function parseWorkoutLog(value: unknown): WorkoutLog | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.planId !== 'string' ||
    typeof value.planVersion !== 'string' ||
    typeof value.sessionId !== 'string' ||
    typeof value.sessionTitle !== 'string' ||
    typeof value.startedAt !== 'string' ||
    typeof value.updatedAt !== 'string' ||
    (typeof value.completedAt !== 'string' && value.completedAt !== null) ||
    (value.status !== 'in-progress' && value.status !== 'completed') ||
    typeof value.note !== 'string' ||
    !Array.isArray(value.sets)
  ) {
    return null;
  }

  const sets = value.sets.filter(isLoggedSet);

  if (sets.length !== value.sets.length) {
    return null;
  }

  return {
    id: value.id,
    planId: value.planId,
    planVersion: value.planVersion,
    sessionId: value.sessionId,
    sessionTitle: value.sessionTitle,
    startedAt: value.startedAt,
    updatedAt: value.updatedAt,
    completedAt: value.completedAt,
    status: value.status,
    note: value.note,
    sets,
    // Los registros creados antes de este campo siguen siendo válidos.
    exerciseFeedback: getExerciseFeedback(value.exerciseFeedback),
  };
}

async function readLogs(storageKey: string): Promise<WorkoutLog[]> {
  try {
    const storedLogs = await AsyncStorage.getItem(storageKey);

    if (!storedLogs) {
      return [];
    }

    const parsedLogs: unknown = JSON.parse(storedLogs);
    return Array.isArray(parsedLogs)
      ? parsedLogs.map(parseWorkoutLog).filter((log): log is WorkoutLog => log !== null)
      : [];
  } catch {
    return [];
  }
}

class LocalWorkoutLogRepository implements WorkoutLogRepository {
  private writeQueue: Promise<void> = Promise.resolve();

  private enqueueWrite<TValue>(write: () => Promise<TValue>): Promise<TValue> {
    const result = this.writeQueue.then(write);
    this.writeQueue = result.then(
      () => undefined,
      () => undefined,
    );

    return result;
  }

  async getDraft(sessionId: string): Promise<WorkoutLog | null> {
    const drafts = await readLogs(DRAFTS_STORAGE_KEY);
    return drafts.find((draft) => draft.sessionId === sessionId) ?? null;
  }

  async getCompletedLog(sessionId: string): Promise<WorkoutLog | null> {
    const logs = await this.getCompletedLogs();
    return logs.find((log) => log.sessionId === sessionId) ?? null;
  }

  async getCompletedLogs(): Promise<WorkoutLog[]> {
    return readLogs(COMPLETED_LOGS_STORAGE_KEY);
  }

  async saveDraft(log: WorkoutLog): Promise<void> {
    await this.enqueueWrite(async () => {
      const drafts = await readLogs(DRAFTS_STORAGE_KEY);
      const otherDrafts = drafts.filter((draft) => draft.sessionId !== log.sessionId);
      await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify([...otherDrafts, log]));
    });
  }

  async complete(log: WorkoutLog): Promise<WorkoutLog> {
    return this.enqueueWrite(async () => {
      const completedLogs = await this.getCompletedLogs();
      const existingLog = completedLogs.find((storedLog) => storedLog.sessionId === log.sessionId);

      if (existingLog) {
        return existingLog;
      }

      const timestamp = new Date().toISOString();
      const completedLog: WorkoutLog = {
        ...log,
        status: 'completed',
        updatedAt: timestamp,
        completedAt: timestamp,
      };
      const drafts = await readLogs(DRAFTS_STORAGE_KEY);

      await AsyncStorage.multiSet([
        [COMPLETED_LOGS_STORAGE_KEY, JSON.stringify([...completedLogs, completedLog])],
        [DRAFTS_STORAGE_KEY, JSON.stringify(drafts.filter((draft) => draft.sessionId !== log.sessionId))],
      ]);

      return completedLog;
    });
  }
}

export const workoutLogRepository = new LocalWorkoutLogRepository();
