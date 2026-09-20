import type { Exercise, MonthlyPlan, PlanWeek, WorkoutSession } from '@/domain/models';
import type { PlanProposal } from '@/domain/plan-proposal';

export interface RemoteProposalExercise {
  assistantExerciseKey: string;
  sets: { rest: string; target: string }[];
  source: 'assistant';
}

export interface RemoteAssistantExercise extends Omit<Exercise, 'id' | 'sets'> {
  key: string;
}

export interface RemotePlanProposal {
  assistantExercises: RemoteAssistantExercise[];
  changes: string[];
  createdAt: string;
  id: string;
  name: string;
  reviewItems: string[];
  weeks: {
    goal: string;
    number: number;
    sessions: {
      coolDown: string;
      dayLabel: string;
      estimatedMinutes: number;
      exercises: RemoteProposalExercise[];
      focus: string;
      title: string;
      warmUp: string[];
    }[];
  }[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function texts(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => text(item) !== null) ? value as string[] : null;
}

function sets(value: unknown): { rest: string; target: string }[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const parsed = value.map((set) => {
    if (!isRecord(set)) return null;
    const rest = text(set.rest);
    const target = text(set.target);
    return rest && target ? { rest, target } : null;
  });

  return parsed.every((set) => set !== null) ? parsed : null;
}

function parseCandidate(value: unknown): RemoteAssistantExercise | null {
  if (!isRecord(value)) return null;
  const key = text(value.key);
  const name = text(value.name);
  const equipment = text(value.equipment);
  const equipmentSetup = text(value.equipmentSetup);
  const coachingCue = text(value.coachingCue);
  const preparation = text(value.preparation);
  const execution = text(value.execution);
  const breathing = text(value.breathing);
  const commonMistakes = texts(value.commonMistakes);
  const techniqueSteps = Array.isArray(value.techniqueSteps)
    ? value.techniqueSteps.map((step) => isRecord(step) && text(step.label) && text(step.description)
      ? { description: step.description as string, label: step.label as string }
      : null)
    : null;

  if (!key || !name || !equipment || !equipmentSetup || !coachingCue || !preparation || !execution || !breathing
    || !commonMistakes || !techniqueSteps || techniqueSteps.some((step) => step === null)) {
    return null;
  }

  return { breathing, coachingCue, commonMistakes, equipment, equipmentSetup, execution, key, name, preparation, techniqueSteps: techniqueSteps as Exercise['techniqueSteps'] };
}

export function parseRemotePlanProposal(value: unknown): RemotePlanProposal {
  if (!isRecord(value) || !isRecord(value.proposal_snapshot)) {
    throw new Error('El borrador remoto no tiene un formato válido.');
  }

  const snapshot = value.proposal_snapshot;
  const id = text(value.id);
  const createdAt = text(value.created_at);
  const name = text(snapshot.name);
  const changes = texts(snapshot.changes);
  const reviewItems = texts(snapshot.reviewItems);
  const assistantExercises = Array.isArray(snapshot.assistantExercises)
    ? snapshot.assistantExercises.map(parseCandidate)
    : null;

  if (!id || !createdAt || !name || !changes || !reviewItems || !assistantExercises || assistantExercises.some((exercise) => exercise === null)
    || !Array.isArray(snapshot.weeks) || snapshot.weeks.length !== 4) {
    throw new Error('El borrador remoto no está completo.');
  }

  const weeks = snapshot.weeks.map((week, index) => {
    if (!isRecord(week) || week.number !== index + 1 || !text(week.goal) || !Array.isArray(week.sessions) || week.sessions.length === 0) return null;
    const sessions = week.sessions.map((session) => {
      if (!isRecord(session) || typeof session.estimatedMinutes !== 'number' || !Array.isArray(session.exercises)) return null;
      const warmUp = texts(session.warmUp);
      const exerciseList = session.exercises.map((exercise) => {
        if (!isRecord(exercise)) return null;
        const plannedSets = sets(exercise.sets);
        if (!plannedSets) return null;
        return exercise.source === 'assistant' && text(exercise.assistantExerciseKey)
          ? { assistantExerciseKey: exercise.assistantExerciseKey as string, sets: plannedSets, source: 'assistant' as const }
          : null;
      });
      const coolDown = text(session.coolDown);
      const dayLabel = text(session.dayLabel);
      const focus = text(session.focus);
      const title = text(session.title);
      return coolDown && dayLabel && focus && title && warmUp && exerciseList.every((exercise) => exercise !== null)
        ? { coolDown, dayLabel, estimatedMinutes: session.estimatedMinutes, exercises: exerciseList as RemoteProposalExercise[], focus, title, warmUp }
        : null;
    });
    return sessions.every((session) => session !== null) ? { goal: week.goal as string, number: index + 1, sessions: sessions as RemotePlanProposal['weeks'][number]['sessions'] } : null;
  });

  if (weeks.some((week) => week === null)) throw new Error('Las semanas del borrador no son válidas.');
  return { assistantExercises: assistantExercises as RemoteAssistantExercise[], changes, createdAt, id, name, reviewItems, weeks: weeks as RemotePlanProposal['weeks'] };
}

/** Builds a local immutable snapshot only after the server atomically publishes the same reviewed proposal. */
export function toLocalPublishedProposal(remote: RemotePlanProposal, sourcePlan: MonthlyPlan): PlanProposal {
  const assistantByKey = new Map(remote.assistantExercises.map((exercise) => [exercise.key, exercise]));
  const resolveExercise = (exercise: RemoteProposalExercise): Exercise => {
    const assistantExercise = assistantByKey.get(exercise.assistantExerciseKey);
    if (!assistantExercise) throw new Error('Un ejercicio nuevo del borrador no está disponible.');
    return { ...assistantExercise, id: `assistant-${assistantExercise.key}`, sets: exercise.sets.map((set) => ({ ...set })) };
  };
  const weeks: PlanWeek[] = remote.weeks.map((week) => ({
    goal: week.goal,
    number: week.number,
    sessions: week.sessions.map((session, sessionIndex): WorkoutSession => ({
      coolDown: session.coolDown,
      dayLabel: session.dayLabel,
      estimatedMinutes: session.estimatedMinutes,
      exercises: session.exercises.map(resolveExercise),
      focus: session.focus,
      id: `draft-${remote.id}-week-${week.number}-session-${sessionIndex + 1}`,
      status: 'upcoming',
      title: session.title,
      warmUp: [...session.warmUp],
    })),
  }));

  return {
    changes: [...remote.changes],
    conversationId: 'remote',
    createdAt: remote.createdAt,
    exerciseSubstitutions: [],
    id: remote.id,
    plan: { id: `remote-draft-${remote.id}`, name: remote.name, version: 'Borrador remoto · 4 semanas', weeks },
    request: { origin: 'remote-assistant' },
    reviewItems: [...remote.reviewItems],
    sourcePlanId: sourcePlan.id,
    sourcePlanVersion: sourcePlan.version,
  };
}
