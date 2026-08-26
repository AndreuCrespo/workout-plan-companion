-- Consented import of immutable local plan publications and completed workout logs.
-- The client can invoke only the RPC below; it cannot write plan snapshots directly.

insert into public.exercise_catalog (
  id,
  name,
  equipment,
  equipment_setup,
  technique_steps,
  coaching_cue,
  preparation,
  execution,
  breathing,
  common_mistakes,
  prescribed_sets,
  source_attribution
)
values
  (
    'sentadilla-goblet',
    'Sentadilla goblet',
    'Mancuerna',
    'Una mancuerna que puedas sostener junto al pecho y espacio libre para moverte.',
    '[{"label":"Colócate","description":"Sujeta la mancuerna junto al pecho y apoya todo el pie."},{"label":"Desciende","description":"Lleva la cadera hacia abajo con el pecho alto."},{"label":"Vuelve","description":"Empuja el suelo y termina de pie con control."}]'::jsonb,
    'Mantén el tronco alto y reparte el peso en todo el pie.',
    'Sujeta una mancuerna junto al pecho y coloca los pies al ancho que te resulte estable.',
    'Desciende con control hasta una profundidad cómoda y empuja el suelo para volver arriba.',
    'Inspira antes de bajar y suelta el aire al subir sin perder la tensión del tronco.',
    '["Elevar los talones","Perder la posición neutra de la espalda","Rebotar al final del recorrido"]'::jsonb,
    '[{"target":"3 × 8 repeticiones · RPE 7","rest":"90 s"},{"target":"1 × 10 repeticiones · RPE 6","rest":"90 s"}]'::jsonb,
    'Workout Plan Companion sample plan'
  ),
  (
    'peso-muerto-rumano',
    'Peso muerto rumano con mancuernas',
    'Mancuernas',
    'Dos mancuernas y una zona libre para llevar la cadera hacia atrás.',
    '[{"label":"Colócate","description":"Mancuernas cerca de los muslos, rodillas suaves."},{"label":"Lleva atrás","description":"Desplaza la cadera atrás sin alejar la carga."},{"label":"Extiende","description":"Vuelve de pie apretando glúteos sin acelerar."}]'::jsonb,
    'Lleva la cadera atrás; las mancuernas permanecen cerca de las piernas.',
    'Pies a la anchura de caderas, rodillas suaves y mancuernas frente a los muslos.',
    'Desplaza la cadera hacia atrás hasta notar tensión en la parte posterior de las piernas y vuelve apretando glúteos.',
    'Toma aire antes de bajar y expúlsalo de forma controlada al regresar.',
    '["Doblar demasiado las rodillas","Alejar la carga del cuerpo","Buscar más recorrido perdiendo control"]'::jsonb,
    '[{"target":"3 × 10 repeticiones · RPE 7","rest":"90 s"}]'::jsonb,
    'Workout Plan Companion sample plan'
  ),
  (
    'press-pecho-mancuernas',
    'Press de pecho con mancuernas',
    'Banco y mancuernas',
    'Banco estable y dos mancuernas que puedas controlar durante toda la serie.',
    '[{"label":"Apóyate","description":"Pies firmes y espalda alta apoyada en el banco."},{"label":"Baja","description":"Desciende las mancuernas a los lados del pecho."},{"label":"Empuja","description":"Extiende los brazos de forma controlada."}]'::jsonb,
    'Apoya bien los pies y controla la bajada antes de empujar.',
    'Túmbate con los pies firmes, escápulas apoyadas y mancuernas sobre el pecho.',
    'Baja las mancuernas a los lados del pecho con control y empuja hasta extender los brazos sin bloquearlos con fuerza.',
    'Inspira al bajar y expulsa el aire durante el empuje.',
    '["Perder el apoyo de los pies","Abrir demasiado los codos","Bajar rápido sin control"]'::jsonb,
    '[{"target":"3 × 8 repeticiones · RPE 7","rest":"90 s"}]'::jsonb,
    'Workout Plan Companion sample plan'
  ),
  (
    'remo-sentado',
    'Remo sentado en polea',
    'Polea baja y agarre',
    'Polea baja, agarre cómodo y asiento con los pies firmemente apoyados.',
    '[{"label":"Siéntate","description":"Coloca los pies y mantén el tronco erguido."},{"label":"Rema","description":"Lleva el agarre hacia el abdomen con los codos atrás."},{"label":"Vuelve","description":"Extiende los brazos lento sin perder la postura."}]'::jsonb,
    'Acerca los codos al cuerpo sin encoger los hombros.',
    'Siéntate erguido, fija los pies y toma el agarre con los brazos extendidos de forma cómoda.',
    'Lleva el agarre hacia el abdomen mientras juntas suavemente las escápulas; vuelve lento al inicio.',
    'Suelta el aire al remar e inspira al volver.',
    '["Tirar con impulso del tronco","Elevar los hombros","Acortar la vuelta del movimiento"]'::jsonb,
    '[{"target":"3 × 10 repeticiones · RPE 7","rest":"75 s"}]'::jsonb,
    'Workout Plan Companion sample plan'
  ),
  (
    'subida-cajon',
    'Subida al cajón',
    'Cajón bajo y estable',
    'Un cajón firme y bajo que te permita mantener la pelvis nivelada.',
    '[{"label":"Apoya","description":"Coloca todo el pie sobre el cajón."},{"label":"Sube","description":"Empuja el cajón con esa pierna sin impulsarte atrás."},{"label":"Baja","description":"Desciende despacio y recupera una posición estable."}]'::jsonb,
    'Empuja con el pie que está sobre el cajón y sube con control.',
    'Elige una altura estable que te permita mantener la pelvis nivelada.',
    'Apoya todo el pie, sube sin impulsarte con la pierna de atrás y baja despacio.',
    'Respira de forma continua, expulsando aire al subir.',
    '["Impulsarse con la pierna de atrás","Dejar caer la rodilla hacia dentro","Usar una altura excesiva"]'::jsonb,
    '[{"target":"3 × 8 por lado · RPE 6","rest":"75 s"}]'::jsonb,
    'Workout Plan Companion sample plan'
  ),
  (
    'dead-bug',
    'Dead bug',
    'Esterilla',
    'Una esterilla o superficie cómoda que no se deslice.',
    '[{"label":"Prepárate","description":"Boca arriba, rodillas sobre caderas y brazos al techo."},{"label":"Extiende","description":"Aleja una pierna y el brazo contrario con control."},{"label":"Alterna","description":"Vuelve al centro y cambia de lado sin prisa."}]'::jsonb,
    'Mueve lento y conserva la espalda baja en una posición cómoda.',
    'Túmbate boca arriba con rodillas y caderas flexionadas, brazos hacia el techo.',
    'Extiende de forma alterna una pierna y el brazo contrario hasta donde mantengas control; vuelve y cambia.',
    'Expulsa el aire al extender y toma aire al regresar.',
    '["Arquear la espalda baja","Moverse demasiado rápido","Forzar el rango de la pierna"]'::jsonb,
    '[{"target":"3 × 6 por lado · RPE 6","rest":"45 s"}]'::jsonb,
    'Workout Plan Companion sample plan'
  )
