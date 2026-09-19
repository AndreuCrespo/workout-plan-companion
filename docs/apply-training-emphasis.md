# Apply the training-emphasis preference

This migration adds a private profile preference for the local plan generator:

- **Compound strength** prioritizes at least two multi-joint strength exercises in each generated session when compatible with declared limitations, equipment, and the reviewed template.
- **Balanced** does not add that structural priority.

It does not make hormonal claims or guarantee physiological outcomes.

## Prerequisite

Apply the private data foundation first. The training-history backup migration is optional and unrelated to this preference.

## Apply

Run the full contents of:

[`supabase/migrations/20260826174500_add_training_emphasis_to_profiles.sql`](../supabase/migrations/20260826174500_add_training_emphasis_to_profiles.sql)

Existing profiles receive `compound-strength` as their default preference.

## Verify

```sql
select column_name, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name = 'training_emphasis';
```

The query returns one row with the default `compound-strength`.
