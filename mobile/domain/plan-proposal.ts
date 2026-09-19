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

const compoundStrengthExerciseIds = new Set([
  'sentadilla-barra',
  'sentadilla-goblet',
  'peso-muerto-rumano',
  'zancada-mancuernas',
  'subida-cajon',
  'press-banca-barra',
  'press-pecho-mancuernas',
  'jalon-pecho-polea',
  'remo-sentado',
  'sentadilla-peso-corporal',
  'zancada-peso-corporal',
  'flexiones',
  'sentadilla-banda',
  'remo-banda-sentado',
  'press-pecho-banda',
  'remo-mancuerna-banco',
  'press-hombros-mancuernas',
]);

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneExercise(exercise: Exercise, trainingExperience: PlanRequest['trainingExperience']): Exercise {
  const sets = exercise.sets.map((set) => ({ ...set }));
  const adjustedSets = trainingExperience === 'starting'
    ? sets.slice(0, 1).map((set) => ({
      ...set,
      target: set.target
        .replace(/^\d+\s*×/, '2 ×')
        .replace(/RPE\s*\d+/, 'RPE 6'),
    }))
    : sets;

  return {
    ...exercise,
    techniqueSteps: exercise.techniqueSteps.map((step) => ({ ...step })),
    commonMistakes: [...exercise.commonMistakes],
    sets: adjustedSets,
  };
}

function exerciseIndex(plan: MonthlyPlan): Map<string, Exercise> {
  const planExercises = plan.weeks.flatMap((week) => week.sessions).flatMap((session) => session.exercises);
  return new Map([...curatedExercises, ...planExercises].map((exercise) => [exercise.id, exercise]));
}

function effectiveEquipmentAccess(request: PlanRequest): PlanRequest['equipmentAccess'] {
  if (request.environment === 'gym') {
    return 'full-gym';
  }

  if (request.environment === 'home' && request.equipmentAccess === 'full-gym') {
    return 'bodyweight';
  }

  return request.equipmentAccess;
}

function scheduleTemplates(
  request: PlanRequest,
  lower: SessionTemplate,
  upper: SessionTemplate,
  full: SessionTemplate,
): SessionTemplate[] {
  switch (request.availability) {
    case 'two-days':
      return [
        { ...full, dayLabel: 'Martes', title: 'Cuerpo completo A' },
        { ...full, dayLabel: 'Viernes', title: 'Cuerpo completo B', focus: `${full.focus} · variación` },
      ];
    case 'four-days':
      return [
        { ...lower, dayLabel: 'Lunes' },
        { ...upper, dayLabel: 'Martes' },
        { ...lower, dayLabel: 'Jueves', title: `${lower.title} · técnica`, focus: 'Patrones con margen' },
        { ...upper, dayLabel: 'Viernes', title: `${upper.title} · técnica`, focus: 'Control y consistencia' },
      ];
    case 'five-days':
      return [
        { ...lower, dayLabel: 'Lunes' },
        { ...upper, dayLabel: 'Martes' },
        { ...full, dayLabel: 'Miércoles', title: 'Cuerpo completo · ligero', focus: 'Práctica y movilidad' },
        { ...lower, dayLabel: 'Jueves', title: `${lower.title} · técnica`, focus: 'Patrones con margen' },
        { ...upper, dayLabel: 'Viernes', title: `${upper.title} · técnica`, focus: 'Control y consistencia' },
      ];
    case 'three-days':
    default:
      return [lower, upper, full];
  }
}

