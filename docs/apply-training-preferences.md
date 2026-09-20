# Apply free training-plan preferences

This migration adds the private `training_preferences` profile field. It stores up to 1,000 characters of a person's own plan-structure preferences, such as distributing lower body, push, pull, and cardio across the week.

It is not a medical field. Acute pain, an injury, pregnancy, or a clinical condition belong in the declared-limitations flow and require pausing and consulting a professional.

The remote assistant receives this field only after the person accepts the current assistant-use consent. It uses the text as a preference when compatible with the person's equipment, experience, availability, duration, and safety rules. The person still reviews every plan before publication.

## Apply

Run the full contents of:

[`supabase/migrations/20260826193000_add_training_preferences_to_profiles.sql`](../supabase/migrations/20260826193000_add_training_preferences_to_profiles.sql)

## Verify

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name = 'training_preferences';
```

The query returns one row. This migration has not yet been applied to the development project.
