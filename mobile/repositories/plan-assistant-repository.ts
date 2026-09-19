import type { AssistantTurnInput, AssistantTurnResult } from '@/domain/plan-assistant';

/**
 * Boundary for the remote plan assistant. Implementations authenticate with Supabase and invoke
 * the server-side assistant-turn function; neither user identifiers nor AI credentials enter it.
 */
export interface PlanAssistantRepository {
  sendMessage(input: AssistantTurnInput): Promise<AssistantTurnResult>;
}
