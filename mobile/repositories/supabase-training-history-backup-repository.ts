import type { Exercise, WorkoutLog, WorkoutSession } from '@/domain/models';
import type { PlanPublication } from '@/domain/plan-publication';
import { supabase } from '@/lib/supabase';

export interface TrainingHistoryBackupStatus {
  completedLogCount: number;
  lastImportedAt: string;
  planCount: number;
}

export interface TrainingHistoryBackupResult {
  existingLogCount: number;
  existingPlanCount: number;
  importedLogCount: number;
  importedPlanCount: number;
}

interface TrainingHistoryBackupInput {
  completedLogs: WorkoutLog[];
  publications: PlanPublication[];
}

interface RemotePlanSession {
  exercises: {
    id: string;
    position: number;
    snapshot: Exercise;
  }[];
  dayLabel: string;
  estimatedMinutes: number;
  focus: string;
  position: number;
  title: string;
  warmUp: string[];
  coolDown: string;
}

interface RemotePlanPayload {
  id: string;
  name: string;
  publishedAt: string;
  request: PlanPublication['request'];
  versionNumber: number;
  weeks: {
    goal: string;
    number: number;
    sessions: RemotePlanSession[];
  }[];
}

interface RemoteCompletedLogPayload {
  completedAt: string;
  exerciseFeedback: {
    exerciseId: string;
    exercisePosition: number;
    note: string;
    reaction: 'up' | 'down' | null;
  }[];
  planVersionNumber: number;
  sessionPosition: number;
  sessionTitle: string;
  sets: {
    completed: boolean;
    exerciseId: string;
    exerciseName: string;
    exercisePosition: number;
    load: number | null;
    repetitions: number | null;
    rest: string;
    rpe: number | null;
    setNumber: number;
    target: string;
  }[];
  startedAt: string;
  units: WorkoutLog['units'];
  weekNumber: number;
  note: string;
}

interface RemoteTrainingHistoryPayload {
  activePlanVersionNumber: number;
  completedLogs: RemoteCompletedLogPayload[];
  plans: RemotePlanPayload[];
}

function getClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  return supabase;
}

function sessionForLog(log: WorkoutLog, publications: PlanPublication[]): { publication: PlanPublication; session: WorkoutSession; weekNumber: number; sessionPosition: number } {
  const publication = publications.find((candidate) => candidate.plan.id === log.planId);

  if (!publication) {
    throw new Error('El registro terminado no pertenece a un plan publicado disponible en este dispositivo.');
  }

  for (const week of publication.plan.weeks) {
    const sessionPosition = week.sessions.findIndex((session) => session.id === log.sessionId);
    if (sessionPosition >= 0) {
      return {
        publication,
        session: week.sessions[sessionPosition],
        sessionPosition: sessionPosition + 1,
        weekNumber: week.number,
      };
    }
  }

  throw new Error('El registro terminado no coincide con una sesión del plan publicado.');
}

function exercisePosition(session: WorkoutSession, exerciseId: string): number {
  const matchingPositions = session.exercises
    .map((exercise, index) => (exercise.id === exerciseId ? index + 1 : null))
    .filter((position): position is number => position !== null);

  if (matchingPositions.length !== 1) {
    throw new Error('El plan contiene una referencia de ejercicio ambigua para un registro terminado.');
  }

  return matchingPositions[0];
}

function toRemotePlan(publication: PlanPublication, versionNumber: number): RemotePlanPayload {
  return {
    id: publication.plan.id,
    name: publication.plan.name,
    publishedAt: publication.publishedAt,
    request: publication.request,
    versionNumber,
    weeks: publication.plan.weeks.map((week) => ({
      goal: week.goal,
      number: week.number,
      sessions: week.sessions.map((session, sessionIndex) => ({
        coolDown: session.coolDown,
        dayLabel: session.dayLabel,
        estimatedMinutes: session.estimatedMinutes,
        exercises: session.exercises.map((exercise, exerciseIndex) => ({
          id: exercise.id,
          position: exerciseIndex + 1,
          snapshot: exercise,
        })),
        focus: session.focus,
        position: sessionIndex + 1,
        title: session.title,
        warmUp: session.warmUp,
      })),
    })),
  };
}

function toRemoteCompletedLog(log: WorkoutLog, publications: PlanPublication[]): RemoteCompletedLogPayload {
  if (log.status !== 'completed' || !log.completedAt) {
    throw new Error('Solo se pueden guardar registros terminados.');
  }

  const { publication, session, sessionPosition, weekNumber } = sessionForLog(log, publications);
  const planVersionNumber = publications.findIndex((candidate) => candidate.id === publication.id) + 1;

  if (planVersionNumber <= 0) {
    throw new Error('No pudimos identificar la versión del plan asociada al registro terminado.');
  }

  return {
    completedAt: log.completedAt,
    exerciseFeedback: log.exerciseFeedback.map((feedback) => ({
      exerciseId: feedback.exerciseId,
      exercisePosition: exercisePosition(session, feedback.exerciseId),
      note: feedback.note,
      reaction: feedback.reaction,
    })),
    note: log.note,
    planVersionNumber,
    sessionPosition,
    sessionTitle: log.sessionTitle,
    sets: log.sets.map((set) => ({
      completed: set.completed,
      exerciseId: set.exerciseId,
      exerciseName: set.exerciseName,
      exercisePosition: exercisePosition(session, set.exerciseId),
      load: set.load,
      repetitions: set.repetitions,
      rest: set.rest,
      rpe: set.rpe,
      setNumber: set.setNumber,
      target: set.target,
    })),
    startedAt: log.startedAt,
    units: log.units,
    weekNumber,
  };
}

function createPayload({ completedLogs, publications }: TrainingHistoryBackupInput): RemoteTrainingHistoryPayload {
  if (publications.length === 0) {
    throw new Error('No hay un plan publicado que se pueda guardar.');
  }

  return {
    activePlanVersionNumber: publications.length,
    completedLogs: completedLogs.map((log) => toRemoteCompletedLog(log, publications)),
    plans: publications.map((publication, index) => toRemotePlan(publication, index + 1)),
  };
}

function isBackupResult(value: unknown): value is TrainingHistoryBackupResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const result = value as Record<string, unknown>;
  return [
    'existingLogCount',
    'existingPlanCount',
    'importedLogCount',
    'importedPlanCount',
  ].every((key) => typeof result[key] === 'number' && Number.isFinite(result[key]));
}

export interface TrainingHistoryBackupRepository {
  getStatus(userId: string): Promise<TrainingHistoryBackupStatus | null>;
  save(input: TrainingHistoryBackupInput): Promise<TrainingHistoryBackupResult>;
}

class SupabaseTrainingHistoryBackupRepository implements TrainingHistoryBackupRepository {
  async getStatus(userId: string): Promise<TrainingHistoryBackupStatus | null> {
    const client = getClient();
    const { data, error } = await client
      .from('training_history_backups')
      .select('completed_log_count, last_imported_at, plan_count')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      completedLogCount: data.completed_log_count,
      lastImportedAt: data.last_imported_at,
      planCount: data.plan_count,
    };
  }

  async save(input: TrainingHistoryBackupInput): Promise<TrainingHistoryBackupResult> {
    const client = getClient();
    const { data, error } = await client.rpc('import_local_training_history', { p_payload: createPayload(input) });

    if (error) {
      throw error;
    }

    if (!isBackupResult(data)) {
      throw new Error('La copia privada no devolvió un resultado válido.');
    }

    return data;
  }
}

export const trainingHistoryBackupRepository = new SupabaseTrainingHistoryBackupRepository();
