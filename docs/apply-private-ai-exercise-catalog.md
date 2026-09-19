# Apply the private AI exercise-catalog migration

This migration changes the exercise catalogue from a shared curated-only list into two scopes:

- **Curated** entries are shared reviewed starting points.
- **Assistant** entries belong to one authenticated person and are created only when that person explicitly confirms a plan proposal containing them.

An assistant entry is not visible to other accounts. It is not created merely because the AI mentioned it in an unconfirmed draft. Published-plan snapshots remain immutable.

## Prerequisites

Apply the private data foundation and the reviewed catalogue migration first:

1. [`apply-supabase-foundation.md`](apply-supabase-foundation.md)
2. [`apply-reviewed-exercise-catalog.md`](apply-reviewed-exercise-catalog.md)

## Apply

Run the full contents of:

[`supabase/migrations/20260826184500_add_private_ai_exercise_catalog.sql`](../supabase/migrations/20260826184500_add_private_ai_exercise_catalog.sql)

## Verify privacy

As an authenticated account, active rows with `owner_user_id` set are visible only when that value is your own user ID. Curated rows keep `owner_user_id = null`.

```sql
select entry_source, count(*)
from public.exercise_catalog
where is_active = true
group by entry_source;
```

This migration is prepared in source only and has not been applied to Supabase.
