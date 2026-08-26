import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PlanConversation, PlanConversationMessage, PlanConversationSuggestion, PlanRequest } from '@/domain/plan-conversation';
import type { PlanConversationRepository } from '@/repositories/plan-conversation-repository';

const STORAGE_KEY = '@gimnasio/plan-conversation';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAvailability(value: unknown): value is PlanRequest['availability'] {
  return value === 'two-days' || value === 'three-days' || value === 'four-days' || value === 'five-days';
}

function isDuration(value: unknown): value is PlanRequest['sessionDurationMinutes'] {
  return value === 45 || value === 60 || value === 75;
}

function isGoal(value: unknown): value is NonNullable<PlanRequest['goal']> {
  return value === 'strength' || value === 'muscle' || value === 'general-fitness' || value === 'returning' || value === 'other';
}

function isEnvironment(value: unknown): value is NonNullable<PlanRequest['environment']> {
  return value === 'gym' || value === 'home' || value === 'mixed' || value === 'other';
}

function isSuggestion(value: unknown): value is PlanConversationSuggestion {
  return isRecord(value) && typeof value.id === 'string' && typeof value.label === 'string';
}

function isExerciseReference(value: unknown): value is PlanRequest['availableExercises'][number] {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string';
}

function isMessage(value: unknown): value is PlanConversationMessage {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    (value.role === 'assistant' || value.role === 'user') &&
    typeof value.text === 'string' &&
    (value.suggestions === undefined || (Array.isArray(value.suggestions) && value.suggestions.every(isSuggestion)))
  );
}

function parseRequest(value: unknown): PlanRequest | null {
  if (
    !isRecord(value) ||
    typeof value.sourcePlanId !== 'string' ||
    typeof value.sourcePlanVersion !== 'string' ||
    (value.goal !== null && !isGoal(value.goal)) ||
    typeof value.goalDetails !== 'string' ||
    !isAvailability(value.availability) ||
    typeof value.availabilityDetails !== 'string' ||
    !isDuration(value.sessionDurationMinutes) ||
    typeof value.sessionDurationDetails !== 'string' ||
    (value.environment !== null && !isEnvironment(value.environment)) ||
    typeof value.environmentDetails !== 'string' ||
    typeof value.priorities !== 'string' ||
    typeof value.exercisePreferences !== 'string' ||
    typeof value.additionalContext !== 'string' ||
    typeof value.declaredLimitations !== 'string'
  ) {
    return null;
  }

  const availableExercises = value.availableExercises === undefined
    ? []
    : Array.isArray(value.availableExercises) && value.availableExercises.every(isExerciseReference)
      ? value.availableExercises
      : null;
  const requestedExerciseChanges = value.requestedExerciseChanges === undefined
    ? []
    : Array.isArray(value.requestedExerciseChanges) && value.requestedExerciseChanges.every(isExerciseReference)
      ? value.requestedExerciseChanges
      : null;

  if (!availableExercises || !requestedExerciseChanges) {
    return null;
  }

  return {
    sourcePlanId: value.sourcePlanId,
    sourcePlanVersion: value.sourcePlanVersion,
    goal: value.goal,
    goalDetails: value.goalDetails,
    availability: value.availability,
    availabilityDetails: value.availabilityDetails,
    sessionDurationMinutes: value.sessionDurationMinutes,
    sessionDurationDetails: value.sessionDurationDetails,
    environment: value.environment,
    environmentDetails: value.environmentDetails,
    priorities: value.priorities,
    exercisePreferences: value.exercisePreferences,
    availableExercises,
    requestedExerciseChanges,
    additionalContext: value.additionalContext,
    declaredLimitations: value.declaredLimitations,
  };
}

function isCurrentStep(value: unknown): value is NonNullable<PlanConversation['currentStep']> {
  return (
    value === 'goal' ||
    value === 'availability' ||
    value === 'duration' ||
    value === 'environment' ||
    value === 'priorities' ||
    value === 'exercise-preferences' ||
    value === 'additional-context'
  );
}

function parseConversation(value: unknown): PlanConversation | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    (value.status !== 'in-progress' && value.status !== 'ready') ||
    (value.currentStep !== null && !isCurrentStep(value.currentStep)) ||
    !Array.isArray(value.messages) ||
    !value.messages.every(isMessage) ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string'
  ) {
    return null;
  }

  const request = parseRequest(value.request);

  if (!request || (value.status === 'in-progress' && value.currentStep === null) || (value.status === 'ready' && value.currentStep !== null)) {
    return null;
  }

  return {
    id: value.id,
    status: value.status,
    currentStep: value.currentStep,
    request,
    messages: value.messages,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

class LocalPlanConversationRepository implements PlanConversationRepository {
  private writeQueue: Promise<void> = Promise.resolve();

  async getCurrent(): Promise<PlanConversation | null> {
    try {
      const storedConversation = await AsyncStorage.getItem(STORAGE_KEY);
      return storedConversation ? parseConversation(JSON.parse(storedConversation)) : null;
    } catch {
      return null;
    }
  }

  async save(conversation: PlanConversation): Promise<void> {
    await this.enqueueWrite(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversation)));
  }

  async clear(): Promise<void> {
    await this.enqueueWrite(() => AsyncStorage.removeItem(STORAGE_KEY));
  }

  private enqueueWrite<TValue>(write: () => Promise<TValue>): Promise<TValue> {
    const result = this.writeQueue.then(write);
    this.writeQueue = result.then(
      () => undefined,
      () => undefined,
    );

    return result;
  }
}

export const planConversationRepository = new LocalPlanConversationRepository();
