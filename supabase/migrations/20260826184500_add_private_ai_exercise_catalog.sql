-- Curated entries remain shared. Assistant-created entries belong only to the person who
-- confirms a proposal that contains them; no client may insert or activate these rows directly.
alter table public.exercise_catalog
  add column owner_user_id uuid references auth.users (id) on delete cascade,
  add column entry_source text not null default 'curated'
    check (entry_source in ('curated', 'assistant'));

alter table public.exercise_catalog
  add constraint exercise_catalog_owner_source_check
  check (
    (entry_source = 'curated' and owner_user_id is null)
    or (entry_source = 'assistant' and owner_user_id is not null)
  );

create index exercise_catalog_owner_active_idx
  on public.exercise_catalog (owner_user_id, name)
  where owner_user_id is not null and is_active;

drop policy exercise_catalog_select_active on public.exercise_catalog;

create policy exercise_catalog_select_active_or_owned on public.exercise_catalog
for select to authenticated using (
  is_active
  and (owner_user_id is null or owner_user_id = (select auth.uid()))
);
