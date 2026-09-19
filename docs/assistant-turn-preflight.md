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

After approval, the function derives the active remote plan from the authenticated account rather than accepting a plan ID from Expo. The prepared context loader is limited to the profile, active-plan session summary, active catalogue, and aggregated up/down feedback by exercise. It deliberately excludes notes, individual sets, and full workout logs. The source already includes strict parsing for an untrusted model response: exactly four weeks, valid existing catalogue IDs or structured private exercise candidates, no duplicate exercises in a session, no absolute loads, and no proposal after a professional-review safety status. Assistant candidates receive a private catalogue ID only after plan confirmation. The source also includes server-only persistence for validated conversation messages and reviewable proposals; it is not invoked until an approved provider call succeeds after explicit consent. The next implementation adds provider invocation and connects that persistence to the separate publication RPC. It must not add a local template fallback.
