-- Workout Plan Companion: private data foundation.
-- This migration intentionally creates no credentials, no AI secret, and no public
-- write policy. Exercise catalogue rows and the remote assistant are added later.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public;

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '' check (char_length(first_name) <= 80),
  availability text not null default 'three-days'
    check (availability in ('two-days', 'three-days', 'four-days', 'five-days')),
  session_duration_minutes smallint not null default 60
    check (session_duration_minutes in (45, 60, 75)),
  limitations text not null default '' check (char_length(limitations) <= 4000),
  units text not null default 'metric' check (units in ('metric', 'imperial')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme_name text not null default 'grafito-naranja'
    check (theme_name in ('verde-activo', 'grafito-naranja')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Shared, reviewed text and metadata only. Media is deliberately out of scope.
create table public.exercise_catalog (
  id text primary key,
  name text not null check (char_length(name) between 1 and 160),
  equipment text not null default '',
  equipment_setup text not null default '',
  technique_steps jsonb not null default '[]'::jsonb check (jsonb_typeof(technique_steps) = 'array'),
  coaching_cue text not null default '',
  preparation text not null default '',
  execution text not null default '',
  breathing text not null default '',
  common_mistakes jsonb not null default '[]'::jsonb check (jsonb_typeof(common_mistakes) = 'array'),
  prescribed_sets jsonb not null default '[]'::jsonb check (jsonb_typeof(prescribed_sets) = 'array'),
  source_attribution text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.plan_versions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  version_number integer not null check (version_number > 0),
  name text not null check (char_length(name) between 1 and 160),
  request_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(request_snapshot) = 'object'),
  source_proposal_id uuid,
  published_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, version_number)
);

create table public.plan_weeks (
  id uuid primary key default extensions.gen_random_uuid(),
  plan_version_id uuid not null references public.plan_versions (id) on delete cascade,
  week_number smallint not null check (week_number between 1 and 4),
  goal text not null check (char_length(goal) between 1 and 400),
  unique (plan_version_id, week_number)
);

create table public.plan_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  plan_week_id uuid not null references public.plan_weeks (id) on delete cascade,
  session_position smallint not null check (session_position > 0),
  day_label text not null check (char_length(day_label) between 1 and 80),
  title text not null check (char_length(title) between 1 and 160),
  focus text not null default '' check (char_length(focus) <= 500),
  estimated_minutes smallint not null check (estimated_minutes between 10 and 240),
  warm_up text[] not null default '{}',
  cool_down text not null default '',
  unique (plan_week_id, session_position)
);

create table public.plan_session_exercises (
  id uuid primary key default extensions.gen_random_uuid(),
  plan_session_id uuid not null references public.plan_sessions (id) on delete cascade,
  exercise_position smallint not null check (exercise_position > 0),
  catalog_exercise_id text not null references public.exercise_catalog (id) on delete restrict,
  exercise_snapshot jsonb not null check (jsonb_typeof(exercise_snapshot) = 'object'),
  unique (plan_session_id, exercise_position)
);

create table public.active_plan_selection (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_version_id uuid not null unique references public.plan_versions (id) on delete restrict,
  selected_at timestamptz not null default timezone('utc', now())
);

create table public.assistant_conversations (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_plan_version_id uuid references public.plan_versions (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.assistant_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  conversation_id uuid not null references public.assistant_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (char_length(content) between 1 and 12000),
  safety_status text not null default 'clear'
    check (safety_status in ('clear', 'needs-professional-review')),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.plan_proposals (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid references public.assistant_conversations (id) on delete set null,
  source_plan_version_id uuid references public.plan_versions (id) on delete set null,
  request_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(request_snapshot) = 'object'),
  proposal_snapshot jsonb not null check (jsonb_typeof(proposal_snapshot) = 'object'),
  changes jsonb not null default '[]'::jsonb check (jsonb_typeof(changes) = 'array'),
  exercise_substitutions jsonb not null default '[]'::jsonb check (jsonb_typeof(exercise_substitutions) = 'array'),
  review_items jsonb not null default '[]'::jsonb check (jsonb_typeof(review_items) = 'array'),
  model_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(model_metadata) = 'object'),
  status text not null default 'reviewable'
    check (status in ('reviewable', 'published', 'superseded', 'dismissed', 'stale', 'rejected-safety')),
  published_plan_version_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz
);

