import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const ASSISTANT_CONSENT_VERSION = '2026-09-19.1';

export class AssistantConsentRequiredError extends Error {
  constructor() {
    super('Acepta el uso del asistente IA antes de enviar contexto a un proveedor.');
  }
}

/** Checks the current consent version under the authenticated caller's RLS scope. */
export async function assertAssistantConsent(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('assistant_consents')
    .select('policy_version, revoked_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data || data.revoked_at !== null || data.policy_version !== ASSISTANT_CONSENT_VERSION) {
    throw new AssistantConsentRequiredError();
  }
}
