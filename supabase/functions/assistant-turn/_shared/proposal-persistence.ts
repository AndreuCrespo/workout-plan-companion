import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import type { AssistantModelOutput } from './proposal-schema.ts';

export interface AssistantModelMetadata {
  model: string;
  promptVersion: string;
  provider: string;
}

export interface PersistAssistantTurnInput {
  conversationId: string | null;
  modelMetadata: AssistantModelMetadata;
  output: AssistantModelOutput;
  sourcePlanVersionId: string | null;
  userId: string;
  userMessage: string;
}

export interface PersistAssistantTurnResult {
  conversationId: string;
  proposalId: string | null;
}

export class AssistantPersistenceError extends Error {
  constructor() {
    super('No pudimos guardar la conversación del asistente.');
  }
}

async function resolveConversationId(
  supabase: SupabaseClient,
  input: Pick<PersistAssistantTurnInput, 'conversationId' | 'sourcePlanVersionId' | 'userId'>,
): Promise<string> {
  if (!input.conversationId) {
    const { data, error } = await supabase
      .from('assistant_conversations')
      .insert({
        source_plan_version_id: input.sourcePlanVersionId,
        user_id: input.userId,
      })
      .select('id')
      .single();

    if (error || !data?.id) {
      throw new AssistantPersistenceError();
    }

    return data.id;
  }

  const { data, error } = await supabase
    .from('assistant_conversations')
    .select('id, source_plan_version_id, status')
    .eq('id', input.conversationId)
    .eq('user_id', input.userId)
    .maybeSingle();

  if (error || !data || data.status !== 'active' || data.source_plan_version_id !== input.sourcePlanVersionId) {
    throw new AssistantPersistenceError();
  }

  return data.id;
}

/**
 * Uses a server-only Supabase client after the Edge Function has independently authenticated the
 * caller. No client policy permits these writes. This helper is invoked only after the person has
 * consented to an assistant turn and the provider output has passed structural validation.
 */
export async function persistAssistantTurn(
  supabase: SupabaseClient,
  input: PersistAssistantTurnInput,
): Promise<PersistAssistantTurnResult> {
  const conversationId = await resolveConversationId(supabase, input);
  const safetyStatus = input.output.safetyStatus;
  const { error: messageError } = await supabase
    .from('assistant_messages')
    .insert([
      {
        content: input.userMessage,
        conversation_id: conversationId,
        safety_status: safetyStatus,
        role: 'user',
        user_id: input.userId,
      },
      {
        content: input.output.assistantMessage,
        conversation_id: conversationId,
        safety_status: safetyStatus,
        role: 'assistant',
        user_id: input.userId,
      },
    ]);

  if (messageError) {
    throw new AssistantPersistenceError();
  }

  if (!input.output.proposal) {
    return { conversationId, proposalId: null };
  }

  const supersedeQuery = supabase
    .from('plan_proposals')
    .update({ status: 'superseded' })
    .eq('user_id', input.userId)
    .eq('status', 'reviewable');
  const { error: supersedeError } = input.sourcePlanVersionId
    ? await supersedeQuery.eq('source_plan_version_id', input.sourcePlanVersionId)
    : await supersedeQuery.is('source_plan_version_id', null);

  if (supersedeError) {
    throw new AssistantPersistenceError();
  }

  const { data: proposal, error: proposalError } = await supabase
    .from('plan_proposals')
    .insert({
      changes: input.output.proposal.changes,
      conversation_id: conversationId,
      exercise_substitutions: [],
      model_metadata: {
        ...input.modelMetadata,
        validated_at: new Date().toISOString(),
      },
      proposal_snapshot: input.output.proposal,
      request_snapshot: {
        message: input.userMessage,
      },
      review_items: input.output.proposal.reviewItems,
      source_plan_version_id: input.sourcePlanVersionId,
      status: 'reviewable',
      user_id: input.userId,
    })
    .select('id')
    .single();

  if (proposalError || !proposal?.id) {
    throw new AssistantPersistenceError();
  }

  return { conversationId, proposalId: proposal.id };
}
