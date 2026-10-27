-- Incremental update: run on an existing Nexus installation.
BEGIN;
alter table public.nexus_attempts add column if not exists hints_used integer check(hints_used >= 0);
alter table public.nexus_attempts add column if not exists hints_by_question jsonb check(hints_by_question is null or jsonb_typeof(hints_by_question)='array');

-- Reuse server grading and its prerequisite checks; store telemetry in the same transaction.
create or replace function nexus_private.submit_tracked_attempt(p_mission_id text,p_answers jsonb,p_request_id uuid,p_hints jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; prior boolean; hint_total integer := 0; item jsonb; expected_count integer;
begin
  if not nexus_private.has_role('student') then raise exception 'Student access required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
  select exists(select 1 from public.nexus_attempts where student_id=auth.uid() and request_id=p_request_id) into prior;
  if prior then return nexus_private.submit_attempt(p_mission_id,p_answers,p_request_id); end if;
  select jsonb_array_length(answers) into expected_count from nexus_private.catalog where id=p_mission_id;
  if expected_count is null or jsonb_typeof(p_hints) is distinct from 'array' or jsonb_array_length(p_hints)<>expected_count then raise exception 'Invalid hint counts'; end if;
  for item in select value from jsonb_array_elements(p_hints) loop
    if jsonb_typeof(item) is distinct from 'number' then raise exception 'Invalid hint count'; end if;
    if (item::text)::numeric not between 0 and 3 or trunc((item::text)::numeric)<>(item::text)::numeric then raise exception 'Invalid hint count'; end if;
    hint_total:=hint_total+((item::text)::numeric)::integer;
  end loop;
  result:=nexus_private.submit_attempt(p_mission_id,p_answers,p_request_id);
  update public.nexus_attempts set hints_used=hint_total,hints_by_question=p_hints where id=(result->>'id')::uuid;
  select to_jsonb(a) into result from public.nexus_attempts a where id=(result->>'id')::uuid;
  return result;
end; $$;
create or replace function public.nexus_submit_tracked_attempt(p_mission_id text,p_answers jsonb,p_request_id uuid,p_hints jsonb) returns jsonb language sql security invoker set search_path='' as $$select nexus_private.submit_tracked_attempt(p_mission_id,p_answers,p_request_id,p_hints);$$;
revoke all on function nexus_private.submit_tracked_attempt(text,jsonb,uuid,jsonb),public.nexus_submit_tracked_attempt(text,jsonb,uuid,jsonb) from public,anon;
grant execute on function nexus_private.submit_tracked_attempt(text,jsonb,uuid,jsonb),public.nexus_submit_tracked_attempt(text,jsonb,uuid,jsonb) to authenticated;
COMMIT;