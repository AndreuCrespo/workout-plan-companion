# Apply private AI exercise storage

This migration prepares the existing `exercise_catalog` table to store only the private, structured exercise entries created when a person explicitly confirms an AI plan proposal. It does not seed or expose a shared exercise catalogue.

An assistant entry is not visible to other accounts. It is not created merely because the AI mentioned it in an unconfirmed draft. Published-plan snapshots remain immutable.

## Prerequisites

Apply the private data foundation first:

1. [`apply-supabase-foundation.md`](apply-supabase-foundation.md)

## Apply

Run the full contents of:

[`supabase/migrations/20260826184500_add_private_ai_exercise_catalog.sql`](../supabase/migrations/20260826184500_add_private_ai_exercise_catalog.sql)

## Verify privacy

As an authenticated account, active rows with `owner_user_id` set are visible only when that value is your own user ID. No shared exercise seed is applied for the AI assistant.

```sql
select entry_source, count(*)
from public.exercise_catalog
where is_active = true
group by entry_source;
```

This migration is prepared in source only and has not been applied to Supabase.