alter table public.plan_versions
  add constraint plan_versions_source_proposal_id_fkey
  foreign key (source_proposal_id) references public.plan_proposals (id) on delete set null;

alter table public.plan_proposals
  add constraint plan_proposals_published_plan_version_id_fkey
  foreign key (published_plan_version_id) references public.plan_versions (id) on delete set null;

create table public.workout_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_version_id uuid not null references public.plan_versions (id) on delete cascade,
  plan_session_id uuid not null unique references public.plan_sessions (id) on delete cascade,
  session_title_snapshot text not null check (char_length(session_title_snapshot) between 1 and 160),
  status text not null default 'in-progress' check (status in ('in-progress', 'completed')),
  started_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  units text not null check (units in ('metric', 'imperial')),
  note text not null default '' check (char_length(note) <= 4000),
  check (
    (status = 'in-progress' and completed_at is null)
    or (status = 'completed' and completed_at is not null)
  )
);

create table public.workout_log_sets (
  id uuid primary key default extensions.gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs (id) on delete cascade,
  source_plan_session_exercise_id uuid not null references public.plan_session_exercises (id) on delete cascade,
  exercise_id text not null references public.exercise_catalog (id) on delete restrict,
  exercise_name text not null check (char_length(exercise_name) between 1 and 160),
  set_number smallint not null check (set_number > 0),
  target text not null default '',
  rest text not null default '',
  input_load numeric(8, 2) check (input_load is null or input_load >= 0),
  input_unit text not null check (input_unit in ('metric', 'imperial')),
  load_kg numeric(8, 2) check (load_kg is null or load_kg >= 0),
  repetitions smallint check (repetitions is null or repetitions between 0 and 1000),
  rpe numeric(3, 1) check (rpe is null or rpe between 0 and 10),
  is_completed boolean not null default false,
  unique (workout_log_id, source_plan_session_exercise_id, set_number)
);

create table public.workout_exercise_feedback (
  id uuid primary key default extensions.gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs (id) on delete cascade,
  source_plan_session_exercise_id uuid not null references public.plan_session_exercises (id) on delete cascade,
  exercise_id text not null references public.exercise_catalog (id) on delete restrict,
  reaction text check (reaction in ('up', 'down') or reaction is null),
  note text not null default '' check (char_length(note) <= 2000),
  unique (workout_log_id, source_plan_session_exercise_id)
);

create index plan_versions_user_published_at_idx on public.plan_versions (user_id, published_at desc);
create index plan_weeks_plan_version_idx on public.plan_weeks (plan_version_id, week_number);
create index plan_sessions_plan_week_idx on public.plan_sessions (plan_week_id, session_position);
create index plan_session_exercises_plan_session_idx on public.plan_session_exercises (plan_session_id, exercise_position);
create index assistant_conversations_user_updated_at_idx on public.assistant_conversations (user_id, updated_at desc);
create index assistant_messages_conversation_created_at_idx on public.assistant_messages (conversation_id, created_at);
create index plan_proposals_user_created_at_idx on public.plan_proposals (user_id, created_at desc);
create index workout_logs_user_completed_at_idx on public.workout_logs (user_id, completed_at desc) where status = 'completed';
create index workout_log_sets_exercise_idx on public.workout_log_sets (exercise_id);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create function private.prevent_plan_snapshot_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Published plan snapshots cannot be changed';
end;
$$;

