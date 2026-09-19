import type { Exercise, ExerciseFeedback, LoggedSet, ThemeName, UserProfile, WorkoutLog, WorkoutSession } from '@/domain/models';
import type { PlanPublication } from '@/domain/plan-publication';
import { supabase } from '@/lib/supabase';

export interface PrivateBackupSummary {
  completedLogCount: number;
  isAvailable: boolean;
  planCount: number;
}

export interface PrivateBackupSnapshot {
  completedLogs: WorkoutLog[];
  profile: UserProfile;
  publications: PlanPublication[];
  themeName: ThemeName;
}

interface RemotePlanVersion {
  created_at: string;
  id: string;
  name: string;
  published_at: string;
  version_number: number;
}

interface RemotePlanWeek {
  goal: string;
  id: string;
  plan_version_id: string;
  week_number: number;
}

interface RemotePlanSession {
  cool_down: string;
  day_label: string;
  estimated_minutes: number;
  focus: string;
  id: string;
  plan_week_id: string;
  session_position: number;
  title: string;
  warm_up: string[];
}

interface RemotePlanSessionExercise {
  catalog_exercise_id: string;
  exercise_position: number;
  exercise_snapshot: unknown;
  id: string;
  plan_session_id: string;
}

interface RemoteWorkoutLog {
  completed_at: string;
  id: string;
  note: string;
  plan_session_id: string;
  plan_version_id: string;
  session_title_snapshot: string;
  started_at: string;
  units: WorkoutLog['units'];
  updated_at: string;
}

interface RemoteWorkoutLogSet {
  exercise_id: string;
  exercise_name: string;
  id: string;
  input_load: number | string | null;
  is_completed: boolean;
  repetitions: number | string | null;
  rest: string;
  rpe: number | string | null;
  set_number: number;
  target: string;
  workout_log_id: string;
}

interface RemoteWorkoutExerciseFeedback {
  exercise_id: string;
  note: string;
  reaction: ExerciseFeedback['reaction'];
  workout_log_id: string;
}

function getClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  return supabase;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asNullableNumber(value: unknown): number | null {
  return value === null ? null : asNumber(value);
}

function exerciseFromSnapshot(value: unknown): Exercise {
  if (!isRecord(value)
    || typeof value.id !== 'string'
    || typeof value.name !== 'string'
    || typeof value.equipment !== 'string'
    || typeof value.equipmentSetup !== 'string'
    || !Array.isArray(value.techniqueSteps)
    || typeof value.coachingCue !== 'string'
    || typeof value.preparation !== 'string'
    || typeof value.execution !== 'string'
    || typeof value.breathing !== 'string'
    || !isStringArray(value.commonMistakes)
    || !Array.isArray(value.sets)) {
    throw new Error('Una instantánea de ejercicio remota no es válida.');
  }

  const techniqueSteps = value.techniqueSteps.map((step) => {
    if (!isRecord(step) || typeof step.label !== 'string' || typeof step.description !== 'string') {
      throw new Error('Una guía técnica remota no es válida.');
    }

    return { description: step.description, label: step.label };
  });

  const sets = value.sets.map((set) => {
    if (!isRecord(set) || typeof set.target !== 'string' || typeof set.rest !== 'string') {
      throw new Error('Una prescripción remota no es válida.');
    }

    return { rest: set.rest, target: set.target };
  });

  return {
    breathing: value.breathing,
    coachingCue: value.coachingCue,
    commonMistakes: value.commonMistakes,
    equipment: value.equipment,
    equipmentSetup: value.equipmentSetup,
    execution: value.execution,
    id: value.id,
    name: value.name,
    preparation: value.preparation,
    sets,
    techniqueSteps,
  };
}

function profileFromRemote(value: unknown): UserProfile {
  if (!isRecord(value)
    || typeof value.first_name !== 'string'
    || (value.availability !== 'two-days' && value.availability !== 'three-days' && value.availability !== 'four-days' && value.availability !== 'five-days')
    || (value.session_duration_minutes !== 45 && value.session_duration_minutes !== 60 && value.session_duration_minutes !== 75)
    || typeof value.limitations !== 'string'
    || (value.units !== 'metric' && value.units !== 'imperial')
    || typeof value.created_at !== 'string'
    || typeof value.updated_at !== 'string') {
    throw new Error('El perfil remoto no es válido.');
  }

  return {
    availability: value.availability,
    createdAt: value.created_at,
    firstName: value.first_name,
    limitations: value.limitations,
    sessionDurationMinutes: value.session_duration_minutes,
    units: value.units,
    updatedAt: value.updated_at,
  };
}

function themeFromRemote(value: unknown): ThemeName {
  if (!isRecord(value) || (value.theme_name !== 'verde-activo' && value.theme_name !== 'grafito-naranja')) {
    throw new Error('El tema remoto no es válido.');
  }

  return value.theme_name;
}

