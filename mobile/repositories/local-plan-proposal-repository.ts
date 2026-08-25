import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PlanProposal } from '@/domain/plan-proposal';
import type { PlanProposalRepository } from '@/repositories/plan-proposal-repository';

const STORAGE_KEY = '@gimnasio/plan-proposal';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isPlan(value: unknown): value is PlanProposal['plan'] {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.version === 'string' &&
    Array.isArray(value.weeks) &&
    value.weeks.length > 0 &&
    value.weeks.every((week) => isRecord(week) && typeof week.number === 'number' && typeof week.goal === 'string' && Array.isArray(week.sessions))
  );
}

function isRequest(value: unknown): value is PlanProposal['request'] {
  return (
    isRecord(value) &&
    typeof value.sourcePlanId === 'string' &&
    typeof value.sourcePlanVersion === 'string' &&
    (value.goal === null || value.goal === 'strength' || value.goal === 'muscle' || value.goal === 'general-fitness' || value.goal === 'returning' || value.goal === 'other') &&
    typeof value.goalDetails === 'string' &&
    (value.availability === 'two-days' || value.availability === 'three-days' || value.availability === 'four-days' || value.availability === 'five-days') &&
    (value.sessionDurationMinutes === 45 || value.sessionDurationMinutes === 60 || value.sessionDurationMinutes === 75) &&
    typeof value.sessionDurationDetails === 'string' &&
    (value.environment === null || value.environment === 'gym' || value.environment === 'home' || value.environment === 'mixed' || value.environment === 'other') &&
    typeof value.environmentDetails === 'string' &&
    typeof value.priorities === 'string' &&
    typeof value.exercisePreferences === 'string' &&
    typeof value.additionalContext === 'string' &&
    typeof value.declaredLimitations === 'string'
  );
}

function parseProposal(value: unknown): PlanProposal | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.conversationId !== 'string' ||
    typeof value.sourcePlanId !== 'string' ||
    typeof value.sourcePlanVersion !== 'string' ||
    typeof value.createdAt !== 'string' ||
    !isRequest(value.request) ||
    !isPlan(value.plan) ||
    !isStringArray(value.changes) ||
    !isStringArray(value.reviewItems)
  ) {
    return null;
  }

  return {
    id: value.id,
    conversationId: value.conversationId,
    sourcePlanId: value.sourcePlanId,
    sourcePlanVersion: value.sourcePlanVersion,
    request: value.request,
    plan: value.plan,
    changes: value.changes,
    reviewItems: value.reviewItems,
    createdAt: value.createdAt,
  };
}

class LocalPlanProposalRepository implements PlanProposalRepository {
  private writeQueue: Promise<void> = Promise.resolve();

  async getCurrent(): Promise<PlanProposal | null> {
    try {
      const storedProposal = await AsyncStorage.getItem(STORAGE_KEY);
      return storedProposal ? parseProposal(JSON.parse(storedProposal)) : null;
    } catch {
      return null;
    }
  }

  async save(proposal: PlanProposal): Promise<void> {
    const result = this.writeQueue.then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(proposal)));
    this.writeQueue = result.then(
      () => undefined,
      () => undefined,
    );
    await result;
  }
}

export const planProposalRepository = new LocalPlanProposalRepository();
