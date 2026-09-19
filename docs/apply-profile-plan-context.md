# Apply the profile plan-context migration

This migration extends the private profile with the context used by future local plan proposals:

- primary training goal;
- self-declared training experience; and
- primary equipment access.

It does not change a published plan or a completed workout. Existing profiles receive safe defaults matching the previous local template: strength, some experience, and full-gym access.

## Prerequisites

Apply the private data foundation and the training-emphasis migration first:

1. [`apply-supabase-foundation.md`](apply-supabase-foundation.md)
2. [`apply-training-emphasis.md`](apply-training-emphasis.md)

## Apply

Run the full contents of:

[`supabase/migrations/20260826180000_add_profile_plan_context.sql`](../supabase/migrations/20260826180000_add_profile_plan_context.sql)

## Verify

```sql
select column_name, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in ('primary_goal', 'training_experience', 'equipment_access')
order by column_name;
```

The query returns three rows. No profile data leaves the device until the person explicitly confirms a private backup.
