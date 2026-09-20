# Remote assistant preflight

`supabase/functions/assistant-turn` is deployed only to the isolated development Supabase project. It requires a valid JWT and server-only secrets before it can call an AI provider. It is not deployed to production.

When its required secrets are absent, its preflight behavior is deliberately limited:

1. accepts only authenticated `POST` requests;
2. validates the narrow client payload (`conversationId` and message);
3. returns a cautious non-prescriptive response when the message signals acute pain, injury, pregnancy, or a clinical condition; and
4. otherwise returns `assistant_not_configured` without reading personal data, writing a conversation, or calling an AI API.

The trusted system instructions are versioned in `supabase/functions/assistant-turn/_shared/system-instructions.ts`. They will be sent only by this server function. The Expo app must never contain a provider key or construct those instructions as a trusted prompt.

## Required approval before activation

Before configuring another environment or deploying to production, decide and approve:

- provider and model;
- monthly budget and timeout/retry behavior;
- consent text and the exact profile, plan, and progress summary sent to the provider;
- provider retention and data-processing terms; and
- server-side secret name and deployment environment.

After activation, the function derives the active remote plan from the authenticated account rather than accepting a plan ID from Expo. It first requires the current explicit consent, then loads only profile, active-plan session summary, and aggregated up/down feedback by exercise. It deliberately excludes notes, individual sets, full workout logs, and any shared exercise catalogue. It parses the untrusted model response, persists only a validated conversation/proposal, and returns a reviewable draft. The separate publication RPC activates private assistant exercises and a new immutable plan version only after the person confirms. At that explicit confirmation, the app stores its own local snapshot and requests an optional local notification; it does not replace the prior plan history. It must not add a local template fallback. See the non-production activation checklist in [`activate-ai-assistant-staging.md`](activate-ai-assistant-staging.md).
