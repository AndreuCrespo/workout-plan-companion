# Apply the reviewed exercise catalogue

This migration inserts the current text-only exercise catalogue used to constrain a future remote plan assistant. It contains 17 reviewed entries with equipment, technique, common mistakes, and prescribed sets. It contains no image, video, GIF, or other third-party media.

## Prerequisite

Apply the private data foundation first, because it creates `public.exercise_catalog` and its access controls.

## Apply

Run the full contents of:

[`supabase/migrations/20260826183000_seed_reviewed_exercise_catalog.sql`](../supabase/migrations/20260826183000_seed_reviewed_exercise_catalog.sql)

The migration uses `on conflict (id) do nothing`: it fills missing curated IDs but does not overwrite an existing editorial entry.

## Verify

```sql
select count(*) as active_exercise_count
from public.exercise_catalog
where is_active = true;
```

The current migration produces 17 active exercises in an empty catalogue. Apply it only after review and explicit approval; it changes the remote project.