function reconstructPlans(
  planVersions: RemotePlanVersion[],
  weeks: RemotePlanWeek[],
  sessions: RemotePlanSession[],
  exercises: RemotePlanSessionExercise[],
): { publications: PlanPublication[]; sessionById: Map<string, WorkoutSession>; planById: Map<string, PlanPublication> } {
  const sessionById = new Map<string, WorkoutSession>();
  const planById = new Map<string, PlanPublication>();

  const publications = planVersions.map((remotePlan) => {
    const planWeeks = weeks
      .filter((week) => week.plan_version_id === remotePlan.id)
      .sort((left, right) => left.week_number - right.week_number)
      .map((remoteWeek) => ({
        goal: remoteWeek.goal,
        number: remoteWeek.week_number,
        sessions: sessions
          .filter((session) => session.plan_week_id === remoteWeek.id)
          .sort((left, right) => left.session_position - right.session_position)
          .map((remoteSession) => {
            const session: WorkoutSession = {
              coolDown: remoteSession.cool_down,
              dayLabel: remoteSession.day_label,
              estimatedMinutes: remoteSession.estimated_minutes,
              exercises: exercises
                .filter((exercise) => exercise.plan_session_id === remoteSession.id)
                .sort((left, right) => left.exercise_position - right.exercise_position)
                .map((exercise) => {
                  const snapshot = exerciseFromSnapshot(exercise.exercise_snapshot);
                  if (snapshot.id !== exercise.catalog_exercise_id) {
                    throw new Error('Una instantánea de ejercicio no coincide con el catálogo remoto.');
                  }
                  return snapshot;
                }),
              focus: remoteSession.focus,
              id: remoteSession.id,
              status: 'upcoming',
              title: remoteSession.title,
              warmUp: remoteSession.warm_up,
            };

            sessionById.set(remoteSession.id, session);
            return session;
          }),
      }));

    if (planWeeks.length !== 4 || planWeeks.some((week) => week.sessions.length === 0)) {
      throw new Error('La estructura del plan remoto no está completa.');
    }

    const publication: PlanPublication = {
      id: remotePlan.id,
      plan: {
        id: remotePlan.id,
        name: remotePlan.name,
        version: `Versión ${remotePlan.version_number} · 4 semanas`,
        weeks: planWeeks,
      },
      publishedAt: remotePlan.published_at,
      request: null,
      sourceProposalId: null,
    };

    planById.set(remotePlan.id, publication);
    return publication;
  });

  return { planById, publications, sessionById };
}

function reconstructLogs(
  logs: RemoteWorkoutLog[],
  sets: RemoteWorkoutLogSet[],
  feedback: RemoteWorkoutExerciseFeedback[],
  planById: Map<string, PlanPublication>,
  sessionById: Map<string, WorkoutSession>,
): WorkoutLog[] {
  return logs.map((remoteLog) => {
    const publication = planById.get(remoteLog.plan_version_id);
    const session = sessionById.get(remoteLog.plan_session_id);

    if (!publication || !session) {
      throw new Error('Un registro remoto no coincide con su plan publicado.');
    }

    const loggedSets: LoggedSet[] = sets
      .filter((set) => set.workout_log_id === remoteLog.id)
      .sort((left, right) => left.set_number - right.set_number)
      .map((set) => {
        const load = asNullableNumber(set.input_load);
        const repetitions = asNullableNumber(set.repetitions);
        const rpe = asNullableNumber(set.rpe);

        if ((set.input_load !== null && load === null)
          || (set.repetitions !== null && repetitions === null)
          || (set.rpe !== null && rpe === null)) {
          throw new Error('Una serie remota tiene una medida no válida.');
        }

        return {
          completed: set.is_completed,
          exerciseId: set.exercise_id,
          exerciseName: set.exercise_name,
          id: set.id,
          load,
          repetitions,
          rest: set.rest,
          rpe,
          setNumber: set.set_number,
          target: set.target,
        };
      });

    const exerciseFeedback: ExerciseFeedback[] = feedback
      .filter((item) => item.workout_log_id === remoteLog.id)
      .map((item) => ({
        exerciseId: item.exercise_id,
        exerciseName: session.exercises.find((exercise) => exercise.id === item.exercise_id)?.name ?? item.exercise_id,
        note: item.note,
        reaction: item.reaction,
      }));

    return {
      completedAt: remoteLog.completed_at,
      exerciseFeedback,
      id: remoteLog.id,
      note: remoteLog.note,
      planId: publication.plan.id,
      planVersion: publication.plan.version,
      sessionId: session.id,
      sessionTitle: remoteLog.session_title_snapshot,
      sets: loggedSets,
      startedAt: remoteLog.started_at,
      status: 'completed',
      units: remoteLog.units,
      updatedAt: remoteLog.updated_at,
    };
  });
}

