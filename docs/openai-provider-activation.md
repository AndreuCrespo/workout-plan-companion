# OpenAI provider activation

The source contains a direct OpenAI Responses API adapter for the remote plan assistant. It is deployed only in the isolated development Supabase project after the owner explicitly activated the Edge Function; production remains inactive.

## Server-only secrets

Set these only in Supabase Edge Function secrets after reviewing the deployment:

| Secret | Value |
| --- | --- |
| `OPENAI_API_KEY` | API key created in the OpenAI Platform project. Never place it in Expo, Git, or a public environment variable. |
| `OPENAI_MODEL` | Exact API model identifier enabled for that project. |
| `OPENAI_REASONING_EFFORT` | The reasoning setting supported by that exact model, for example `xhigh` if available. |

The code does not hard-code a model identifier. The development environment uses `gpt-5.6-terra`; verify any future model supports the Responses API and strict JSON-schema output before activation.

## Request boundary

The Edge Function sends the versioned trusted instructions plus the consented, minimized server context. It then parses the output again before persistence. It does not use LangChain, browser cookies, a ChatGPT subscription, or a client-side provider key.

## Required before deployment

- approved OpenAI billing budget;
- an explicit assistant-use consent flow;
- reviewed Supabase migrations applied in a non-production test account;
- Edge Runtime test of the provider response, persistence, and atomic publication RPC; and
- a configured error path for provider or schema-validation failures.