create function private.guard_plan_proposal_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.user_id is distinct from new.user_id
    or old.conversation_id is distinct from new.conversation_id
    or old.source_plan_version_id is distinct from new.source_plan_version_id
    or old.request_snapshot is distinct from new.request_snapshot
    or old.proposal_snapshot is distinct from new.proposal_snapshot
    or old.changes is distinct from new.changes
    or old.exercise_substitutions is distinct from new.exercise_substitutions
    or old.review_items is distinct from new.review_items
    or old.model_metadata is distinct from new.model_metadata
    or old.created_at is distinct from new.created_at then
    raise exception 'Plan proposal snapshots cannot be changed';
  end if;

  if old.status <> 'reviewable'
    or new.status not in ('published', 'superseded', 'dismissed', 'stale', 'rejected-safety') then
    raise exception 'Invalid plan proposal status transition';
  end if;

  if new.status = 'published'
    and (new.published_plan_version_id is null or new.published_at is null) then
    raise exception 'Published proposals must reference a plan version and publication time';
  end if;

  return new;
end;
$$;

create function private.guard_workout_log_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status = 'completed' then
    raise exception 'Completed workout logs cannot be changed';
  end if;

  if old.user_id is distinct from new.user_id
    or old.plan_version_id is distinct from new.plan_version_id
    or old.plan_session_id is distinct from new.plan_session_id
    or old.session_title_snapshot is distinct from new.session_title_snapshot
    or old.started_at is distinct from new.started_at then
    raise exception 'Workout log ownership and origin cannot be changed';
  end if;

  return new;
end;
$$;

create function private.guard_workout_log_child_update()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  parent_status text;
begin
  if old.workout_log_id is distinct from new.workout_log_id
    or old.source_plan_session_exercise_id is distinct from new.source_plan_session_exercise_id
    or old.exercise_id is distinct from new.exercise_id then
    raise exception 'Workout log set and feedback origins cannot be changed';
  end if;

  select status into parent_status
  from public.workout_logs
  where id = new.workout_log_id;

  if parent_status = 'completed' then
    raise exception 'Sets and feedback in completed workout logs cannot be changed';
  end if;

  return new;
end;
$$;

create function private.assert_workout_log_child_origin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  log_session_id uuid;
  expected_exercise_id text;
begin
  select plan_session_id into log_session_id
  from public.workout_logs
  where id = new.workout_log_id;

  select catalog_exercise_id into expected_exercise_id
  from public.plan_session_exercises
  where id = new.source_plan_session_exercise_id
    and plan_session_id = log_session_id;

  if expected_exercise_id is null or expected_exercise_id <> new.exercise_id then
    raise exception 'Workout log children must match the planned session exercise';
  end if;

  return new;
end;
$$;

create function private.assert_active_plan_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan_owner uuid;
begin
  select user_id into plan_owner
  from public.plan_versions
  where id = new.plan_version_id;

  if plan_owner is null or plan_owner <> new.user_id then
    raise exception 'The active plan must belong to the same user';
  end if;

  return new;
end;
$$;

create function private.assert_workout_log_origin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan_owner uuid;
  session_plan_version_id uuid;
begin
  select user_id into plan_owner
  from public.plan_versions
  where id = new.plan_version_id;

  select week.plan_version_id into session_plan_version_id
  from public.plan_sessions session
  join public.plan_weeks week on week.id = session.plan_week_id
  where session.id = new.plan_session_id;

  if plan_owner is null
    or plan_owner <> new.user_id
    or session_plan_version_id is distinct from new.plan_version_id then
    raise exception 'Workout logs must use a session from the user plan version';
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function private.set_updated_at();

create trigger exercise_catalog_set_updated_at
before update on public.exercise_catalog
for each row execute function private.set_updated_at();

create trigger assistant_conversations_set_updated_at
before update on public.assistant_conversations
for each row execute function private.set_updated_at();

create trigger plan_proposals_set_updated_at
before update on public.plan_proposals
for each row execute function private.set_updated_at();