function templatesForAvailability(request: PlanRequest): SessionTemplate[] {
  const equipmentAccess = effectiveEquipmentAccess(request);

  if (equipmentAccess === 'bodyweight') {
    const fullA: SessionTemplate = {
      dayLabel: 'Lunes',
      title: 'Cuerpo completo',
      focus: 'Patrones básicos con peso corporal',
      exerciseIds: ['sentadilla-peso-corporal', 'zancada-peso-corporal', 'flexiones', 'dead-bug'],
    };
    const fullB: SessionTemplate = {
      dayLabel: 'Miércoles',
      title: 'Cuerpo completo',
      focus: 'Control, equilibrio y empuje',
      exerciseIds: ['zancada-peso-corporal', 'sentadilla-peso-corporal', 'flexiones', 'plancha-rotacion'],
    };

    return scheduleTemplates(request, fullA, fullB, fullA);
  }

  const templatesByEquipment: Record<Exclude<PlanRequest['equipmentAccess'], 'bodyweight'>, {
    lower: SessionTemplate;
    upper: SessionTemplate;
    full: SessionTemplate;
  }> = {
    'full-gym': {
      lower: {
        dayLabel: 'Lunes',
        title: 'Tren inferior',
        focus: 'Base, control y estabilidad',
        exerciseIds: ['sentadilla-barra', 'peso-muerto-rumano', 'zancada-mancuernas', 'dead-bug'],
      },
      upper: {
        dayLabel: 'Miércoles',
        title: 'Tren superior',
        focus: 'Empuje y tracción equilibrados',
        exerciseIds: ['press-banca-barra', 'jalon-pecho-polea', 'curl-biceps-mancuernas', 'extension-triceps-polea'],
      },
      full: {
        dayLabel: 'Viernes',
        title: 'Cuerpo completo',
        focus: 'Técnica y ritmo sostenible',
        exerciseIds: ['sentadilla-goblet', 'press-pecho-mancuernas', 'remo-sentado', 'plancha-rotacion'],
      },
    },
    'dumbbells-and-bench': {
      lower: {
        dayLabel: 'Lunes',
        title: 'Tren inferior',
        focus: 'Patrones con mancuernas y control',
        exerciseIds: ['sentadilla-goblet', 'peso-muerto-rumano', 'zancada-mancuernas', 'dead-bug'],
      },
      upper: {
        dayLabel: 'Miércoles',
        title: 'Tren superior',
        focus: 'Empuje y tracción con mancuernas',
        exerciseIds: ['press-pecho-mancuernas', 'remo-mancuerna-banco', 'press-hombros-mancuernas', 'curl-biceps-mancuernas'],
      },
      full: {
        dayLabel: 'Viernes',
        title: 'Cuerpo completo',
        focus: 'Técnica y ritmo con mancuernas',
        exerciseIds: ['sentadilla-goblet', 'press-pecho-mancuernas', 'remo-mancuerna-banco', 'plancha-rotacion'],
      },
    },
    'bands-and-basic': {
      lower: {
        dayLabel: 'Lunes',
        title: 'Cuerpo completo con bandas',
        focus: 'Patrones básicos y tensión controlada',
        exerciseIds: ['sentadilla-banda', 'zancada-peso-corporal', 'press-pecho-banda', 'dead-bug'],
      },
      upper: {
        dayLabel: 'Miércoles',
        title: 'Cuerpo completo con bandas',
        focus: 'Empuje, tracción y control',
        exerciseIds: ['press-pecho-banda', 'remo-banda-sentado', 'sentadilla-banda', 'plancha-rotacion'],
      },
      full: {
        dayLabel: 'Viernes',
        title: 'Cuerpo completo con bandas',
        focus: 'Técnica y ritmo sostenible',
        exerciseIds: ['sentadilla-banda', 'press-pecho-banda', 'remo-banda-sentado', 'dead-bug'],
      },
    },
  };
  const templates = templatesByEquipment[equipmentAccess];

  return scheduleTemplates(request, templates.lower, templates.upper, templates.full);
}

const compatibleExerciseIdsByEquipment: Record<Exclude<PlanRequest['equipmentAccess'], 'full-gym'>, Set<string>> = {
  'dumbbells-and-bench': new Set([
    'sentadilla-goblet',
    'peso-muerto-rumano',
    'zancada-mancuernas',
    'dead-bug',
    'press-pecho-mancuernas',
    'remo-mancuerna-banco',
    'press-hombros-mancuernas',
    'curl-biceps-mancuernas',
    'curl-martillo-mancuernas',
    'plancha-rotacion',
  ]),
  'bands-and-basic': new Set([
    'sentadilla-banda',
    'zancada-peso-corporal',
    'press-pecho-banda',
    'remo-banda-sentado',
    'sentadilla-peso-corporal',
    'flexiones',
    'dead-bug',
    'plancha-rotacion',
  ]),
  bodyweight: new Set([
    'sentadilla-peso-corporal',
    'zancada-peso-corporal',
    'flexiones',
    'dead-bug',
    'plancha-rotacion',
  ]),
};

