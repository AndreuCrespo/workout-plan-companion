# Remote assistant preflight

`supabase/functions/assistant-turn` is source code only. It has **not** been deployed and does not call an AI provider.

Its current preflight behavior is deliberately limited:

1. accepts only authenticated `POST` requests;
2. validates the narrow client payload (`conversationId` and message);
3. returns a cautious non-prescriptive response when the message signals acute pain, injury, pregnancy, or a clinical condition; and
4. otherwise returns `assistant_not_configured` without reading personal data, writing a conversation, or calling an AI API.

The trusted system instructions are versioned in `supabase/functions/assistant-turn/_shared/system-instructions.ts`. They will be sent only by this server function. The Expo app must never contain a provider key or construct those instructions as a trusted prompt.

## Required approval before activation

Before adding a provider adapter or deploying the function, decide and approve:

- provider and model;
- monthly budget, per-user/day quota, and timeout/retry behavior;
- consent text and the exact profile, catalogue, plan, and progress summary sent to the provider;
- provider retention and data-processing terms; and
- server-side secret name and deployment environment.

After approval, the function derives the active remote plan from the authenticated account rather than accepting a plan ID from Expo. The next implementation adds catalogue retrieval, provider invocation, strict response validation, remote conversation/proposal persistence, and the separate publication RPC. It must not add a local template fallback.
