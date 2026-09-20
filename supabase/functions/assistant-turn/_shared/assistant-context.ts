import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export interface AssistantFeedbackSummary {
  exerciseId: string;
  negativeCount: number;
  positiveCount: number;
}

export interface AssistantPlanSessionSummary {
  dayLabel: string;
  estimatedMinutes: number;
  exerciseIds: string[];
  focus: string;
  title: string;
  weekNumber: number;
}

export interface AssistantContext {
  activePlan: {
    id: string;
    name: string;
    sessions: AssistantPlanSessionSummary[];
    versionNumber: number;
  } | null;
  feedback: AssistantFeedbackSummary[];
  profile: {
    availability: string;
    equipmentAccess: string;
    limitations: string;
    primaryGoal: string;
    sessionDurationMinutes: number;
    trainingEmphasis: string;
    trainingExperience: string;
    units: string;
  };
}

export class AssistantContextError extends Error {
  constructor(readonly code: 'missing_profile' | 'remote_data_unavailable') {
    super(code === 'missing_profile'
      ? 'Guarda una copia privada actualizada de tu perfil antes de usar el asistente IA.'
      : 'No pudimos recuperar el contexto privado necesario para el asistente.');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function summarizeFeedback(rows: unknown): AssistantFeedbackSummary[] {
  const totals = new Map<string, AssistantFeedbackSummary>();

  for (const row of asRecordArray(rows)) {
    const exerciseId = asString(row.exercise_id);

    if (!exerciseId) {
      continue;
    }

    const summary = totals.get(exerciseId) ?? { exerciseId, negativeCount: 0, positiveCount: 0 };

    if (row.reaction === 'down') {
      summary.negativeCount += 1;
    } else if (row.reaction === 'up') {
      summary.positiveCount += 1;
    }

    totals.set(exerciseId, summary);
  }

  return [...totals.values()]
    .filter((summary) => summary.negativeCount > 0 || summary.positiveCount > 0)
    .sort((left, right) => right.negativeCount - left.negativeCount || right.positiveCount - left.positiveCount)
    .slice(0, 12);
}

function summarizeSessions(rows: unknown): AssistantPlanSessionSummary[] {
  return asRecordArray(rows).flatMap((week) => {
    const weekNumber = asNumber(week.week_number);

    return asRecordArray(week.plan_sessions).map((session) => ({
      dayLabel: asString(session.day_label),
      estimatedMinutes: asNumber(session.estimated_minutes),
      exerciseIds: asRecordArray(session.plan_session_exercises)
        .sort((left, right) => asNumber(left.exercise_position) - asNumber(right.exercise_position))
        .map((exercise) => asString(exercise.catalog_exercise_id))
        .filter(Boolean),
      focus: asString(session.focus),
      title: asString(session.title),
      weekNumber,
    }));
  });
}

/**
 * Reads only data under the authenticated person's RLS scope. Notes, individual sets, and full
 * workout logs are deliberately excluded; the provider receives only this minimized summary after
 * the person has accepted assistant use.
 */
export async function loadAssistantContext(supabase: SupabaseClient, userId: string): Promise<AssistantContext> {
  const [profileResult, activeSelectionResult, feedbackResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('availability, equipment_access, limitations, primary_goal, session_duration_minutes, training_emphasis, training_experience, units')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('active_plan_selection')
      .select('plan_version_id, plan_versions(id, name, version_number)')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('workout_exercise_feedback')
      .select('exercise_id, reaction'),
  ]);

  if (profileResult.error || activeSelectionResult.error || feedbackResult.error) {
    throw new AssistantContextError('remote_data_unavailable');
  }

  if (!isRecord(profileResult.data)) {
    throw new AssistantContextError('missing_profile');
  }

  const profile = {
    availability: asString(profileResult.data.availability),
    equipmentAccess: asString(profileResult.data.equipment_access),
    limitations: asString(profileResult.data.limitations),
    primaryGoal: asString(profileResult.data.primary_goal),
    sessionDurationMinutes: asNumber(profileResult.data.session_duration_minutes),
    trainingEmphasis: asString(profileResult.data.training_emphasis),
    trainingExperience: asString(profileResult.data.training_experience),
    units: asString(profileResult.data.units),
  };
  const selection = activeSelectionResult.data;
  const activePlanRow = isRecord(selection) && isRecord(selection.plan_versions)
    ? selection.plan_versions
    : null;
  let activePlan: AssistantContext['activePlan'] = null;

  if (activePlanRow) {
    const planVersionId = asString(activePlanRow.id);

    if (!planVersionId) {
      throw new AssistantContextError('remote_data_unavailable');
    }

    const sessionsResult = await supabase
      .from('plan_weeks')
      .select('week_number, plan_sessions(session_position, day_label, title, focus, estimated_minutes, plan_session_exercises(exercise_position, catalog_exercise_id))')
      .eq('plan_version_id', planVersionId)
      .order('week_number');

    if (sessionsResult.error) {
      throw new AssistantContextError('remote_data_unavailable');
    }

    activePlan = {
      id: planVersionId,
      name: asString(activePlanRow.name),
      sessions: summarizeSessions(sessionsResult.data),
      versionNumber: asNumber(activePlanRow.version_number),
    };
  }

  return {
    activePlan,
    feedback: summarizeFeedback(feedbackResult.data),
    profile,
  };
}