export interface PrivateBackupRecoveryRepository {
  getSnapshot(userId: string): Promise<PrivateBackupSnapshot>;
  getSummary(userId: string): Promise<PrivateBackupSummary>;
}

class SupabasePrivateBackupRecoveryRepository implements PrivateBackupRecoveryRepository {
  async getSummary(userId: string): Promise<PrivateBackupSummary> {
    const client = getClient();
    const [profileResult, preferenceResult, plansResult, logsResult] = await Promise.all([
      client.from('profiles').select('user_id').eq('user_id', userId).maybeSingle(),
      client.from('user_preferences').select('user_id').eq('user_id', userId).maybeSingle(),
      client.from('plan_versions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      client.from('workout_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
    ]);

    if (profileResult.error || preferenceResult.error || plansResult.error || logsResult.error) {
      throw profileResult.error ?? preferenceResult.error ?? plansResult.error ?? logsResult.error;
    }

    return {
      completedLogCount: logsResult.count ?? 0,
      isAvailable: profileResult.data !== null && preferenceResult.data !== null && (plansResult.count ?? 0) > 0,
      planCount: plansResult.count ?? 0,
    };
  }

  async getSnapshot(userId: string): Promise<PrivateBackupSnapshot> {
    const client = getClient();
    const [profileResult, preferenceResult, plansResult, logsResult] = await Promise.all([
      client
        .from('profiles')
        .select('availability, created_at, first_name, limitations, session_duration_minutes, units, updated_at')
        .eq('user_id', userId)
        .maybeSingle(),
      client.from('user_preferences').select('theme_name').eq('user_id', userId).maybeSingle(),
      client
        .from('plan_versions')
        .select('created_at, id, name, published_at, version_number')
        .eq('user_id', userId)
        .order('version_number', { ascending: true }),
      client
        .from('workout_logs')
        .select('completed_at, id, note, plan_session_id, plan_version_id, session_title_snapshot, started_at, units, updated_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true }),
    ]);

    if (profileResult.error || preferenceResult.error || plansResult.error || logsResult.error) {
      throw profileResult.error ?? preferenceResult.error ?? plansResult.error ?? logsResult.error;
    }

    if (!profileResult.data || !preferenceResult.data || !plansResult.data) {
      throw new Error('No hay una copia privada completa que recuperar.');
    }

    const planVersions = plansResult.data as RemotePlanVersion[];
    const logs = (logsResult.data ?? []) as RemoteWorkoutLog[];
    const planVersionIds = planVersions.map((plan) => plan.id);
    const logIds = logs.map((log) => log.id);

    const weeksResult = await client
      .from('plan_weeks')
      .select('goal, id, plan_version_id, week_number')
      .in('plan_version_id', planVersionIds);

    if (weeksResult.error) {
      throw weeksResult.error;
    }

    const weeks = (weeksResult.data ?? []) as RemotePlanWeek[];
    const weekIds = weeks.map((week) => week.id);
    const sessionsResult = await client
      .from('plan_sessions')
      .select('cool_down, day_label, estimated_minutes, focus, id, plan_week_id, session_position, title, warm_up')
      .in('plan_week_id', weekIds);

    if (sessionsResult.error) {
      throw sessionsResult.error;
    }

    const sessions = (sessionsResult.data ?? []) as RemotePlanSession[];
    const sessionIds = sessions.map((session) => session.id);
    const exercisesResult = await client
      .from('plan_session_exercises')
      .select('catalog_exercise_id, exercise_position, exercise_snapshot, id, plan_session_id')
      .in('plan_session_id', sessionIds);

    if (exercisesResult.error) {
      throw exercisesResult.error;
    }

    const [setsResult, feedbackResult] = logIds.length === 0
      ? [{ data: [], error: null }, { data: [], error: null }]
      : await Promise.all([
        client
          .from('workout_log_sets')
          .select('exercise_id, exercise_name, id, input_load, is_completed, repetitions, rest, rpe, set_number, target, workout_log_id')
          .in('workout_log_id', logIds),
        client
          .from('workout_exercise_feedback')
          .select('exercise_id, note, reaction, workout_log_id')
          .in('workout_log_id', logIds),
      ]);

    if (setsResult.error || feedbackResult.error) {
      throw setsResult.error ?? feedbackResult.error;
    }

    const { publications, planById, sessionById } = reconstructPlans(
      planVersions,
      weeks,
      sessions,
      (exercisesResult.data ?? []) as RemotePlanSessionExercise[],
    );

    return {
      completedLogs: reconstructLogs(
        logs,
        (setsResult.data ?? []) as RemoteWorkoutLogSet[],
        (feedbackResult.data ?? []) as RemoteWorkoutExerciseFeedback[],
        planById,
        sessionById,
      ),
      profile: profileFromRemote(profileResult.data),
      publications,
      themeName: themeFromRemote(preferenceResult.data),
    };
  }
}

export const privateBackupRecoveryRepository = new SupabasePrivateBackupRecoveryRepository();
