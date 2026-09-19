alter table public.profiles
  add column primary_goal text not null default 'strength'
    check (primary_goal in ('strength', 'muscle', 'general-fitness', 'returning')),
  add column training_experience text not null default 'some-experience'
    check (training_experience in ('starting', 'some-experience', 'experienced')),
  add column equipment_access text not null default 'full-gym'
    check (equipment_access in ('full-gym', 'dumbbells-and-bench', 'bands-and-basic', 'bodyweight'));
