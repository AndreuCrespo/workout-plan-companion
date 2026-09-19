export interface GeneratedSet {
  rest: string;
  target: string;
}

export interface GeneratedExercise {
  exerciseId: string;
  sets: GeneratedSet[];
}

export interface GeneratedSession {
  coolDown: string;
  dayLabel: string;
  estimatedMinutes: number;
  exercises: GeneratedExercise[];
  focus: string;
  title: string;
  warmUp: string[];
}

export interface GeneratedWeek {
  goal: string;
  number: number;
  sessions: GeneratedSession[];
}

export interface GeneratedPlanProposal {
  changes: string[];
  name: string;
  reviewItems: string[];
  weeks: GeneratedWeek[];
}

export interface AssistantModelOutput {
  assistantMessage: string;
  proposal: GeneratedPlanProposal | null;
  safetyStatus: 'clear' | 'needs-professional-review';
}

const absoluteLoadPattern = /\b\d+(?:[.,]\d+)?\s*(?:kg|kilos?|lbs?|pounds?)\b/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function requiredText(value: unknown, field: string, maximumLength: number): string {
  if (typeof value !== 'string') {
    throw new Error(`${field} debe ser texto.`);
  }

  const text = value.trim();

  if (text.length === 0 || text.length > maximumLength) {
    throw new Error(`${field} tiene una longitud no válida.`);
  }

  return text;
}

function textList(value: unknown, field: string, maximumItems: number, maximumItemLength: number): string[] {
  if (!Array.isArray(value) || value.length > maximumItems) {
    throw new Error(`${field} debe ser una lista válida.`);
  }

  return value.map((item) => requiredText(item, field, maximumItemLength));
}

function parseSet(value: unknown): GeneratedSet {
  if (!isRecord(value)) {
    throw new Error('Una serie no es válida.');
  }

  const target = requiredText(value.target, 'El objetivo de una serie', 120);

  if (absoluteLoadPattern.test(target)) {
    throw new Error('Una propuesta no puede incluir cargas absolutas.');
  }

  return {
    rest: requiredText(value.rest, 'El descanso de una serie', 80),
    target,
  };
}

function parseExercise(value: unknown, allowedExerciseIds: ReadonlySet<string>): GeneratedExercise {
  if (!isRecord(value) || typeof value.exerciseId !== 'string' || !allowedExerciseIds.has(value.exerciseId)) {
    throw new Error('La propuesta contiene un ejercicio que no pertenece al catálogo permitido.');
  }

  if (!Array.isArray(value.sets) || value.sets.length === 0 || value.sets.length > 6) {
    throw new Error('Un ejercicio debe incluir entre una y seis pautas de series.');
  }

  return {
    exerciseId: value.exerciseId,
    sets: value.sets.map(parseSet),
  };
}

function parseSession(value: unknown, allowedExerciseIds: ReadonlySet<string>): GeneratedSession {
  if (!isRecord(value)
    || typeof value.estimatedMinutes !== 'number'
    || !Number.isInteger(value.estimatedMinutes)
    || value.estimatedMinutes < 10
    || value.estimatedMinutes > 240
    || !Array.isArray(value.exercises)
    || value.exercises.length === 0
    || value.exercises.length > 12) {
    throw new Error('Una sesión propuesta no es válida.');
  }

  const exerciseIds = value.exercises.map((exercise) => {
    if (!isRecord(exercise) || typeof exercise.exerciseId !== 'string') {
      throw new Error('Una sesión contiene un ejercicio no válido.');
    }

    return exercise.exerciseId;
  });

  if (new Set(exerciseIds).size !== exerciseIds.length) {
    throw new Error('Una sesión no puede repetir un ejercicio.');
  }

  return {
    coolDown: requiredText(value.coolDown, 'El enfriamiento', 500),
    dayLabel: requiredText(value.dayLabel, 'El día de la sesión', 80),
    estimatedMinutes: value.estimatedMinutes,
    exercises: value.exercises.map((exercise) => parseExercise(exercise, allowedExerciseIds)),
    focus: requiredText(value.focus, 'El foco de la sesión', 500),
    title: requiredText(value.title, 'El título de la sesión', 160),
    warmUp: textList(value.warmUp, 'El calentamiento', 6, 240),
  };
}

function parseWeek(value: unknown, expectedNumber: number, allowedExerciseIds: ReadonlySet<string>): GeneratedWeek {
  if (!isRecord(value)
    || value.number !== expectedNumber
    || !Array.isArray(value.sessions)
    || value.sessions.length === 0
    || value.sessions.length > 5) {
    throw new Error('Una semana propuesta no es válida.');
  }

  return {
    goal: requiredText(value.goal, 'El objetivo semanal', 400),
    number: expectedNumber,
    sessions: value.sessions.map((session) => parseSession(session, allowedExerciseIds)),
  };
}

function parseProposal(value: unknown, allowedExerciseIds: ReadonlySet<string>): GeneratedPlanProposal {
  if (!isRecord(value) || !Array.isArray(value.weeks) || value.weeks.length !== 4) {
    throw new Error('Una propuesta debe incluir exactamente cuatro semanas.');
  }

  return {
    changes: textList(value.changes, 'Los cambios de la propuesta', 20, 500),
    name: requiredText(value.name, 'El nombre del plan', 160),
    reviewItems: textList(value.reviewItems, 'Los puntos de revisión', 20, 500),
    weeks: value.weeks.map((week, index) => parseWeek(week, index + 1, allowedExerciseIds)),
  };
}

/**
 * Validates untrusted model output before it can be stored as a reviewable proposal. Contextual
 * checks (availability, duration, equipment, limitations, and catalogue activity) run after the
 * Edge Function reads the authenticated person's server-side data.
 */
export function parseAssistantModelOutput(value: unknown, allowedExerciseIds: ReadonlySet<string>): AssistantModelOutput {
  if (!isRecord(value)
    || (value.safetyStatus !== 'clear' && value.safetyStatus !== 'needs-professional-review')) {
    throw new Error('La respuesta del asistente no tiene un estado de seguridad válido.');
  }

  const proposal = value.proposal === null
    ? null
    : parseProposal(value.proposal, allowedExerciseIds);

  if (value.safetyStatus === 'needs-professional-review' && proposal !== null) {
    throw new Error('Una respuesta que requiere revisión profesional no puede incluir una propuesta.');
  }

  return {
    assistantMessage: requiredText(value.assistantMessage, 'El mensaje del asistente', 2_000),
    proposal,
    safetyStatus: value.safetyStatus,
  };
}
