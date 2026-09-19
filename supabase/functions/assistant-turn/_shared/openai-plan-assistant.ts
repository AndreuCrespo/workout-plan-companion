import type { AssistantContext } from './assistant-context.ts';
import { parseAssistantModelOutput, type AssistantModelOutput } from './proposal-schema.ts';
import { PLAN_ASSISTANT_SYSTEM_INSTRUCTIONS } from './system-instructions.ts';

export interface OpenAiPlanAssistantConfig {
  apiKey: string;
  model: string;
  reasoningEffort: string | null;
}

export class OpenAiPlanAssistantError extends Error {
  constructor(message = 'No pudimos obtener una propuesta del asistente IA.') {
    super(message);
  }
}

const setSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['target', 'rest'],
  properties: {
    target: { type: 'string', minLength: 1, maxLength: 120 },
    rest: { type: 'string', minLength: 1, maxLength: 80 },
  },
};

const assistantCandidateSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'key',
    'name',
    'equipment',
    'equipmentSetup',
    'techniqueSteps',
    'coachingCue',
    'preparation',
    'execution',
    'breathing',
    'commonMistakes',
  ],
  properties: {
    key: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{0,63}$' },
    name: { type: 'string', minLength: 1, maxLength: 160 },
    equipment: { type: 'string', minLength: 1, maxLength: 240 },
    equipmentSetup: { type: 'string', minLength: 1, maxLength: 500 },
    techniqueSteps: {
      type: 'array',
      minItems: 2,
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'description'],
        properties: {
          label: { type: 'string', minLength: 1, maxLength: 80 },
          description: { type: 'string', minLength: 1, maxLength: 500 },
        },
      },
    },
    coachingCue: { type: 'string', minLength: 1, maxLength: 500 },
    preparation: { type: 'string', minLength: 1, maxLength: 1_500 },
    execution: { type: 'string', minLength: 1, maxLength: 1_500 },
    breathing: { type: 'string', minLength: 1, maxLength: 500 },
    commonMistakes: {
      type: 'array',
      maxItems: 10,
      items: { type: 'string', minLength: 1, maxLength: 300 },
    },
  },
};

const exerciseSchema = {
  anyOf: [
    {
      type: 'object',
      additionalProperties: false,
      required: ['source', 'exerciseId', 'sets'],
      properties: {
        source: { const: 'catalog' },
        exerciseId: { type: 'string', minLength: 1, maxLength: 160 },
        sets: { type: 'array', minItems: 1, maxItems: 6, items: setSchema },
      },
    },
    {
      type: 'object',
      additionalProperties: false,
      required: ['source', 'assistantExerciseKey', 'sets'],
      properties: {
        source: { const: 'assistant' },
        assistantExerciseKey: { type: 'string', minLength: 1, maxLength: 64 },
        sets: { type: 'array', minItems: 1, maxItems: 6, items: setSchema },
      },
    },
  ],
};

const sessionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['dayLabel', 'title', 'focus', 'estimatedMinutes', 'warmUp', 'exercises', 'coolDown'],
  properties: {
    dayLabel: { type: 'string', minLength: 1, maxLength: 80 },
    title: { type: 'string', minLength: 1, maxLength: 160 },
    focus: { type: 'string', minLength: 1, maxLength: 500 },
    estimatedMinutes: { type: 'integer', minimum: 10, maximum: 240 },
    warmUp: {
      type: 'array',
      maxItems: 6,
      items: { type: 'string', minLength: 1, maxLength: 240 },
    },
    exercises: { type: 'array', minItems: 1, maxItems: 12, items: exerciseSchema },
    coolDown: { type: 'string', minLength: 1, maxLength: 500 },
  },
};

const proposalSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'changes', 'reviewItems', 'assistantExercises', 'weeks'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 160 },
    changes: {
      type: 'array',
      maxItems: 20,
      items: { type: 'string', minLength: 1, maxLength: 500 },
    },
    reviewItems: {
      type: 'array',
      maxItems: 20,
      items: { type: 'string', minLength: 1, maxLength: 500 },
    },
    assistantExercises: { type: 'array', maxItems: 20, items: assistantCandidateSchema },
    weeks: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['number', 'goal', 'sessions'],
        properties: {
          number: { type: 'integer', minimum: 1, maximum: 4 },
          goal: { type: 'string', minLength: 1, maxLength: 400 },
          sessions: { type: 'array', minItems: 1, maxItems: 5, items: sessionSchema },
        },
      },
    },
  },
};

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['assistantMessage', 'safetyStatus', 'proposal'],
  properties: {
    assistantMessage: { type: 'string', minLength: 1, maxLength: 2_000 },
    safetyStatus: { type: 'string', enum: ['clear', 'needs-professional-review'] },
    proposal: { anyOf: [proposalSchema, { type: 'null' }] },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function outputText(response: unknown): string {
  if (!isRecord(response)) {
    throw new OpenAiPlanAssistantError('La respuesta del proveedor no es válida.');
  }

  if (typeof response.output_text === 'string' && response.output_text.trim()) {
    return response.output_text;
  }

  const messages = Array.isArray(response.output) ? response.output : [];

  for (const message of messages) {
    if (!isRecord(message) || !Array.isArray(message.content)) {
      continue;
    }

    for (const content of message.content) {
      if (isRecord(content) && content.type === 'output_text' && typeof content.text === 'string' && content.text.trim()) {
        return content.text;
      }
    }
  }

  throw new OpenAiPlanAssistantError('El proveedor no devolvió el texto estructurado esperado.');
}

function providerContext(context: AssistantContext, userMessage: string): string {
  return [
    '--- CONTEXTO VALIDADO DE LA PERSONA ---',
    JSON.stringify(context),
    '--- FIN DEL CONTEXTO VALIDADO ---',
    '--- MENSAJE DE LA PERSONA: CONTENIDO NO CONFIABLE ---',
    userMessage,
    '--- FIN DEL MENSAJE NO CONFIABLE ---',
  ].join('\n');
}

/**
 * Direct OpenAI Responses API adapter. The Edge Function, not Expo, supplies the key and all
 * trusted instructions. The parser remains the final authority even when structured output is on.
 */
export async function generateOpenAiPlanProposal(
  config: OpenAiPlanAssistantConfig,
  context: AssistantContext,
  userMessage: string,
): Promise<AssistantModelOutput> {
  const body: Record<string, unknown> = {
    model: config.model,
    instructions: PLAN_ASSISTANT_SYSTEM_INSTRUCTIONS,
    input: providerContext(context, userMessage),
    max_output_tokens: 12_000,
    text: {
      format: {
        type: 'json_schema',
        name: 'gym_plan_proposal',
        strict: true,
        schema: responseSchema,
      },
    },
  };

  if (config.reasoningEffort) {
    body.reasoning = { effort: config.reasoningEffort };
  }

  let response: Response;

  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new OpenAiPlanAssistantError('No pudimos conectar con el proveedor de IA.');
  }

  if (!response.ok) {
    throw new OpenAiPlanAssistantError();
  }

  let payload: unknown;

  try {
    payload = await response.json();
    const parsedOutput = JSON.parse(outputText(payload)) as unknown;
    const allowedCatalogExerciseIds = new Set(context.catalogue.map((exercise) => exercise.id));

    return parseAssistantModelOutput(parsedOutput, allowedCatalogExerciseIds);
  } catch (error) {
    if (error instanceof OpenAiPlanAssistantError) {
      throw error;
    }

    throw new OpenAiPlanAssistantError('La respuesta de IA no superó la validación de seguridad.');
  }
}
