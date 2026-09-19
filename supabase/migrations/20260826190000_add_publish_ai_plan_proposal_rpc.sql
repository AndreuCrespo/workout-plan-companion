-- Publishes a reviewable remote proposal atomically. Assistant-created exercise candidates are
-- inserted into the owner's private catalogue only inside this confirmation transaction.
create function public.publish_ai_plan_proposal(p_proposal_id uuid)
returns public.plan_versions
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_active_plan_id uuid;
  v_assistant_candidate jsonb;
  v_assistant_candidates jsonb;
  v_assistant_exercise_id text;
  v_assistant_exercise_ids jsonb := '{}'::jsonb;
  v_assistant_key text;
  v_catalog_exercise record;
  v_cool_down text;
  v_exercise jsonb;
  v_exercise_id text;
  v_exercise_position integer;
  v_exercise_snapshot jsonb;
  v_new_plan public.plan_versions;
  v_plan_session_id uuid;
  v_plan_week_id uuid;
  v_proposal public.plan_proposals;
  v_proposal_snapshot jsonb;
  v_session jsonb;
  v_session_position integer;
  v_source text;
  v_version_number integer;
  v_warm_up text[];
  v_week jsonb;
  v_week_number integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  -- Lock one private row to serialize competing publication attempts for this person.
  perform 1
  from public.profiles
  where user_id = auth.uid()
  for update;

  select * into v_proposal
  from public.plan_proposals
  where id = p_proposal_id
    and user_id = auth.uid()
    and status = 'reviewable'
  for update;

  if v_proposal.id is null then
    raise exception 'Reviewable proposal was not found';
  end if;

  select plan_version_id into v_active_plan_id
  from public.active_plan_selection
  where user_id = auth.uid()
  for update;

  if v_proposal.source_plan_version_id is distinct from v_active_plan_id then
    raise exception 'Proposal source no longer matches the active plan';
  end if;

  v_proposal_snapshot := v_proposal.proposal_snapshot;
  v_assistant_candidates := coalesce(v_proposal_snapshot->'assistantExercises', '[]'::jsonb);

  if jsonb_typeof(v_proposal_snapshot) <> 'object'
    or jsonb_typeof(v_assistant_candidates) <> 'array'
    or jsonb_typeof(v_proposal_snapshot->'weeks') <> 'array'
    or jsonb_array_length(v_proposal_snapshot->'weeks') <> 4 then
    raise exception 'Proposal snapshot has an invalid structure';
  end if;

  -- New candidates are private and become active only because this proposal is confirmed.
  for v_assistant_candidate in
    select value
    from jsonb_array_elements(v_assistant_candidates)
  loop
    v_assistant_key := v_assistant_candidate->>'key';

    if v_assistant_key is null or v_assistant_key = '' or v_assistant_exercise_ids ? v_assistant_key then
      raise exception 'Assistant exercise candidates are invalid';
    end if;

    v_assistant_exercise_id := 'assistant-' || extensions.gen_random_uuid()::text;

    insert into public.exercise_catalog (
      id,
      owner_user_id,
      entry_source,
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
      source_attribution,
      is_active
    )
    values (
      v_assistant_exercise_id,
      auth.uid(),
      'assistant',
      v_assistant_candidate->>'name',
      v_assistant_candidate->>'equipment',
      v_assistant_candidate->>'equipmentSetup',
      v_assistant_candidate->'techniqueSteps',
      v_assistant_candidate->>'coachingCue',
      v_assistant_candidate->>'preparation',
      v_assistant_candidate->>'execution',
      v_assistant_candidate->>'breathing',
      v_assistant_candidate->'commonMistakes',
      '[]'::jsonb,
      'Assistant-generated exercise confirmed by its owner.',
      true
    );

    v_assistant_exercise_ids := v_assistant_exercise_ids || jsonb_build_object(v_assistant_key, v_assistant_exercise_id);
  end loop;

  select coalesce(max(version_number), 0) + 1 into v_version_number
  from public.plan_versions
  where user_id = auth.uid();

  insert into public.plan_versions (
    user_id,
    version_number,
    name,
    request_snapshot,
    source_proposal_id,
    published_at
  )
  values (
    auth.uid(),
    v_version_number,
    v_proposal_snapshot->>'name',
    v_proposal.request_snapshot,
    v_proposal.id,
    timezone('utc', now())
  )
  returning * into v_new_plan;

  for v_week in
    select value
    from jsonb_array_elements(v_proposal_snapshot->'weeks')
  loop
    v_week_number := (v_week->>'number')::integer;

    if v_week_number not between 1 and 4 then
      raise exception 'Proposal contains an invalid week number';
    end if;

    insert into public.plan_weeks (plan_version_id, week_number, goal)
    values (v_new_plan.id, v_week_number, v_week->>'goal')
    returning id into v_plan_week_id;

    v_session_position := 0;

    for v_session in
      select value
      from jsonb_array_elements(v_week->'sessions')
    loop
      v_session_position := v_session_position + 1;
      select array_agg(value) into v_warm_up
      from jsonb_array_elements_text(v_session->'warmUp') as warm_up(value);

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
        v_plan_week_id,
        v_session_position,
        v_session->>'dayLabel',
        v_session->>'title',
        v_session->>'focus',
        (v_session->>'estimatedMinutes')::smallint,
        coalesce(v_warm_up, '{}'::text[]),
        v_session->>'coolDown'
      )
      returning id into v_plan_session_id;

      v_exercise_position := 0;

      for v_exercise in
        select value
        from jsonb_array_elements(v_session->'exercises')
      loop
        v_exercise_position := v_exercise_position + 1;
        v_source := v_exercise->>'source';

        if v_source = 'catalog' then
          v_exercise_id := v_exercise->>'exerciseId';

          select * into v_catalog_exercise
          from public.exercise_catalog
          where id = v_exercise_id
            and is_active
            and (owner_user_id is null or owner_user_id = auth.uid());

          if v_catalog_exercise.id is null then
            raise exception 'Proposal references an unavailable catalogue exercise';
          end if;

          v_exercise_snapshot := jsonb_build_object(
            'id', v_catalog_exercise.id,
            'name', v_catalog_exercise.name,
            'equipment', v_catalog_exercise.equipment,
            'equipmentSetup', v_catalog_exercise.equipment_setup,
            'techniqueSteps', v_catalog_exercise.technique_steps,
            'coachingCue', v_catalog_exercise.coaching_cue,
            'preparation', v_catalog_exercise.preparation,
            'execution', v_catalog_exercise.execution,
            'breathing', v_catalog_exercise.breathing,
            'commonMistakes', v_catalog_exercise.common_mistakes,
            'sets', v_exercise->'sets'
          );
        elsif v_source = 'assistant' then
          v_assistant_key := v_exercise->>'assistantExerciseKey';
          v_exercise_id := v_assistant_exercise_ids->>v_assistant_key;

          select candidate.value into v_assistant_candidate
          from jsonb_array_elements(v_assistant_candidates) as candidate(value)
          where candidate.value->>'key' = v_assistant_key;

          if v_exercise_id is null or v_assistant_candidate is null then
            raise exception 'Proposal references an undefined assistant exercise';
          end if;

          v_exercise_snapshot := jsonb_build_object(
            'id', v_exercise_id,
            'name', v_assistant_candidate->>'name',
            'equipment', v_assistant_candidate->>'equipment',
            'equipmentSetup', v_assistant_candidate->>'equipmentSetup',
            'techniqueSteps', v_assistant_candidate->'techniqueSteps',
            'coachingCue', v_assistant_candidate->>'coachingCue',
            'preparation', v_assistant_candidate->>'preparation',
            'execution', v_assistant_candidate->>'execution',
            'breathing', v_assistant_candidate->>'breathing',
            'commonMistakes', v_assistant_candidate->'commonMistakes',
            'sets', v_exercise->'sets'
          );
        else
          raise exception 'Proposal exercise source is invalid';
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
          v_exercise_id,
          v_exercise_snapshot
        );
      end loop;
    end loop;
  end loop;

  update public.plan_proposals
  set status = 'published',
      published_plan_version_id = v_new_plan.id,
      published_at = timezone('utc', now())
  where id = v_proposal.id;

  insert into public.active_plan_selection (user_id, plan_version_id, selected_at)
  values (auth.uid(), v_new_plan.id, timezone('utc', now()))
  on conflict (user_id) do update
    set plan_version_id = excluded.plan_version_id,
        selected_at = excluded.selected_at;

  return v_new_plan;
end;
$$;

grant execute on function public.publish_ai_plan_proposal(uuid) to authenticated;
