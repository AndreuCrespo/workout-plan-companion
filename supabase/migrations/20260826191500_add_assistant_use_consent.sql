create table public.assistant_consents (
  user_id uuid primary key references auth.users (id) on delete cascade,
  policy_version text not null check (char_length(policy_version) between 1 and 80),
  consented_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz
);

alter table public.assistant_consents enable row level security;

create policy assistant_consents_select_own on public.assistant_consents
for select to authenticated using (user_id = (select auth.uid()));

create function public.grant_assistant_consent(p_policy_version text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if p_policy_version is null or char_length(trim(p_policy_version)) not between 1 and 80 then
    raise exception 'Consent policy version is invalid';
  end if;

  insert into public.assistant_consents (user_id, policy_version, consented_at, revoked_at)
  values (auth.uid(), trim(p_policy_version), timezone('utc', now()), null)
  on conflict (user_id) do update
    set policy_version = excluded.policy_version,
        consented_at = excluded.consented_at,
        revoked_at = null;
end;
$$;

create function public.revoke_assistant_consent()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  update public.assistant_consents
  set revoked_at = timezone('utc', now())
  where user_id = auth.uid()
    and revoked_at is null;
end;
$$;

grant execute on function public.grant_assistant_consent(text) to authenticated;
grant execute on function public.revoke_assistant_consent() to authenticated;
grant select on public.assistant_consents to authenticated;
