import { parseRemotePlanProposal, type RemotePlanProposal } from '@/domain/remote-plan-proposal';
import { supabase } from '@/lib/supabase';

function client() {
  if (!supabase) throw new Error('El borrador remoto no está configurado en esta instalación.');
  return supabase;
}

export interface RemotePlanProposalRepository {
  getReviewable(proposalId: string): Promise<RemotePlanProposal>;
  publish(proposalId: string): Promise<void>;
}

class SupabaseRemotePlanProposalRepository implements RemotePlanProposalRepository {
  async getReviewable(proposalId: string): Promise<RemotePlanProposal> {
    const { data, error } = await client()
      .from('plan_proposals')
      .select('id, created_at, proposal_snapshot, status')
      .eq('id', proposalId)
      .eq('status', 'reviewable')
      .maybeSingle();

    if (error || !data) throw new Error('No encontramos un borrador disponible para revisar.');
    return parseRemotePlanProposal(data);
  }

  async publish(proposalId: string): Promise<void> {
    const { error } = await client().rpc('publish_ai_plan_proposal', { p_proposal_id: proposalId });
    if (error) throw new Error('No pudimos publicar este borrador. Puede que tu plan activo haya cambiado; genera y revisa uno nuevo.');
  }
}

export const remotePlanProposalRepository = new SupabaseRemotePlanProposalRepository();
