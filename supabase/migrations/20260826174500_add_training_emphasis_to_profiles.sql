alter table public.profiles
  add column training_emphasis text not null default 'compound-strength';

alter table public.profiles
  add constraint profiles_training_emphasis_check
  check (training_emphasis in ('compound-strength', 'balanced'));
