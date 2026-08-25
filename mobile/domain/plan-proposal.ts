import { planGoalLabel, trainingAvailabilityLabel, trainingEnvironmentLabel } from '@/domain/plan-conversation';
import type { PlanConversation, PlanRequest } from '@/domain/plan-conversation';
import type { Exercise, MonthlyPlan, PlanWeek, WorkoutSession } from '@/domain/models';

export interface PlanProposal {
  id: string;
  conversationId: string;
  sourcePlanId: string;
  sourcePlanVersion: string;
  request: PlanRequest;
  plan: MonthlyPlan;
  changes: string[];
  reviewItems: string[];
  createdAt: string;
}

interface SessionTemplate {
  dayLabel: string;
  title: string;
  focus: string;
  exerciseIds: string[];
}

const weeklyGoals = [
  'Encontrar un punto de partida sostenible',
  'Consolidar el ritmo elegido',
  'Progresar con control',
  'Cerrar el ciclo y recoger feedback',
];

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneExercise(exercise: Exercise): Exercise {
  return {
    ...exercise,
    techniqueSteps: exercise.techniqueSteps.map((step) => ({ ...step })),
    commonMistakes: [...exercise.commonMistakes],
    sets: exercise.sets.map((set) => ({ ...set })),
  };
}

function exerciseIndex(plan: MonthlyPlan): Map<string, Exercise> {
  const exercises = plan.weeks.flatMap((week) => week.sessions).flatMap((session) => session.exercises);
  return new Map(exercises.map((exercise) => [exercise.id, exercise]));
}

function templatesForAvailability(request: PlanRequest): SessionTemplate[] {
  const lower: SessionTemplate = {
    dayLabel: 'Lunes',
    title: 'Tren inferior',
    focus: 'Base, control y estabilidad',
    exerciseIds: ['sentadilla-goblet', 'peso-muerto-rumano', 'subida-cajon', 'dead-bug'],
  };
  const upper: SessionTemplate = {
    dayLabel: 'Miércoles',
    title: 'Tren superior',
    focus: 'Empuje y tracción equilibrados',
    exerciseIds: ['press-pecho-mancuernas', 'remo-sentado', 'dead-bug'],
  };
  const full: SessionTemplate = {
    dayLabel: 'Viernes',
    title: 'Cuerpo completo',
    focus: 'Técnica y ritmo sostenible',
    exerciseIds: ['sentadilla-goblet', 'press-pecho-mancuernas', 'remo-sentado'],
  };

  switch (request.availability) {
    case 'two-days':
      return [
        { ...lower, dayLabel: 'Martes', title: 'Cuerpo completo A', exerciseIds: ['sentadilla-goblet', 'press-pecho-mancuernas', 'remo-sentado', 'dead-bug'] },
        { ...full, dayLabel: 'Viernes', title: 'Cuerpo completo B', exerciseIds: ['peso-muerto-rumano', 'subida-cajon', 'press-pecho-mancuernas', 'dead-bug'] },
      ];
    case 'four-days':
      return [
        { ...lower, dayLabel: 'Lunes' },
        { ...upper, dayLabel: 'Martes' },
        { ...lower, dayLabel: 'Jueves', title: 'Tren inferior · técnica', focus: 'Patrones con margen' },
        { ...upper, dayLabel: 'Viernes', title: 'Tren superior · técnica', focus: 'Control y consistencia' },
      ];
    case 'five-days':
      return [
        { ...lower, dayLabel: 'Lunes' },
        { ...upper, dayLabel: 'Martes' },
        { ...full, dayLabel: 'Miércoles', title: 'Cuerpo completo · ligero', focus: 'Práctica y movilidad' },
        { ...lower, dayLabel: 'Jueves', title: 'Tren inferior · técnica', focus: 'Patrones con margen' },
        { ...upper, dayLabel: 'Viernes', title: 'Tren superior · técnica', focus: 'Control y consistencia' },
      ];
    case 'three-days':
    default:
      return [lower, upper, full];
  }
}

