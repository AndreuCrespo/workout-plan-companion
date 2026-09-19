import { ASSISTANT_CONSENT_VERSION } from '@/domain/assistant-consent';
import { supabase } from '@/lib/supabase';

export interface AssistantConsentStatus {
  isActive: boolean;
  policyVersion: string | null;
}

function getClient() {
  if (!supabase) {
    throw new Error('El asistente IA no está configurado en esta instalación.');
  }

  return supabase;
}

class SupabaseAssistantConsentRepository {
  async getStatus(userId: string): Promise<AssistantConsentStatus> {
    const { data, error } = await getClient()
      .from('assistant_consents')
      .select('policy_version, revoked_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error('No pudimos comprobar tu consentimiento para el asistente IA.');
    }

    return {
      isActive: Boolean(data && data.revoked_at === null && data.policy_version === ASSISTANT_CONSENT_VERSION),
      policyVersion: data?.policy_version ?? null,
    };
  }

  async grant(): Promise<void> {
    const { error } = await getClient().rpc('grant_assistant_consent', {
      p_policy_version: ASSISTANT_CONSENT_VERSION,
    });

    if (error) {
      throw new Error('No pudimos guardar tu consentimiento para el asistente IA.');
    }
  }

  async revoke(): Promise<void> {
    const { error } = await getClient().rpc('revoke_assistant_consent');

    if (error) {
      throw new Error('No pudimos retirar tu consentimiento para el asistente IA.');
    }
  }
}

export const assistantConsentRepository = new SupabaseAssistantConsentRepository();