create trigger workout_logs_set_updated_at
before update on public.workout_logs
for each row execute function private.set_updated_at();

create trigger plan_versions_immutable
before update on public.plan_versions
for each row execute function private.prevent_plan_snapshot_mutation();

create trigger plan_weeks_immutable
before update on public.plan_weeks
for each row execute function private.prevent_plan_snapshot_mutation();

create trigger plan_sessions_immutable
before update on public.plan_sessions
for each row execute function private.prevent_plan_snapshot_mutation();

create trigger plan_session_exercises_immutable
before update on public.plan_session_exercises
for each row execute function private.prevent_plan_snapshot_mutation();

create trigger plan_proposals_guard_update
before update on public.plan_proposals
for each row execute function private.guard_plan_proposal_update();

create trigger workout_logs_guard_update
before update on public.workout_logs
for each row execute function private.guard_workout_log_update();

create trigger workout_log_sets_guard_update
before update on public.workout_log_sets
for each row execute function private.guard_workout_log_child_update();

create trigger workout_exercise_feedback_guard_update
before update on public.workout_exercise_feedback
for each row execute function private.guard_workout_log_child_update();

create trigger workout_log_sets_origin
before insert on public.workout_log_sets
for each row execute function private.assert_workout_log_child_origin();

create trigger workout_exercise_feedback_origin
before insert on public.workout_exercise_feedback
for each row execute function private.assert_workout_log_child_origin();

create trigger active_plan_selection_owner
before insert or update on public.active_plan_selection
for each row execute function private.assert_active_plan_owner();

create trigger workout_logs_origin
before insert on public.workout_logs
for each row execute function private.assert_workout_log_origin();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.exercise_catalog enable row level security;
alter table public.plan_versions enable row level security;
alter table public.plan_weeks enable row level security;
alter table public.plan_sessions enable row level security;
alter table public.plan_session_exercises enable row level security;
alter table public.active_plan_selection enable row level security;
alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;
alter table public.plan_proposals enable row level security;
alter table public.workout_logs enable row level security;
alter table public.workout_log_sets enable row level security;
alter table public.workout_exercise_feedback enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated using ((select auth.uid()) = user_id);
create policy profiles_insert_own on public.profiles
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profiles_update_own on public.profiles
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy user_preferences_select_own on public.user_preferences
for select to authenticated using ((select auth.uid()) = user_id);
create policy user_preferences_insert_own on public.user_preferences
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy user_preferences_update_own on public.user_preferences
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy exercise_catalog_select_active on public.exercise_catalog
for select to authenticated using (is_active);

create policy plan_versions_select_own on public.plan_versions
for select to authenticated using ((select auth.uid()) = user_id);
create policy plan_weeks_select_own on public.plan_weeks
for select to authenticated using (
  exists (
    select 1 from public.plan_versions version
    where version.id = plan_weeks.plan_version_id and version.user_id = (select auth.uid())
  )
);
create policy plan_sessions_select_own on public.plan_sessions
for select to authenticated using (
  exists (
    select 1 from public.plan_weeks week
    join public.plan_versions version on version.id = week.plan_version_id
    where week.id = plan_sessions.plan_week_id and version.user_id = (select auth.uid())
  )
);
create policy plan_session_exercises_select_own on public.plan_session_exercises
for select to authenticated using (
  exists (
    select 1 from public.plan_sessions session
    join public.plan_weeks week on week.id = session.plan_week_id
    join public.plan_versions version on version.id = week.plan_version_id
    where session.id = plan_session_exercises.plan_session_id and version.user_id = (select auth.uid())
  )
);
create policy active_plan_selection_select_own on public.active_plan_selection
for select to authenticated using ((select auth.uid()) = user_id);

