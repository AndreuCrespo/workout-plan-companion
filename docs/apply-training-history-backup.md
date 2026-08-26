# Apply the consented training-history backup

This migration extends the private Supabase foundation with an atomic import of local published plans and completed workout logs.

## Prerequisite

Apply [`20260826135522_initial_private_data_foundation.sql`](../supabase/migrations/20260826135522_initial_private_data_foundation.sql) first.

## What it adds

- The six reviewed exercises used by the sample plan to the curated catalogue, without media.
- `training_history_backups`, a private per-account record of the last completed import and its item counts.
- `import_local_training_history(jsonb)`, an authenticated transactional RPC.

The RPC receives no `user_id`; it obtains ownership from the authenticated session. It inserts immutable plan snapshots and completed logs, validates every exercise against the approved catalogue, calculates canonical kilograms server-side, and is idempotent for the same local plan history. Draft workouts are excluded.

## Apply

In the authorized project's SQL Editor, run the full contents of:

[`supabase/migrations/20260826172000_add_consented_training_history_backup.sql`](../supabase/migrations/20260826172000_add_consented_training_history_backup.sql)

## Verify

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'import_local_training_history';
```

The query returns one row.

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename = 'training_history_backups';
```

The row has `rowsecurity = true`.

After the migration is applied, a signed-in person can open **Profile → Account** and explicitly save their published plans and completed logs. The confirmation states the item counts before any data leaves the device.