on conflict (id) do nothing;

create table public.training_history_backups (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_imported_at timestamptz not null default timezone('utc', now()),
  plan_count integer not null default 0 check (plan_count >= 0),
  completed_log_count integer not null default 0 check (completed_log_count >= 0)
);

alter table public.training_history_backups enable row level security;

create policy training_history_backups_select_own on public.training_history_backups
for select to authenticated using ((select auth.uid()) = user_id);

create function public.import_local_training_history(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan jsonb;
  v_week jsonb;
  v_session jsonb;
  v_exercise jsonb;
  v_log jsonb;
  v_set jsonb;
  v_feedback jsonb;
  v_plan_version_id uuid;
  v_week_id uuid;
  v_plan_session_id uuid;
  v_plan_session_exercise_id uuid;
  v_workout_log_id uuid;
  v_local_plan_id text;
  v_existing_local_plan_id text;
  v_plan_name text;
  v_version_number integer;
  v_week_number integer;
  v_session_position integer;
  v_exercise_position integer;
  v_set_number integer;
  v_log_plan_version_number integer;
  v_log_week_number integer;
  v_log_session_position integer;
  v_active_plan_version_number integer;
  v_published_at timestamptz;
  v_started_at timestamptz;
  v_completed_at timestamptz;
  v_units text;
  v_reaction text;
  v_input_load numeric;
  v_repetitions smallint;
  v_rpe numeric;
  v_inserted_plan_count integer := 0;
  v_existing_plan_count integer := 0;
  v_inserted_log_count integer := 0;
  v_existing_log_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if jsonb_typeof(p_payload) <> 'object'
    or jsonb_typeof(p_payload -> 'plans') <> 'array'
    or jsonb_typeof(p_payload -> 'completedLogs') <> 'array' then
    raise exception 'The import payload must include plans and completedLogs arrays';
  end if;

  if jsonb_array_length(p_payload -> 'plans') = 0 then
    raise exception 'At least one published plan is required';
  end if;

  if coalesce(p_payload ->> 'activePlanVersionNumber', '') !~ '^[1-9][0-9]*$' then
    raise exception 'The active plan version is invalid';
  end if;

  v_active_plan_version_number := (p_payload ->> 'activePlanVersionNumber')::integer;

  for v_plan in select value from jsonb_array_elements(p_payload -> 'plans') loop
    if jsonb_typeof(v_plan) <> 'object'
      or coalesce(v_plan ->> 'id', '') = ''
      or coalesce(v_plan ->> 'name', '') = ''
      or coalesce(v_plan ->> 'versionNumber', '') !~ '^[1-9][0-9]*$'
      or jsonb_typeof(v_plan -> 'weeks') <> 'array'
      or jsonb_array_length(v_plan -> 'weeks') <> 4 then
      raise exception 'A published plan is incomplete';
    end if;

    v_local_plan_id := v_plan ->> 'id';
    v_plan_name := v_plan ->> 'name';
    v_version_number := (v_plan ->> 'versionNumber')::integer;

    if v_version_number > 10000 or char_length(v_plan_name) > 160 then
      raise exception 'A published plan exceeds supported limits';
    end if;

    begin
      v_published_at := (v_plan ->> 'publishedAt')::timestamptz;
    exception when others then
      raise exception 'A published plan has an invalid publication date';
    end;

    select id, request_snapshot ->> 'legacyPlanId'
    into v_plan_version_id, v_existing_local_plan_id
    from public.plan_versions
    where user_id = v_user_id and version_number = v_version_number;

    if found then
      if v_existing_local_plan_id is distinct from v_local_plan_id then
        raise exception 'A remote plan already uses local version %', v_version_number;
      end if;
      v_existing_plan_count := v_existing_plan_count + 1;
    else
      insert into public.plan_versions (
        user_id,
        version_number,
        name,
        request_snapshot,
        published_at
      )
      values (
        v_user_id,
        v_version_number,
        v_plan_name,
        jsonb_build_object(
          'importSource', 'local-consented-backup',
          'legacyPlanId', v_local_plan_id,
          'request', coalesce(v_plan -> 'request', 'null'::jsonb)
        ),
        v_published_at
      )
      returning id into v_plan_version_id;

      for v_week in select value from jsonb_array_elements(v_plan -> 'weeks') loop
        if jsonb_typeof(v_week) <> 'object'
          or coalesce(v_week ->> 'number', '') !~ '^[1-4]$'
          or char_length(coalesce(v_week ->> 'goal', '')) not between 1 and 400
          or jsonb_typeof(v_week -> 'sessions') <> 'array' then
          raise exception 'A plan week is invalid';
        end if;

        v_week_number := (v_week ->> 'number')::integer;

        insert into public.plan_weeks (plan_version_id, week_number, goal)
        values (v_plan_version_id, v_week_number, v_week ->> 'goal')
        returning id into v_week_id;

        for v_session in select value from jsonb_array_elements(v_week -> 'sessions') loop
          if jsonb_typeof(v_session) <> 'object'
            or coalesce(v_session ->> 'position', '') !~ '^[1-9][0-9]*$'
            or char_length(coalesce(v_session ->> 'dayLabel', '')) not between 1 and 80
            or char_length(coalesce(v_session ->> 'title', '')) not between 1 and 160
            or char_length(coalesce(v_session ->> 'focus', '')) > 500
            or coalesce(v_session ->> 'estimatedMinutes', '') !~ '^[0-9]+$'
            or jsonb_typeof(v_session -> 'warmUp') <> 'array'
            or jsonb_typeof(v_session -> 'exercises') <> 'array' then
            raise exception 'A plan session is invalid';
          end if;

          v_session_position := (v_session ->> 'position')::integer;

          if v_session_position > 100 or (v_session ->> 'estimatedMinutes')::integer not between 10 and 240 then
            raise exception 'A plan session exceeds supported limits';
          end if;

          insert into public.plan_sessions (
            plan_week_id,
            session_position,
            day_label,
            title,
            focus,
            estimated_minutes,
            warm_up,
            cool_down
          )
          values (
            v_week_id,
            v_session_position,
            v_session ->> 'dayLabel',
            v_session ->> 'title',
            coalesce(v_session ->> 'focus', ''),
            (v_session ->> 'estimatedMinutes')::smallint,
            array(select jsonb_array_elements_text(v_session -> 'warmUp')),
            coalesce(v_session ->> 'coolDown', '')
          )
          returning id into v_plan_session_id;

          for v_exercise in select value from jsonb_array_elements(v_session -> 'exercises') loop
            if jsonb_typeof(v_exercise) <> 'object'
              or coalesce(v_exercise ->> 'position', '') !~ '^[1-9][0-9]*$'
              or coalesce(v_exercise ->> 'id', '') = '' then
              raise exception 'A plan exercise is invalid';
            end if;

            v_exercise_position := (v_exercise ->> 'position')::integer;

            if v_exercise_position > 100 then
              raise exception 'A plan exercise exceeds supported limits';
            end if;

            if not exists (
              select 1 from public.exercise_catalog where id = v_exercise ->> 'id' and is_active
            ) then
              raise exception 'A plan exercise is not in the approved catalogue';
            end if;

            insert into public.plan_session_exercises (
              plan_session_id,
              exercise_position,
              catalog_exercise_id,
              exercise_snapshot
            )
            values (
              v_plan_session_id,
              v_exercise_position,
              v_exercise ->> 'id',
              v_exercise -> 'snapshot'
            );
          end loop;
        end loop;
      end loop;

      v_inserted_plan_count := v_inserted_plan_count + 1;
    end if;
  end loop;

  select id into v_plan_version_id
  from public.plan_versions
  where user_id = v_user_id and version_number = v_active_plan_version_number;

  if v_plan_version_id is null then
    raise exception 'The active plan was not imported';
  end if;

  insert into public.active_plan_selection (user_id, plan_version_id, selected_at)
  values (v_user_id, v_plan_version_id, timezone('utc', now()))
  on conflict (user_id) do update
  set plan_version_id = excluded.plan_version_id,
      selected_at = excluded.selected_at;

  for v_log in select value from jsonb_array_elements(p_payload -> 'completedLogs') loop
    if jsonb_typeof(v_log) <> 'object'
      or coalesce(v_log ->> 'planVersionNumber', '') !~ '^[1-9][0-9]*$'
      or coalesce(v_log ->> 'weekNumber', '') !~ '^[1-4]$'
      or coalesce(v_log ->> 'sessionPosition', '') !~ '^[1-9][0-9]*$'
      or char_length(coalesce(v_log ->> 'sessionTitle', '')) not between 1 and 160
      or coalesce(v_log ->> 'units', '') not in ('metric', 'imperial')
      or jsonb_typeof(v_log -> 'sets') <> 'array'
      or jsonb_typeof(v_log -> 'exerciseFeedback') <> 'array' then
      raise exception 'A completed workout log is invalid';
    end if;

    v_log_plan_version_number := (v_log ->> 'planVersionNumber')::integer;
    v_log_week_number := (v_log ->> 'weekNumber')::integer;
    v_log_session_position := (v_log ->> 'sessionPosition')::integer;
    v_units := v_log ->> 'units';

    begin
      v_started_at := (v_log ->> 'startedAt')::timestamptz;
      v_completed_at := (v_log ->> 'completedAt')::timestamptz;
    exception when others then
      raise exception 'A completed workout log has invalid dates';
    end;

    select session.id
    into v_plan_session_id
    from public.plan_sessions session
    join public.plan_weeks week on week.id = session.plan_week_id
    join public.plan_versions version on version.id = week.plan_version_id
    where version.user_id = v_user_id
      and version.version_number = v_log_plan_version_number
      and week.week_number = v_log_week_number
      and session.session_position = v_log_session_position;

    if v_plan_session_id is null then
      raise exception 'A completed workout log does not match an imported plan session';
    end if;

    select id into v_plan_version_id
    from public.plan_versions
    where user_id = v_user_id and version_number = v_log_plan_version_number;

    insert into public.workout_logs (
      user_id,
      plan_version_id,
      plan_session_id,
      session_title_snapshot,
      status,
      started_at,
      updated_at,
      completed_at,
      units,
      note
    )
    values (
      v_user_id,
      v_plan_version_id,
      v_plan_session_id,
      v_log ->> 'sessionTitle',
      'completed',
      v_started_at,
      v_completed_at,
      v_completed_at,
      v_units,
      coalesce(v_log ->> 'note', '')
    )
    on conflict (plan_session_id) do nothing
    returning id into v_workout_log_id;

    if v_workout_log_id is null then
      v_existing_log_count := v_existing_log_count + 1;
      continue;
    end if;

    for v_set in select value from jsonb_array_elements(v_log -> 'sets') loop
      if jsonb_typeof(v_set) <> 'object'
        or coalesce(v_set ->> 'exercisePosition', '') !~ '^[1-9][0-9]*$'
        or coalesce(v_set ->> 'setNumber', '') !~ '^[1-9][0-9]*$'
        or coalesce(v_set ->> 'exerciseId', '') = ''
        or char_length(coalesce(v_set ->> 'exerciseName', '')) not between 1 and 160
        or jsonb_typeof(v_set -> 'completed') <> 'boolean'
        or jsonb_typeof(v_set -> 'load') not in ('number', 'null')
        or jsonb_typeof(v_set -> 'repetitions') not in ('number', 'null')
        or jsonb_typeof(v_set -> 'rpe') not in ('number', 'null') then
        raise exception 'A logged set is invalid';
      end if;

      v_exercise_position := (v_set ->> 'exercisePosition')::integer;
      v_set_number := (v_set ->> 'setNumber')::integer;
      v_input_load := (v_set ->> 'load')::numeric;
      v_repetitions := (v_set ->> 'repetitions')::smallint;
      v_rpe := (v_set ->> 'rpe')::numeric;

      if v_exercise_position > 100 or v_set_number > 1000 then
        raise exception 'A logged set exceeds supported limits';
      end if;

      select id into v_plan_session_exercise_id
      from public.plan_session_exercises
      where plan_session_id = v_plan_session_id
        and exercise_position = v_exercise_position
        and catalog_exercise_id = v_set ->> 'exerciseId';

      if v_plan_session_exercise_id is null then
        raise exception 'A logged set does not match the plan exercise';
      end if;

      insert into public.workout_log_sets (
        workout_log_id,
        source_plan_session_exercise_id,
        exercise_id,
        exercise_name,
        set_number,
        target,
        rest,
        input_load,
        input_unit,
        load_kg,
        repetitions,
        rpe,
        is_completed
      )
      values (
        v_workout_log_id,
        v_plan_session_exercise_id,
        v_set ->> 'exerciseId',
        v_set ->> 'exerciseName',
        v_set_number,
        coalesce(v_set ->> 'target', ''),
        coalesce(v_set ->> 'rest', ''),
        v_input_load,
        v_units,
        case
          when v_input_load is null then null
          when v_units = 'metric' then v_input_load
          else round(v_input_load * 0.45359237, 2)
        end,
        v_repetitions,
        v_rpe,
        (v_set ->> 'completed')::boolean
      );
    end loop;

    for v_feedback in select value from jsonb_array_elements(v_log -> 'exerciseFeedback') loop
      if jsonb_typeof(v_feedback) <> 'object'
        or coalesce(v_feedback ->> 'exercisePosition', '') !~ '^[1-9][0-9]*$'
        or coalesce(v_feedback ->> 'exerciseId', '') = ''
        or coalesce(v_feedback ->> 'reaction', '') not in ('up', 'down', '')
        or char_length(coalesce(v_feedback ->> 'note', '')) > 2000 then
        raise exception 'Workout feedback is invalid';
      end if;

      v_exercise_position := (v_feedback ->> 'exercisePosition')::integer;
      v_reaction := nullif(v_feedback ->> 'reaction', '');

      select id into v_plan_session_exercise_id
      from public.plan_session_exercises
      where plan_session_id = v_plan_session_id
        and exercise_position = v_exercise_position
        and catalog_exercise_id = v_feedback ->> 'exerciseId';

      if v_plan_session_exercise_id is null then
        raise exception 'Workout feedback does not match the plan exercise';
      end if;

      insert into public.workout_exercise_feedback (
        workout_log_id,
        source_plan_session_exercise_id,
        exercise_id,
        reaction,
        note
      )
      values (
        v_workout_log_id,
        v_plan_session_exercise_id,
        v_feedback ->> 'exerciseId',
        v_reaction,
        coalesce(v_feedback ->> 'note', '')
      );
    end loop;

    v_inserted_log_count := v_inserted_log_count + 1;
  end loop;

  insert into public.training_history_backups (
    user_id,
    last_imported_at,
    plan_count,
    completed_log_count
  )
  values (
    v_user_id,
    timezone('utc', now()),
    jsonb_array_length(p_payload -> 'plans'),
    jsonb_array_length(p_payload -> 'completedLogs')
  )
  on conflict (user_id) do update
  set last_imported_at = excluded.last_imported_at,
      plan_count = excluded.plan_count,
      completed_log_count = excluded.completed_log_count;

  return jsonb_build_object(
    'existingLogCount', v_existing_log_count,
    'existingPlanCount', v_existing_plan_count,
    'importedLogCount', v_inserted_log_count,
    'importedPlanCount', v_inserted_plan_count
  );
end;
$$;

grant select on public.training_history_backups to authenticated;
grant execute on function public.import_local_training_history(jsonb) to authenticated;
