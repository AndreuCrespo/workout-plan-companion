# Apply assistant daily-turn limit

This migration adds a server-only, atomic daily allowance for AI assistant turns. It is separate from the OpenAI billing limit: both protections are required.

The Edge Function consumes one turn before it contacts the provider, preventing simultaneous requests from exceeding the configured allowance. Provider failures can still consume a reserved turn; this intentionally favors cost control over automatic retries.

## Apply

Run the full contents of:

[`supabase/migrations/20260826192000_add_assistant_daily_turn_limit.sql`](../supabase/migrations/20260826192000_add_assistant_daily_turn_limit.sql)

The `service_role` alone can call the quota RPC. Expo and ordinary authenticated users cannot read or change usage rows.

## Configuration

Set the server-only `ASSISTANT_DAILY_TURN_LIMIT` secret to an integer from 1 to 100. For personal testing, start at `5`.

This migration has not been applied to Supabase.
