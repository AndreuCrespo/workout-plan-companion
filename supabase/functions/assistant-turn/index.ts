import { createClient } from 'npm:@supabase/supabase-js@2';

import { AssistantConsentRequiredError, assertAssistantConsent } from './_shared/assistant-consent.ts';
import { AssistantContextError, loadAssistantContext } from './_shared/assistant-context.ts';
import {
  parseAssistantTurnRequest,
  type AssistantSafetyStatus,
  type AssistantTurnResponse,
} from './_shared/contract.ts';
import { generateOpenAiPlanProposal, OpenAiPlanAssistantError } from './_shared/openai-plan-assistant.ts';
import { AssistantPersistenceError, persistAssistantTurn } from './_shared/proposal-persistence.ts';
import { PLAN_ASSISTANT_PROMPT_VERSION } from './_shared/system-instructions.ts';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type AssistantTurnErrorResponse = {
  code: string;
  message: string;
  promptVersion?: string;
};

function response(body: AssistantTurnResponse | AssistantTurnErrorResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function safetyStatus(message: string): AssistantSafetyStatus {
  const normalizedMessage = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return /dolor agudo|lesion|embaraz|condicion clinica/.test(normalizedMessage)
    ? 'needs-professional-review'
    : 'clear';
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return response({ code: 'method_not_allowed', message: 'Usa una petición POST.' }, 405);
  }

  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!authorization || !supabaseUrl || !supabaseAnonKey) {
    return response({ code: 'unauthenticated', message: 'Necesitas una sesión válida para usar el asistente.' }, 401);
  }

  const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user }, error: userError } = await userSupabase.auth.getUser();

  if (userError || !user) {
    return response({ code: 'unauthenticated', message: 'Necesitas una sesión válida para usar el asistente.' }, 401);
  }

  let input;

  try {
    input = parseAssistantTurnRequest(await request.json());
  } catch (error) {
    return response({
      code: 'invalid_request',
      message: error instanceof Error ? error.message : 'La petición del asistente no es válida.',
    }, 400);
  }

  const detectedSafetyStatus = safetyStatus(input.message);

  if (detectedSafetyStatus === 'needs-professional-review') {
    return response({
      conversationId: input.conversationId,
      message: 'Ante dolor agudo, lesión, embarazo o una condición clínica, pausa el entrenamiento y consulta a un profesional. No puedo preparar una propuesta con ese contexto.',
      proposalId: null,
      safetyStatus: detectedSafetyStatus,
    });
  }

  const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
  const openAiModel = Deno.env.get('OPENAI_MODEL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!openAiApiKey || !openAiModel || !supabaseServiceRoleKey) {
    return response({
      code: 'assistant_not_configured',
      message: 'El asistente IA todavía no está configurado para esta instalación.',
      promptVersion: PLAN_ASSISTANT_PROMPT_VERSION,
    }, 503);
  }

  try {
    await assertAssistantConsent(userSupabase, user.id);
    const context = await loadAssistantContext(userSupabase, user.id);
    const serverSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const output = await generateOpenAiPlanProposal({
      apiKey: openAiApiKey,
      model: openAiModel,
      reasoningEffort: Deno.env.get('OPENAI_REASONING_EFFORT')?.trim() || null,
    }, context, input.message);
    const persisted = await persistAssistantTurn(serverSupabase, {
      conversationId: input.conversationId,
      modelMetadata: {
        model: openAiModel,
        promptVersion: PLAN_ASSISTANT_PROMPT_VERSION,
        provider: 'openai',
      },
      output,
      sourcePlanVersionId: context.activePlan?.id ?? null,
      userId: user.id,
      userMessage: input.message,
    });

    return response({
      conversationId: persisted.conversationId,
      message: output.assistantMessage,
      proposalId: persisted.proposalId,
      safetyStatus: output.safetyStatus,
    });
  } catch (error) {
    if (error instanceof AssistantConsentRequiredError) {
      return response({ code: 'assistant_consent_required', message: error.message }, 403);
    }
    if (error instanceof AssistantContextError) {
      return response({ code: error.code, message: error.message }, 409);
    }
    if (error instanceof OpenAiPlanAssistantError) {
      return response({ code: 'assistant_provider_error', message: error.message }, 502);
    }
    if (error instanceof AssistantPersistenceError) {
      return response({ code: 'assistant_unavailable', message: error.message }, 503);
    }

    return response({ code: 'assistant_unavailable', message: 'No pudimos preparar una propuesta ahora mismo.' }, 503);
  }
});
