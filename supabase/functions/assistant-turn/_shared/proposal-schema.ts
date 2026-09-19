export interface GeneratedSet {
  rest: string;
  target: string;
}

export interface AssistantExerciseTechniqueStep {
  description: string;
  label: string;
}

/** A candidate exercise returned by the model. It gets a database ID only after plan confirmation. */
export interface AssistantExerciseCandidate {
  breathing: string;
  coachingCue: string;
  commonMistakes: string[];
  equipment: string;
  equipmentSetup: string;
  execution: string;
  key: string;
  name: string;
  preparation: string;
  techniqueSteps: AssistantExerciseTechniqueStep[];
}

export type GeneratedExercise = {
  exerciseId: string;
  sets: GeneratedSet[];
  source: 'catalog';
} | {
  assistantExerciseKey: string;
  sets: GeneratedSet[];
  source: 'assistant';
};

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
  assistantExercises: AssistantExerciseCandidate[];
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
const candidateKeyPattern = /^[a-z0-9][a-z0-9-]{0,63}$/;

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

function parseTechniqueStep(value: unknown): AssistantExerciseTechniqueStep {
  if (!isRecord(value)) {
    throw new Error('Un paso técnico no es válido.');
  }

  return {
    description: requiredText(value.description, 'La descripción de un paso técnico', 500),
    label: requiredText(value.label, 'La etiqueta de un paso técnico', 80),
  };
}

function parseAssistantExerciseCandidate(value: unknown): AssistantExerciseCandidate {
  if (!isRecord(value)) {
    throw new Error('Una ficha de ejercicio asistida no es válida.');
  }

  const key = requiredText(value.key, 'La clave de un ejercicio asistido', 64);

  if (!candidateKeyPattern.test(key)) {
    throw new Error('La clave de un ejercicio asistido debe usar minúsculas, números y guiones.');
  }

  if (!Array.isArray(value.techniqueSteps) || value.techniqueSteps.length < 2 || value.techniqueSteps.length > 8) {
    throw new Error('Un ejercicio asistido debe incluir entre dos y ocho pasos técnicos.');
  }

  return {
    breathing: requiredText(value.breathing, 'La respiración del ejercicio', 500),
    coachingCue: requiredText(value.coachingCue, 'La indicación técnica', 500),
    commonMistakes: textList(value.commonMistakes, 'Los errores comunes', 10, 300),
    equipment: requiredText(value.equipment, 'El material del ejercicio', 240),
    equipmentSetup: requiredText(value.equipmentSetup, 'La preparación del material', 500),
    execution: requiredText(value.execution, 'La ejecución del ejercicio', 1_500),
    key,
    name: requiredText(value.name, 'El nombre del ejercicio', 160),
    preparation: requiredText(value.preparation, 'La preparación del ejercicio', 1_500),
    techniqueSteps: value.techniqueSteps.map(parseTechniqueStep),
  };
}

function parseExercise(
  value: unknown,
  allowedCatalogExerciseIds: ReadonlySet<string>,
  assistantExerciseKeys: ReadonlySet<string>,
): GeneratedExercise {
  if (!isRecord(value) || (value.source !== 'catalog' && value.source !== 'assistant')) {
    throw new Error('Una sesión contiene un ejercicio no válido.');
  }

  if (!Array.isArray(value.sets) || value.sets.length === 0 || value.sets.length > 6) {
    throw new Error('Un ejercicio debe incluir entre una y seis pautas de series.');
  }

  const sets = value.sets.map(parseSet);

  if (value.source === 'catalog') {
    if (typeof value.exerciseId !== 'string' || !allowedCatalogExerciseIds.has(value.exerciseId)) {
      throw new Error('La propuesta contiene una referencia de catálogo que no está disponible.');
    }

    return { exerciseId: value.exerciseId, sets, source: 'catalog' };
  }

  if (typeof value.assistantExerciseKey !== 'string' || !assistantExerciseKeys.has(value.assistantExerciseKey)) {
    throw new Error('La propuesta referencia un ejercicio asistido que no fue definido.');
  }

  return { assistantExerciseKey: value.assistantExerciseKey, sets, source: 'assistant' };
}

