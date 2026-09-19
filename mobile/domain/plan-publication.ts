import type { PlanRequestSnapshot } from '@/domain/plan-proposal';
import type { MonthlyPlan } from '@/domain/models';

/**
 * Immutable record of a plan confirmed by the person. The active plan is the
 * most recent publication; older records remain available as local history.
 */
export interface PlanPublication {
  id: string;
  plan: MonthlyPlan;
  publishedAt: string;
  sourceProposalId: string | null;
  request: PlanRequestSnapshot | null;
}
