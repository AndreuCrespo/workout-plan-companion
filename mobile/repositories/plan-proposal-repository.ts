import type { PlanProposal } from '@/domain/plan-proposal';

/**
 * Stores a reviewable proposal separately from the active published plan. A remote assistant
 * implementation can use this boundary without being coupled to the local UI.
 */
export interface PlanProposalRepository {
  getCurrent(): Promise<PlanProposal | null>;
  save(proposal: PlanProposal): Promise<void>;
}