function exerciseReference(value: unknown): string {
  if (!isRecord(value)) {
    throw new Error('Una sesión contiene un ejercicio no válido.');
  }

  if (value.source === 'catalog' && typeof value.exerciseId === 'string') {
    return `catalog:${value.exerciseId}`;
  }

  if (value.source === 'assistant' && typeof value.assistantExerciseKey === 'string') {
    return `assistant:${value.assistantExerciseKey}`;
  }

  throw new Error('Una sesión contiene un ejercicio no válido.');
}

function parseSession(
  value: unknown,
  allowedCatalogExerciseIds: ReadonlySet<string>,
  assistantExerciseKeys: ReadonlySet<string>,
): GeneratedSession {
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

  const exerciseReferences = value.exercises.map(exerciseReference);

  if (new Set(exerciseReferences).size !== exerciseReferences.length) {
    throw new Error('Una sesión no puede repetir un ejercicio.');
  }

  return {
    coolDown: requiredText(value.coolDown, 'El enfriamiento', 500),
    dayLabel: requiredText(value.dayLabel, 'El día de la sesión', 80),
    estimatedMinutes: value.estimatedMinutes,
    exercises: value.exercises.map((exercise) => parseExercise(exercise, allowedCatalogExerciseIds, assistantExerciseKeys)),
    focus: requiredText(value.focus, 'El foco de la sesión', 500),
    title: requiredText(value.title, 'El título de la sesión', 160),
    warmUp: textList(value.warmUp, 'El calentamiento', 6, 240),
  };
}

function parseWeek(
  value: unknown,
  expectedNumber: number,
  allowedCatalogExerciseIds: ReadonlySet<string>,
  assistantExerciseKeys: ReadonlySet<string>,
): GeneratedWeek {
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
    sessions: value.sessions.map((session) => parseSession(session, allowedCatalogExerciseIds, assistantExerciseKeys)),
  };
}

function parseProposal(value: unknown, allowedCatalogExerciseIds: ReadonlySet<string>): GeneratedPlanProposal {
  if (!isRecord(value)
    || !Array.isArray(value.weeks)
    || value.weeks.length !== 4
    || !Array.isArray(value.assistantExercises)
    || value.assistantExercises.length > 20) {
    throw new Error('Una propuesta debe incluir exactamente cuatro semanas y una lista válida de ejercicios asistidos.');
  }

  const assistantExercises = value.assistantExercises.map(parseAssistantExerciseCandidate);
  const assistantExerciseKeys = new Set(assistantExercises.map((exercise) => exercise.key));

  if (assistantExerciseKeys.size !== assistantExercises.length) {
    throw new Error('Una propuesta no puede repetir la clave de un ejercicio asistido.');
  }

  return {
    assistantExercises,
    changes: textList(value.changes, 'Los cambios de la propuesta', 20, 500),
    name: requiredText(value.name, 'El nombre del plan', 160),
    reviewItems: textList(value.reviewItems, 'Los puntos de revisión', 20, 500),
    weeks: value.weeks.map((week, index) => parseWeek(week, index + 1, allowedCatalogExerciseIds, assistantExerciseKeys)),
  };
}

/**
 * Validates untrusted model output before it can be stored as a reviewable proposal. Existing
 * catalogue references must be active for the person; the model may additionally define
 * structured assistant exercise candidates. Those candidates receive private catalogue IDs only
 * after the person confirms publication.
 */
export function parseAssistantModelOutput(value: unknown, allowedCatalogExerciseIds: ReadonlySet<string>): AssistantModelOutput {
  if (!isRecord(value)
    || (value.safetyStatus !== 'clear' && value.safetyStatus !== 'needs-professional-review')) {
    throw new Error('La respuesta del asistente no tiene un estado de seguridad válido.');
  }

  const proposal = value.proposal === null
    ? null
    : parseProposal(value.proposal, allowedCatalogExerciseIds);

  if (value.safetyStatus === 'needs-professional-review' && proposal !== null) {
    throw new Error('Una respuesta que requiere revisión profesional no puede incluir una propuesta.');
  }

  return {
    assistantMessage: requiredText(value.assistantMessage, 'El mensaje del asistente', 2_000),
    proposal,
    safetyStatus: value.safetyStatus,
  };
}
