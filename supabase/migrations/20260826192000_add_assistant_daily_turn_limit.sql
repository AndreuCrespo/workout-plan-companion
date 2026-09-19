create table public.assistant_usage_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null,
  turn_count integer not null default 0 check (turn_count >= 0),
  primary key (user_id, usage_date)
);

alter table public.assistant_usage_daily enable row level security;

-- This is callable only by the server-side service role. It consumes before a provider call so
-- simultaneous Edge Function invocations cannot exceed the configured daily allowance.
create function public.consume_assistant_turn_quota(
  p_user_id uuid,
  p_daily_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  next_count integer;
begin
  if p_user_id is null or p_daily_limit not between 1 and 100 then
    raise exception 'Assistant quota input is invalid';
  end if;

  insert into public.assistant_usage_daily (user_id, usage_date, turn_count)
  values (p_user_id, timezone('utc', now())::date, 1)
  on conflict (user_id, usage_date) do update
    set turn_count = public.assistant_usage_daily.turn_count + 1
    where public.assistant_usage_daily.turn_count < p_daily_limit
  returning turn_count into next_count;

  return next_count is not null;
end;
$$;

revoke all on function public.consume_assistant_turn_quota(uuid, integer) from public, anon, authenticated;
grant execute on function public.consume_assistant_turn_quota(uuid, integer) to service_role;
