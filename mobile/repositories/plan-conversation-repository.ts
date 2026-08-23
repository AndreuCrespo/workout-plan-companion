import type { PlanConversation } from '@/domain/plan-conversation';

/**
 * Persiste el borrador de la entrevista para el próximo ciclo.
 * Un proveedor remoto podrá leer este contrato desde un backend seguro en el futuro.
 */
export interface PlanConversationRepository {
  getCurrent(): Promise<PlanConversation | null>;
  save(conversation: PlanConversation): Promise<void>;
  clear(): Promise<void>;
}