function proposalName(request: PlanRequest): string {
  switch (request.goal) {
    case 'strength':
      return 'Fuerza con control';
    case 'muscle':
      return 'Volumen sostenible';
    case 'general-fitness':
      return 'Forma física general';
    case 'returning':
      return 'Vuelta al entrenamiento';
    default:
      return request.goalDetails.trim() || 'Próximo ciclo';
  }
}

function createSession(
  template: SessionTemplate,
  weekNumber: number,
  sessionIndex: number,
  request: PlanRequest,
  exercisesById: Map<string, Exercise>,
): WorkoutSession {
  const exercises = template.exerciseIds
    .map((exerciseId) => exercisesById.get(exerciseId))
    .filter((exercise): exercise is Exercise => exercise !== undefined)
    .map(cloneExercise);
  const prioritySuffix = request.priorities.trim() ? ` · Prioridad: ${request.priorities.trim()}` : '';

  return {
    id: `propuesta-semana-${weekNumber}-sesion-${sessionIndex + 1}`,
    dayLabel: template.dayLabel,
    title: template.title,
    focus: `${template.focus}${prioritySuffix}`,
    estimatedMinutes: request.sessionDurationMinutes,
    status: 'upcoming',
    warmUp: ['5 min de movimiento suave', 'Movilidad específica de las articulaciones principales', 'Series de aproximación del primer ejercicio'],
    exercises,
    coolDown: 'Camina unos minutos y deja una nota sobre cómo te ha ido.',
  };
}

function createProposalPlan(request: PlanRequest, sourcePlan: MonthlyPlan): MonthlyPlan {
  const exercisesById = exerciseIndex(sourcePlan);
  const templates = templatesForAvailability(request);
  const weeks: PlanWeek[] = weeklyGoals.map((goal, weekIndex) => ({
    number: weekIndex + 1,
    goal,
    sessions: templates.map((template, sessionIndex) => createSession(template, weekIndex + 1, sessionIndex, request, exercisesById)),
  }));

  return {
    id: `propuesta-${sourcePlan.id}-${Date.now()}`,
    name: proposalName(request),
    version: 'Borrador · 4 semanas',
    weeks,
  };
}

function createChanges(request: PlanRequest): string[] {
  const changes = [
    `Objetivo: ${planGoalLabel(request.goal, request.goalDetails)}.`,
    `${trainingAvailabilityLabel(request.availability)} por semana · sesiones de ${request.sessionDurationMinutes} min.`,
  ];

  if (request.priorities.trim()) {
    changes.push(`Prioridad declarada: ${request.priorities.trim()}.`);
  }
  if (request.exercisePreferences.trim()) {
    changes.push(`Ejercicios: ${request.exercisePreferences.trim()}.`);
  }

  return changes;
}

function createReviewItems(request: PlanRequest): string[] {
  const reviewItems = [`Entorno indicado: ${trainingEnvironmentLabel(request.environment, request.environmentDetails)}.`];

  if (request.environment === 'home' || request.environment === 'mixed') {
    reviewItems.push('La selección local actual está centrada en gimnasio; revisa el material antes de publicar este borrador.');
  }
  if (request.declaredLimitations.trim()) {
    reviewItems.push('El borrador conserva las limitaciones declaradas en el perfil para revisarlas antes de publicar.');
  }
  if (request.additionalContext.trim()) {
    reviewItems.push(`Contexto adicional: ${request.additionalContext.trim()}.`);
  }

  return reviewItems;
}

/**
 * Generates a reviewable local template from the structured conversation. It never changes the
 * currently published plan; a remote assistant can replace this generator through the same contract.
 */
export function createPlanProposal(conversation: PlanConversation, sourcePlan: MonthlyPlan): PlanProposal {
  const createdAt = new Date().toISOString();

  return {
    id: createId('plan-proposal'),
    conversationId: conversation.id,
    sourcePlanId: sourcePlan.id,
    sourcePlanVersion: sourcePlan.version,
    request: conversation.request,
    plan: createProposalPlan(conversation.request, sourcePlan),
    changes: createChanges(conversation.request),
    reviewItems: createReviewItems(conversation.request),
    createdAt,
  };
}
