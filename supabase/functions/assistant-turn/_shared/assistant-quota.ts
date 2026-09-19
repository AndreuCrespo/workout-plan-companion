import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export class AssistantQuotaExceededError extends Error {
  constructor() {
    super('Has alcanzado el límite diario del asistente IA. Vuelve a intentarlo mañana.');
  }
}

export class AssistantQuotaError extends Error {
  constructor() {
    super('No pudimos comprobar el límite de uso del asistente IA.');
  }
}

/** Atomically reserves one allowed turn before contacting the provider. */
export async function consumeAssistantTurnQuota(
  supabase: SupabaseClient,
  userId: string,
  dailyLimit: number,
): Promise<void> {
  const { data, error } = await supabase.rpc('consume_assistant_turn_quota', {
    p_daily_limit: dailyLimit,
    p_user_id: userId,
  });

  if (error) {
    throw new AssistantQuotaError();
  }

  if (data !== true) {
    throw new AssistantQuotaExceededError();
  }
}
