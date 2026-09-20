# Activate the remote plan assistant in a non-production Supabase project

The application source is prepared, but no migration, secret, Edge Function, APK, or external service has been activated by this repository. Perform this checklist only in a separate non-production Supabase project first.

## 1. Use an isolated project

Create or select a Supabase project that is not the production project. Configure the test Expo installation with only that project's URL and **publishable** key. Forks must use their own project and credentials.

## 2. Apply the pending migrations in order

Apply these files in timestamp order using the Supabase CLI or SQL Editor:

1. `20260826174500_add_training_emphasis_to_profiles.sql`
2. `20260826180000_add_profile_plan_context.sql`
3. `20260826184500_add_private_ai_exercise_catalog.sql`
4. `20260826190000_add_publish_ai_plan_proposal_rpc.sql`
5. `20260826191500_add_assistant_use_consent.sql`

Do not edit the existing base migrations. The initial foundation and training-history migrations must already exist in that project. Do not apply the removed reviewed-catalogue seed: the assistant now defines every new-plan exercise as a private structured candidate.

## 3. Configure Edge Function secrets

In the **test** Supabase project, set these server-only secrets. Do not place any of them in Expo, `app.json`, `.env.local`, Git, or an APK.

| Secret | Value |
| --- | --- |
| `OPENAI_API_KEY` | The project's OpenAI API key. |
| `OPENAI_MODEL` | Exact API model identifier confirmed in OpenAI Platform. |
| `OPENAI_REASONING_EFFORT` | A setting supported by that exact model, or omit it. |

`SUPABASE_SERVICE_ROLE_KEY` is supplied to hosted Edge Functions by Supabase. Never copy it into the mobile client or configure it as a public Expo variable.

## 4. Deploy and test deliberately

Deploy only `assistant-turn`, which requires JWT verification in `supabase/config.toml`. Then, with a test account:

1. confirm the consent notice and send an ordinary request;
2. inspect the reviewable four-week proposal without confirming it;
3. confirm it, verify the remote immutable plan version and locally visible plan; and
4. verify the local “Nuevo plan mensual activo” notification appears if system permission is granted.

Also test revoked consent, denied notification permission, an unavailable provider, and a message mentioning acute pain or injury. The latter must return the safety stop without loading context or calling OpenAI.

## Do not activate yet

Activation still requires the exact model API identifier and the owner's explicit approval to apply migrations, configure test-project secrets, and deploy. Never share an API key in chat.
