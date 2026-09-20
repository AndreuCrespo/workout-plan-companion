import type { AssistantTurnInput, AssistantTurnResult } from '@/domain/plan-assistant';
import { supabase } from '@/lib/supabase';
import type { PlanAssistantRepository } from '@/repositories/plan-assistant-repository';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function errorMessage(error: unknown): Promise<string> {
  if (!isRecord(error) || !isRecord(error.context) || typeof error.context.clone !== 'function') {
    return 'No pudimos contactar con el asistente IA. Inténtalo de nuevo cuando tengas conexión.';
  }

  try {
    const context = error.context as { clone: () => Response };
    const payload: unknown = await context.clone().json();

    if (isRecord(payload) && typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
  } catch {
    // Keep the provider or gateway response private when it is not the expected safe API shape.
  }

  return 'No pudimos contactar con el asistente IA. Inténtalo de nuevo cuando tengas conexión.';
}

function parseTurnResult(value: unknown): AssistantTurnResult {
  if (!isRecord(value)
    || (value.conversationId !== null && typeof value.conversationId !== 'string')
    || typeof value.message !== 'string'
    || value.message.trim().length === 0
    || (value.proposalId !== null && typeof value.proposalId !== 'string')
    || (value.safetyStatus !== 'clear' && value.safetyStatus !== 'needs-professional-review')) {
    throw new Error('La respuesta del asistente no es válida.');
  }

  return {
    conversationId: value.conversationId,
    message: value.message,
    proposalId: value.proposalId,
    safetyStatus: value.safetyStatus,
  };
}

class SupabasePlanAssistantRepository implements PlanAssistantRepository {
  async sendMessage(input: AssistantTurnInput): Promise<AssistantTurnResult> {
    if (!supabase) {
      throw new Error('El asistente IA no está configurado en esta instalación.');
    }

    const { data, error } = await supabase.functions.invoke('assistant-turn', { body: input });

    if (error) {
      throw new Error(await errorMessage(error));
    }

    return parseTurnResult(data);
  }
}

export const planAssistantRepository = new SupabasePlanAssistantRepository();
