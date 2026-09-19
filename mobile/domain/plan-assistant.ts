export type AssistantSafetyStatus = 'clear' | 'needs-professional-review';

export interface AssistantTurnInput {
  conversationId: string | null;
  message: string;
}

export interface AssistantTurnResult {
  conversationId: string | null;
  message: string;
  proposalId: string | null;
  safetyStatus: AssistantSafetyStatus;
}