create policy assistant_conversations_select_own on public.assistant_conversations
for select to authenticated using ((select auth.uid()) = user_id);
create policy assistant_messages_select_own on public.assistant_messages
for select to authenticated using ((select auth.uid()) = user_id);
create policy plan_proposals_select_own on public.plan_proposals
for select to authenticated using ((select auth.uid()) = user_id);

create policy workout_logs_select_own on public.workout_logs
for select to authenticated using ((select auth.uid()) = user_id);
create policy workout_logs_insert_draft_own on public.workout_logs
for insert to authenticated with check ((select auth.uid()) = user_id and status = 'in-progress');
create policy workout_logs_update_draft_own on public.workout_logs
for update to authenticated
using ((select auth.uid()) = user_id and status = 'in-progress')
with check ((select auth.uid()) = user_id and status = 'in-progress');

create policy workout_log_sets_select_own on public.workout_log_sets
for select to authenticated using (
  exists (
    select 1 from public.workout_logs log
    where log.id = workout_log_sets.workout_log_id and log.user_id = (select auth.uid())
  )
);
create policy workout_log_sets_insert_draft_own on public.workout_log_sets
for insert to authenticated with check (
  exists (
    select 1 from public.workout_logs log
    where log.id = workout_log_sets.workout_log_id
      and log.user_id = (select auth.uid())
      and log.status = 'in-progress'
  )
);
create policy workout_log_sets_update_draft_own on public.workout_log_sets
for update to authenticated
using (
  exists (
    select 1 from public.workout_logs log
    where log.id = workout_log_sets.workout_log_id
      and log.user_id = (select auth.uid())
      and log.status = 'in-progress'
  )
)
with check (
  exists (
    select 1 from public.workout_logs log
    where log.id = workout_log_sets.workout_log_id
      and log.user_id = (select auth.uid())
      and log.status = 'in-progress'
  )
);

create policy workout_feedback_select_own on public.workout_exercise_feedback
for select to authenticated using (
  exists (
    select 1 from public.workout_logs log
    where log.id = workout_exercise_feedback.workout_log_id and log.user_id = (select auth.uid())
  )
);
create policy workout_feedback_insert_draft_own on public.workout_exercise_feedback
for insert to authenticated with check (
  exists (
    select 1 from public.workout_logs log
    where log.id = workout_exercise_feedback.workout_log_id
      and log.user_id = (select auth.uid())
      and log.status = 'in-progress'
  )
);
create policy workout_feedback_update_draft_own on public.workout_exercise_feedback
for update to authenticated
using (
  exists (
    select 1 from public.workout_logs log
    where log.id = workout_exercise_feedback.workout_log_id
      and log.user_id = (select auth.uid())
      and log.status = 'in-progress'
  )
)
with check (
  exists (
    select 1 from public.workout_logs log
    where log.id = workout_exercise_feedback.workout_log_id
      and log.user_id = (select auth.uid())
      and log.status = 'in-progress'
  )
);

-- A completed log can only be finalized through this RPC. The client has no RLS
-- policy that permits changing a draft status to completed directly.
create function public.complete_workout_log(p_workout_log_id uuid)
returns public.workout_logs
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  completed_log public.workout_logs;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  update public.workout_logs
  set status = 'completed',
      completed_at = timezone('utc', now())
  where id = p_workout_log_id
    and user_id = auth.uid()
    and status = 'in-progress'
  returning * into completed_log;

  if completed_log.id is null then
    raise exception 'Workout draft was not found or is already completed';
  end if;

  return completed_log;
end;
$$;

grant execute on function public.complete_workout_log(uuid) to authenticated;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.user_preferences to authenticated;
grant select on public.exercise_catalog to authenticated;
grant select on public.plan_versions, public.plan_weeks, public.plan_sessions,
  public.plan_session_exercises, public.active_plan_selection to authenticated;
grant select on public.assistant_conversations, public.assistant_messages, public.plan_proposals to authenticated;
grant select, insert, update on public.workout_logs, public.workout_log_sets,
  public.workout_exercise_feedback to authenticated;
