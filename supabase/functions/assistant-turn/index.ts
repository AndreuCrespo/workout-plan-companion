import { createClient } from 'npm:@supabase/supabase-js@2';

import {
  parseAssistantTurnRequest,
  type AssistantSafetyStatus,
  type AssistantTurnResponse,
} from './_shared/contract.ts';
import { PLAN_ASSISTANT_PROMPT_VERSION } from './_shared/system-instructions.ts';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function response(body: AssistantTurnResponse | { code: string; message: string; promptVersion?: string }, status = 200): Response {
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

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

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

  // A provider adapter is deliberately not selected until the owner approves a provider, model,
  // budget, retention policy, and server-side secret. This preflight must never call an AI API.
  return response({
    code: 'assistant_not_configured',
    message: 'El asistente IA todavía no está configurado para esta instalación.',
    promptVersion: PLAN_ASSISTANT_PROMPT_VERSION,
  }, 503);
});
