import type { PlanProposal } from '@/domain/plan-proposal';
import type { PlanPublication } from '@/domain/plan-publication';

/**
 * Versioned plan boundary. A remote implementation can preserve the same
 * explicit publication flow without exposing persistence details to screens.
 */
export interface PlanRepository {
  getActive(): Promise<PlanPublication>;
  getHistory(): Promise<PlanPublication[]>;
  publish(proposal: PlanProposal): Promise<PlanPublication>;
  replaceHistory(publications: PlanPublication[]): Promise<void>;
}
