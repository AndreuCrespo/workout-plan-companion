import type { MonthlyPlan, TrainingAvailability, SessionDurationMinutes, UserProfile, WorkoutLog } from '@/domain/models';

export type PlanGoal = 'strength' | 'muscle' | 'general-fitness' | 'returning' | 'other';
export type TrainingEnvironment = 'gym' | 'home' | 'mixed' | 'other';
type PlanConversationStep = 'goal' | 'availability' | 'duration' | 'environment' | 'priorities' | 'exercise-preferences' | 'additional-context';
export type PlanConversationStatus = 'in-progress' | 'ready';

export interface PlanConversationSuggestion {
  id: string;
  label: string;
}

export interface PlanConversationMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  suggestions?: PlanConversationSuggestion[];
}

export interface ExerciseReference {
  id: string;
  name: string;
}

export type RequestedExerciseChange = ExerciseReference;

export interface PlanRequest {
  sourcePlanId: string;
  sourcePlanVersion: string;
  goal: PlanGoal | null;
  goalDetails: string;
  availability: TrainingAvailability;
  availabilityDetails: string;
  sessionDurationMinutes: SessionDurationMinutes;
  sessionDurationDetails: string;
  environment: TrainingEnvironment | null;
  environmentDetails: string;
  priorities: string;
  exercisePreferences: string;
  availableExercises: ExerciseReference[];
  requestedExerciseChanges: RequestedExerciseChange[];
  additionalContext: string;
  declaredLimitations: string;
}

