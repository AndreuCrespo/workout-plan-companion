alter table public.profiles
  add column training_preferences text not null default ''
    check (char_length(training_preferences) <= 1000);
