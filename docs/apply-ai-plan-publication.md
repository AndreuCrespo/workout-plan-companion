# Apply AI plan-proposal publication

This migration adds `public.publish_ai_plan_proposal(uuid)`, the only client-callable route that turns a remote, reviewable AI proposal into the active monthly plan.

The RPC runs atomically:

1. verifies the authenticated owner, proposal status, and active-plan source;
2. inserts any structured assistant exercise candidates into that owner's private catalogue;
3. writes an immutable plan version, weeks, sessions, and exercise snapshots;
4. marks the proposal as published; and
5. moves only the active-plan pointer to the new version.

If any check or insert fails, no assistant exercise becomes active and no plan is published. Confirming a plan never changes an earlier published version or a completed workout.

## Prerequisites

Apply the following reviewed migrations first:

1. [`apply-supabase-foundation.md`](apply-supabase-foundation.md)
2. [`apply-reviewed-exercise-catalog.md`](apply-reviewed-exercise-catalog.md)
3. [`apply-private-ai-exercise-catalog.md`](apply-private-ai-exercise-catalog.md)

## Apply

Run the full contents of:

[`supabase/migrations/20260826190000_add_publish_ai_plan_proposal_rpc.sql`](../supabase/migrations/20260826190000_add_publish_ai_plan_proposal_rpc.sql)

## Verify

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'publish_ai_plan_proposal';
```

The RPC must return one row. Do not call it until the Edge Function persists and validates reviewable proposals, and test the full transaction with a non-production account first.