export interface PlanConversation {
  id: string;
  status: PlanConversationStatus;
  currentStep: PlanConversationStep | null;
  request: PlanRequest;
  messages: PlanConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

interface PlanConversationContext {
  plan: MonthlyPlan;
  profile: UserProfile;
  completedLogs: WorkoutLog[];
}

interface PlanConversationResponse {
  text: string;
  suggestionId?: string;
}

const goalSuggestions: PlanConversationSuggestion[] = [
  { id: 'strength', label: 'Ganar fuerza' },
  { id: 'muscle', label: 'Ganar músculo' },
  { id: 'general-fitness', label: 'Mejorar mi forma física' },
  { id: 'returning', label: 'Retomar el entrenamiento' },
];

const environmentSuggestions: PlanConversationSuggestion[] = [
  { id: 'gym', label: 'Gimnasio' },
  { id: 'home', label: 'En casa' },
  { id: 'mixed', label: 'Ambos' },
];

const prioritySuggestions: PlanConversationSuggestion[] = [
  { id: 'upper-body', label: 'Tren superior' },
  { id: 'lower-body', label: 'Piernas' },
  { id: 'full-body', label: 'Cuerpo completo' },
  { id: 'balanced', label: 'Seguir equilibrado' },
];

const exercisePreferenceSuggestions: PlanConversationSuggestion[] = [
  { id: 'use-feedback', label: 'Usar mis notas anteriores' },
  { id: 'try-variations', label: 'Probar variaciones' },
  { id: 'keep-current', label: 'Mantener lo que funciona' },
];

const replaceExerciseSuggestionPrefix = 'replace-exercise:';

const noMoreContextSuggestion: PlanConversationSuggestion = { id: 'no-more-context', label: 'No, preparar el resumen' };
const supportedSessionDurations = [45, 60, 75] as const;

function now(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function availabilityLabel(availability: TrainingAvailability): string {
  const labels: Record<TrainingAvailability, string> = {
    'two-days': '2 días',
    'three-days': '3 días',
    'four-days': '4 días',
    'five-days': '5 días',
  };

  return labels[availability];
}

function downFeedbackExerciseNames(completedLogs: WorkoutLog[]): string[] {
  return [...new Set(
    completedLogs.flatMap((log) =>
      log.exerciseFeedback
        .filter((feedback) => feedback.reaction === 'down' || feedback.note.trim().length > 0)
        .map((feedback) => feedback.exerciseName),
    ),
  )].slice(0, 2);
}

function createAssistantMessage(
  step: PlanConversationStep | null,
  request: PlanRequest,
  context?: PlanConversationContext,
): PlanConversationMessage {
  const firstName = context?.profile.firstName.trim();
  const feedbackExercises = context ? downFeedbackExerciseNames(context.completedLogs) : [];

  switch (step) {
    case 'goal': {
      const greeting = firstName ? `Hola, ${firstName}. ` : '';
      const feedbackContext = feedbackExercises.length > 0
        ? `Tendré en cuenta tus comentarios sobre ${feedbackExercises.join(' y ')}. `
        : 'Tendré en cuenta las sesiones que has guardado. ';

      return {
        id: createId('assistant'),
        role: 'assistant',
        text: `${greeting}${feedbackContext}¿Qué te gustaría priorizar en tu próximo ciclo?`,
        suggestions: goalSuggestions,
      };
    }
    case 'availability':
      return {
        id: createId('assistant'),
        role: 'assistant',
        text: `Ahora tienes ${availabilityLabel(request.availability)} disponibles. ¿Quieres mantenerlo o cambiarlo?`,
        suggestions: [
          { id: request.availability, label: `Mantener ${availabilityLabel(request.availability)}` },
          { id: 'two-days', label: '2 días' },
          { id: 'three-days', label: '3 días' },
          { id: 'four-days', label: '4 días' },
          { id: 'five-days', label: '5 días' },
        ].filter((suggestion, index, suggestions) => suggestions.findIndex((item) => item.id === suggestion.id) === index),
      };
    case 'duration':
      return {
        id: createId('assistant'),
        role: 'assistant',
        text: `Tus sesiones suelen durar ${request.sessionDurationMinutes} minutos. ¿Qué duración te encaja este mes?`,
        suggestions: supportedSessionDurations.map((minutes) => ({ id: `${minutes}`, label: `${minutes} min` })),
      };
    case 'environment':
      return {
        id: createId('assistant'),
        role: 'assistant',
        text: '¿Dónde entrenarás principalmente durante este ciclo?',
        suggestions: environmentSuggestions,
      };
    case 'priorities':
      return {
        id: createId('assistant'),
        role: 'assistant',
        text: '¿Hay alguna zona, patrón o habilidad que quieras priorizar? También puedes explicármelo con tus palabras.',
        suggestions: prioritySuggestions,
      };
    case 'exercise-preferences':
      return {
        id: createId('assistant'),
        role: 'assistant',
        text: '¿Qué quieres que haga con los ejercicios del ciclo actual? Cuéntame qué ejercicio no te encaja, qué alternativa prefieres o qué material quieres usar. Por ejemplo: “el press de banca no me cuadra; prefiero mancuernas”.',
        suggestions: exercisePreferenceSuggestions,
      };
    case 'additional-context': {
      const requestedChanges = request.requestedExerciseChanges.map((exercise) => exercise.name);
      const replacementContext = requestedChanges.length > 0
        ? ` Prepararé alternativas locales para ${requestedChanges.join(' y ')} y las verás antes de publicar.`
        : '';

      return {
        id: createId('assistant'),
        role: 'assistant',
        text: `${request.declaredLimitations.trim().length > 0
          ? 'Mantendré en cuenta las limitaciones que declaraste en tu perfil. ¿Quieres añadir alguna preferencia o contexto más para la propuesta?'
          : '¿Quieres añadir alguna preferencia o contexto más para la propuesta?'}${replacementContext}`,
        suggestions: [noMoreContextSuggestion],
      };
    }
    default:
      return {
        id: createId('assistant'),
        role: 'assistant',
        text: 'Ya tengo el contexto para preparar el resumen de tu solicitud. Revísalo antes de pedir una propuesta.',
      };
  }
}

function nextStep(step: PlanConversationStep): PlanConversationStep | null {
  const steps: PlanConversationStep[] = [
    'goal',
    'availability',
    'duration',
    'environment',
    'priorities',
    'exercise-preferences',
    'additional-context',
  ];
  const currentIndex = steps.indexOf(step);

  return steps[currentIndex + 1] ?? null;
}

function isTrainingAvailability(value: string | undefined): value is TrainingAvailability {
  return value === 'two-days' || value === 'three-days' || value === 'four-days' || value === 'five-days';
}

function isPlanGoal(value: string | undefined): value is PlanGoal {
  return value === 'strength' || value === 'muscle' || value === 'general-fitness' || value === 'returning' || value === 'other';
}

function isTrainingEnvironment(value: string | undefined): value is TrainingEnvironment {
  return value === 'gym' || value === 'home' || value === 'mixed' || value === 'other';
}

function isSessionDuration(value: unknown): value is SessionDurationMinutes {
  return value === '45' || value === '60' || value === '75';
}

function getSuggestionLabel(step: PlanConversationStep, suggestionId: string | undefined, request?: PlanRequest): string | null {
  if (!suggestionId) {
    return null;
  }

  if (step === 'exercise-preferences' && suggestionId.startsWith(replaceExerciseSuggestionPrefix)) {
    const exerciseId = suggestionId.slice(replaceExerciseSuggestionPrefix.length);
    const exercise = request?.availableExercises.find((item) => item.id === exerciseId);
    return exercise ? `Cambiar ${exercise.name}` : null;
  }

  const suggestionsByStep: Record<PlanConversationStep, PlanConversationSuggestion[]> = {
    goal: goalSuggestions,
    availability: [],
    duration: supportedSessionDurations.map((minutes) => ({ id: `${minutes}`, label: `${minutes} min` })),
    environment: environmentSuggestions,
    priorities: prioritySuggestions,
    'exercise-preferences': exercisePreferenceSuggestions,
    'additional-context': [noMoreContextSuggestion],
  };

  if (step === 'availability' && isTrainingAvailability(suggestionId)) {
    return availabilityLabel(suggestionId);
  }

  return suggestionsByStep[step].find((suggestion) => suggestion.id === suggestionId)?.label ?? null;
}

function normalizedText(value: string): string {
  return value
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-ES');
}

function isExerciseMentioned(response: string, exerciseName: string): boolean {
  const normalizedResponse = normalizedText(response);
  const normalizedExerciseName = normalizedText(exerciseName);

  if (normalizedResponse.includes(normalizedExerciseName)) {
    return true;
  }

  const relevantWords = normalizedExerciseName
    .split(' ')
    .filter((word) => word.length > 2 && !['con', 'del', 'las', 'los', 'para'].includes(word));
  const matchedWordCount = relevantWords.filter((word) => normalizedResponse.includes(word)).length;

  return relevantWords.length <= 2 ? matchedWordCount === relevantWords.length : matchedWordCount >= 2;
}

function getRequestedExerciseChanges(
  request: PlanRequest,
  response: PlanConversationResponse,
  text: string,
): RequestedExerciseChange[] {
  const selectedExerciseId = response.suggestionId?.startsWith(replaceExerciseSuggestionPrefix)
    ? response.suggestionId.slice(replaceExerciseSuggestionPrefix.length)
    : null;
  const selectedExercise = request.availableExercises.find((exercise) => exercise.id === selectedExerciseId);
  const expressesReplacement = /\b(cambia|cambiar|sustituye|sustituir|reemplaza|reemplazar|quita|quitar|evita|evitar)\b|no me (encaja|cuadra)|no quiero/.test(normalizedText(text));
  const mentionedExercises = expressesReplacement
    ? request.availableExercises.filter((exercise) => isExerciseMentioned(text, exercise.name))
    : [];

  return [...new Map([...mentionedExercises, ...(selectedExercise ? [selectedExercise] : [])].map((exercise) => [exercise.id, exercise])).values()];
}

function updateRequestForResponse(
  request: PlanRequest,
  step: PlanConversationStep,
  response: PlanConversationResponse,
): PlanRequest {
  const text = response.text.trim();
  const suggestionLabel = getSuggestionLabel(step, response.suggestionId, request);
  const answer = suggestionLabel ?? text;

  switch (step) {
    case 'goal':
      return {
        ...request,
        goal: isPlanGoal(response.suggestionId) ? response.suggestionId : 'other',
        goalDetails: response.suggestionId ? '' : answer,
      };
    case 'availability':
      return {
        ...request,
        availability: isTrainingAvailability(response.suggestionId) ? response.suggestionId : request.availability,
        availabilityDetails: response.suggestionId ? '' : answer,
      };
    case 'duration': {
      const requestedDuration = supportedSessionDurations.find((duration) => answer.includes(`${duration}`));

      return {
        ...request,
        sessionDurationMinutes: isSessionDuration(response.suggestionId)
          ? Number(response.suggestionId) as SessionDurationMinutes
          : requestedDuration ?? request.sessionDurationMinutes,
        sessionDurationDetails: response.suggestionId ? '' : answer,
      };
    }
    case 'environment':
      return {
        ...request,
        environment: isTrainingEnvironment(response.suggestionId) ? response.suggestionId : 'other',
        environmentDetails: response.suggestionId ? '' : answer,
      };
    case 'priorities':
      return { ...request, priorities: answer };
    case 'exercise-preferences': {
      const requestedExerciseChanges = getRequestedExerciseChanges(request, response, text);
      return { ...request, exercisePreferences: answer, requestedExerciseChanges };
    }
    case 'additional-context':
      return { ...request, additionalContext: response.suggestionId === 'no-more-context' ? '' : answer };
  }
}

export function createPlanConversation(context: PlanConversationContext): PlanConversation {
  const request: PlanRequest = {
    sourcePlanId: context.plan.id,
    sourcePlanVersion: context.plan.version,
    goal: null,
    goalDetails: '',
    availability: context.profile.availability,
    availabilityDetails: '',
    sessionDurationMinutes: context.profile.sessionDurationMinutes,
    sessionDurationDetails: '',
    environment: null,
    environmentDetails: '',
    priorities: '',
    exercisePreferences: '',
    additionalContext: '',
    availableExercises: [...new Map(
      context.plan.weeks
        .flatMap((week) => week.sessions)
        .flatMap((session) => session.exercises)
        .map((exercise) => [exercise.id, { id: exercise.id, name: exercise.name }]),
    ).values()],
    requestedExerciseChanges: [],
    declaredLimitations: context.profile.limitations,
  };
  const timestamp = now();

  return {
    id: createId('plan-conversation'),
    status: 'in-progress',
    currentStep: 'goal',
    request,
    messages: [createAssistantMessage('goal', request, context)],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function respondToPlanConversation(
  conversation: PlanConversation,
  response: PlanConversationResponse,
): PlanConversation {
  if (conversation.status !== 'in-progress' || !conversation.currentStep || response.text.trim().length === 0) {
    return conversation;
  }

  const request = updateRequestForResponse(conversation.request, conversation.currentStep, response);
  const followingStep = nextStep(conversation.currentStep);
  const responseLabel = getSuggestionLabel(conversation.currentStep, response.suggestionId, conversation.request);
  const timestamp = now();

  return {
    ...conversation,
    status: followingStep ? 'in-progress' : 'ready',
    currentStep: followingStep,
    request,
    messages: [
      ...conversation.messages,
      { id: createId('user'), role: 'user', text: responseLabel ?? response.text.trim() },
      createAssistantMessage(followingStep, request),
    ],
    updatedAt: timestamp,
  };
}

export function planGoalLabel(goal: PlanGoal | null, details: string): string {
  const labels: Record<Exclude<PlanGoal, 'other'>, string> = {
    strength: 'Ganar fuerza',
    muscle: 'Ganar músculo',
    'general-fitness': 'Mejorar mi forma física',
    returning: 'Retomar el entrenamiento',
  };

  return goal === 'other' ? details || 'Otro objetivo' : goal ? labels[goal] : 'Sin definir';
}

export function trainingEnvironmentLabel(environment: TrainingEnvironment | null, details: string): string {
  const labels: Record<Exclude<TrainingEnvironment, 'other'>, string> = {
    gym: 'Gimnasio',
    home: 'En casa',
    mixed: 'Gimnasio y casa',
  };

  return environment === 'other' ? details || 'Otro entorno' : environment ? labels[environment] : 'Sin definir';
}

export function trainingAvailabilityLabel(availability: TrainingAvailability): string {
  return availabilityLabel(availability);
}
