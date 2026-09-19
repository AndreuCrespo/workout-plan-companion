import type { MonthlyPlan } from '@/domain/models';

export interface ExerciseSubstitution {
  fromExerciseId: string;
  fromExerciseName: string;
  toExerciseId: string;
  toExerciseName: string;
}

/**
 * Immutable context snapshot returned by the remote assistant alongside a proposal. The server
 * validates its concrete shape; the mobile client keeps it opaque to avoid reimplementing a local
 * plan generator or trusting client-side interpretation.
 */
export type PlanRequestSnapshot = Record<string, unknown>;

export interface PlanProposal {
  id: string;
  conversationId: string;
  sourcePlanId: string;
  sourcePlanVersion: string;
  request: PlanRequestSnapshot;
  plan: MonthlyPlan;
  changes: string[];
  exerciseSubstitutions: ExerciseSubstitution[];
  reviewItems: string[];
  createdAt: string;
}