function isExerciseCompatibleWithEquipment(exerciseId: string, request: PlanRequest): boolean {
  const equipmentAccess = effectiveEquipmentAccess(request);

  return equipmentAccess === 'full-gym' || compatibleExerciseIdsByEquipment[equipmentAccess].has(exerciseId);
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
          exercisesById.has(candidateId)
          && isExerciseCompatibleWithEquipment(candidateId, request)
          && !template.exerciseIds.includes(candidateId)
          && !exerciseIds.includes(candidateId)
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
  const goalName = (() => {
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
  })();

  return request.trainingEmphasis === 'compound-strength' && request.goal !== 'strength'
    ? `Fuerza base · ${goalName}`
    : goalName;
}

function validateCompoundStrengthPriority(templates: SessionTemplate[], request: PlanRequest): void {
  if (request.trainingEmphasis !== 'compound-strength') {
    return;
  }

  const sessionWithoutStrengthBase = templates.find((template) => (
    template.exerciseIds.filter((exerciseId) => compoundStrengthExerciseIds.has(exerciseId)).length < 2
  ));

  if (sessionWithoutStrengthBase) {
    throw new Error('La propuesta no conserva una base suficiente de ejercicios multiarticulares de fuerza.');
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
    .map((exercise) => cloneExercise(exercise, request.trainingExperience));
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
  validateCompoundStrengthPriority(templates, request);
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

function equipmentAccessLabel(equipmentAccess: PlanRequest['equipmentAccess']): string {
  const labels: Record<PlanRequest['equipmentAccess'], string> = {
    'full-gym': 'gimnasio completo',
    'dumbbells-and-bench': 'mancuernas y banco',
    'bands-and-basic': 'bandas y material básico',
    bodyweight: 'solo peso corporal',
  };

  return labels[equipmentAccess];
}

function trainingExperienceLabel(trainingExperience: PlanRequest['trainingExperience']): string {
  const labels: Record<PlanRequest['trainingExperience'], string> = {
    starting: 'estoy empezando',
    'some-experience': 'ya tengo práctica',
    experienced: 'entreno con experiencia',
  };

  return labels[trainingExperience];
}

function createChanges(request: PlanRequest, substitutions: ExerciseSubstitution[]): string[] {
  const effectiveEquipment = effectiveEquipmentAccess(request);
  const changes = [
    `Objetivo: ${planGoalLabel(request.goal, request.goalDetails)}.`,
    `${trainingAvailabilityLabel(request.availability)} por semana · sesiones de ${request.sessionDurationMinutes} min.`,
    `Material aplicado: ${equipmentAccessLabel(effectiveEquipment)} · experiencia declarada: ${trainingExperienceLabel(request.trainingExperience)}.`,
  ];

  if (request.trainingExperience === 'starting') {
    changes.push('Inicio: cada ejercicio usa una única pauta de 2 series con RPE 6 para dejar margen de aprendizaje.');
  }

  if (request.trainingEmphasis === 'compound-strength') {
    changes.push('Base estructural: cada sesión mantiene al menos dos ejercicios multiarticulares de fuerza cuando son compatibles con el contexto indicado.');
  }
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

  if (request.trainingEmphasis === 'compound-strength') {
    reviewItems.push('Revisa que los movimientos multiarticulares propuestos encajen con tu equipo, experiencia y limitaciones antes de publicar.');
  }
  const effectiveEquipment = effectiveEquipmentAccess(request);

  if (effectiveEquipment === 'bands-and-basic') {
    reviewItems.push('Inspecciona las bandas antes de usarlas y descarta las que estén desgastadas o dañadas.');
  }
  if (effectiveEquipment === 'bodyweight') {
    reviewItems.push('Con solo peso corporal el borrador no asume barras, puertas ni mobiliario para traccionar. Añade bandas o material revisado si quieres incorporar un patrón de tracción.');
  }
  if (request.trainingExperience === 'starting') {
    reviewItems.push('Empieza con un rango y una carga que controles; si aparece dolor agudo, detén el ejercicio y consulta a un profesional.');
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
