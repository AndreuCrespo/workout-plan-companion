export type AssistantSafetyStatus = 'clear' | 'needs-professional-review';

export interface AssistantTurnInput {
  conversationId: string | null;
  sourcePlanVersionId: string | null;
  message: string;
}

export interface AssistantTurnResult {
  conversationId: string;
  message: string;
  proposalId: string | null;
  safetyStatus: AssistantSafetyStatus;
}
