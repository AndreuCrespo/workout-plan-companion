import { curatedExercises } from '@/data/curated-exercise-catalog';
import { planGoalLabel, trainingAvailabilityLabel, trainingEnvironmentLabel } from '@/domain/plan-conversation';
import type { PlanConversation, PlanRequest } from '@/domain/plan-conversation';
import type { Exercise, MonthlyPlan, PlanWeek, WorkoutSession } from '@/domain/models';

export interface ExerciseSubstitution {
  fromExerciseId: string;
  fromExerciseName: string;
  toExerciseId: string;
  toExerciseName: string;
}

export interface PlanProposal {
  id: string;
  conversationId: string;
  sourcePlanId: string;
  sourcePlanVersion: string;
  request: PlanRequest;
  plan: MonthlyPlan;
  changes: string[];
  exerciseSubstitutions: ExerciseSubstitution[];
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
  const planExercises = plan.weeks.flatMap((week) => week.sessions).flatMap((session) => session.exercises);
  return new Map([...curatedExercises, ...planExercises].map((exercise) => [exercise.id, exercise]));
}

function templatesForAvailability(request: PlanRequest): SessionTemplate[] {
  const lower: SessionTemplate = {
    dayLabel: 'Lunes',
    title: 'Tren inferior',
    focus: 'Base, control y estabilidad',
    exerciseIds: ['sentadilla-barra', 'peso-muerto-rumano', 'zancada-mancuernas', 'dead-bug'],
  };
  const upper: SessionTemplate = {
    dayLabel: 'Miércoles',
    title: 'Tren superior',
    focus: 'Empuje y tracción equilibrados',
    exerciseIds: ['press-banca-barra', 'jalon-pecho-polea', 'curl-biceps-mancuernas', 'extension-triceps-polea'],
  };
  const full: SessionTemplate = {
    dayLabel: 'Viernes',
    title: 'Cuerpo completo',
    focus: 'Técnica y ritmo sostenible',
    exerciseIds: ['sentadilla-goblet', 'press-pecho-mancuernas', 'remo-sentado', 'plancha-rotacion'],
  };

  switch (request.availability) {
    case 'two-days':
      return [
        { ...lower, dayLabel: 'Martes', title: 'Cuerpo completo A', exerciseIds: ['sentadilla-goblet', 'press-pecho-mancuernas', 'jalon-pecho-polea', 'dead-bug'] },
        { ...full, dayLabel: 'Viernes', title: 'Cuerpo completo B', exerciseIds: ['peso-muerto-rumano', 'zancada-mancuernas', 'press-banca-barra', 'plancha-rotacion'] },
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

const replacementOptionsByExerciseId: Record<string, string[]> = {
  'sentadilla-barra': ['sentadilla-goblet', 'subida-cajon'],
  'sentadilla-goblet': ['sentadilla-barra', 'subida-cajon'],
  'peso-muerto-rumano': ['subida-cajon', 'zancada-mancuernas'],
  'zancada-mancuernas': ['sentadilla-goblet', 'subida-cajon'],
  'dead-bug': ['plancha-rotacion'],
  'plancha-rotacion': ['dead-bug'],
  'press-banca-barra': ['press-pecho-mancuernas'],
  'press-pecho-mancuernas': ['press-banca-barra'],
  'jalon-pecho-polea': ['remo-sentado'],
  'remo-sentado': ['jalon-pecho-polea'],
  'curl-biceps-mancuernas': ['curl-martillo-mancuernas'],
  'extension-triceps-polea': ['extension-triceps-cuerda'],
};

function applyRequestedExerciseChanges(
  templates: SessionTemplate[],
  request: PlanRequest,
  exercisesById: Map<string, Exercise>,
): { templates: SessionTemplate[]; substitutions: ExerciseSubstitution[] } {
  const requestedIds = new Set(request.requestedExerciseChanges.map((exercise) => exercise.id));
  const substitutions = new Map<string, ExerciseSubstitution>();

  const updatedTemplates = templates.map((template) => {
    const exerciseIds: string[] = [];

    for (const exerciseId of template.exerciseIds) {
      const replacementId = requestedIds.has(exerciseId)
        ? replacementOptionsByExerciseId[exerciseId]?.find((candidateId) => (
          exercisesById.has(candidateId) && !template.exerciseIds.includes(candidateId) && !exerciseIds.includes(candidateId)
        ))
        : undefined;
      const finalExerciseId = replacementId ?? exerciseId;
      exerciseIds.push(finalExerciseId);

      if (replacementId) {
        const fromExercise = exercisesById.get(exerciseId);
        const toExercise = exercisesById.get(replacementId);

        if (fromExercise && toExercise) {
          substitutions.set(`${exerciseId}:${replacementId}`, {
            fromExerciseId: exerciseId,
            fromExerciseName: fromExercise.name,
            toExerciseId: replacementId,
            toExerciseName: toExercise.name,
          });
        }
      }
    }

    return { ...template, exerciseIds };
  });

  return { templates: updatedTemplates, substitutions: [...substitutions.values()] };
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

function createProposalPlan(
  request: PlanRequest,
  sourcePlan: MonthlyPlan,
): { plan: MonthlyPlan; substitutions: ExerciseSubstitution[] } {
  const exercisesById = exerciseIndex(sourcePlan);
  const { templates, substitutions } = applyRequestedExerciseChanges(
    templatesForAvailability(request),
    request,
    exercisesById,
  );
  const weeks: PlanWeek[] = weeklyGoals.map((goal, weekIndex) => ({
    number: weekIndex + 1,
    goal,
    sessions: templates.map((template, sessionIndex) => createSession(template, weekIndex + 1, sessionIndex, request, exercisesById)),
  }));

  return {
    plan: {
      id: `propuesta-${sourcePlan.id}-${Date.now()}`,
      name: proposalName(request),
      version: 'Borrador · 4 semanas',
      weeks,
    },
    substitutions,
  };
}

function createChanges(request: PlanRequest, substitutions: ExerciseSubstitution[]): string[] {
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
  substitutions.forEach((substitution) => {
    changes.push(`Cambio solicitado: ${substitution.fromExerciseName} → ${substitution.toExerciseName}.`);
  });

  return changes;
}

function createReviewItems(request: PlanRequest, substitutions: ExerciseSubstitution[]): string[] {
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
  if (substitutions.length > 0) {
    reviewItems.push('Comprueba que las alternativas propuestas te resultan cómodas y se ajustan al material disponible antes de publicar.');
  }

  return reviewItems;
}

/**
 * Generates a reviewable local template from the structured conversation. It never changes the
 * currently published plan; a remote assistant can replace this generator through the same contract.
 */
export function createPlanProposal(conversation: PlanConversation, sourcePlan: MonthlyPlan): PlanProposal {
  const createdAt = new Date().toISOString();
  const { plan, substitutions } = createProposalPlan(conversation.request, sourcePlan);

  return {
    id: createId('plan-proposal'),
    conversationId: conversation.id,
    sourcePlanId: sourcePlan.id,
    sourcePlanVersion: sourcePlan.version,
    request: conversation.request,
    plan,
    changes: createChanges(conversation.request, substitutions),
    exerciseSubstitutions: substitutions,
    reviewItems: createReviewItems(conversation.request, substitutions),
    createdAt,
  };
}
