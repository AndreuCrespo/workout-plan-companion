export type AssistantSafetyStatus = 'clear' | 'needs-professional-review';

export interface AssistantTurnRequest {
  conversationId: string | null;
  sourcePlanVersionId: string | null;
  message: string;
}

export interface AssistantTurnResponse {
  conversationId: string | null;
  message: string;
  proposalId: string | null;
  safetyStatus: AssistantSafetyStatus;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maximumMessageLength = 4_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalUuid(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string' || !uuidPattern.test(value)) {
    throw new Error('El identificador de conversación o plan no es válido.');
  }

  return value;
}

export function parseAssistantTurnRequest(value: unknown): AssistantTurnRequest {
  if (!isRecord(value) || typeof value.message !== 'string') {
    throw new Error('La petición del asistente no es válida.');
  }

  const message = value.message.trim();

  if (message.length === 0 || message.length > maximumMessageLength) {
    throw new Error(`El mensaje debe tener entre 1 y ${maximumMessageLength} caracteres.`);
  }

  return {
    conversationId: optionalUuid(value.conversationId),
    sourcePlanVersionId: optionalUuid(value.sourcePlanVersionId),
    message,
  };
}
