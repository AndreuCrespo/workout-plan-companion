# Apply assistant-use consent

This migration records a person's explicit, versioned consent before the Edge Function may send their minimized context to an AI provider.

The consent covers only the assistant turn described in the current in-app notice:

- the person's message;
- their declared profile context;
- summary of active plan and allowed catalogue; and
- aggregated positive/negative exercise reactions.

It excludes notes, individual sets, and complete workout logs. A person can revoke consent; later assistant turns are then rejected until they consent again to the current policy version.

## Apply

Run the full contents of:

[`supabase/migrations/20260826191500_add_assistant_use_consent.sql`](../supabase/migrations/20260826191500_add_assistant_use_consent.sql)

## Verify

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('grant_assistant_consent', 'revoke_assistant_consent')
order by routine_name;
```

The query returns two rows. This migration has not been applied to Supabase.
