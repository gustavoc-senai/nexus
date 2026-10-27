-- Base math grading uses the existing private answer catalog and protected attempt tables.
-- All basic activities are independently available, without spatial geometry prerequisites.
create or replace function nexus_private.submit_basic_attempt(p_mission_id text,p_answers jsonb,p_request_id uuid,p_hints jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare expected jsonb; result public.nexus_attempts%rowtype; score integer:=0; wrong jsonb:='[]'; hint_total integer:=0; i integer; value numeric;
begin
 if not nexus_private.has_role('student') then raise exception 'Student access required'; end if;
 if p_mission_id not like 'basic-%' then raise exception 'Basic math mission required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 select * into result from public.nexus_attempts where student_id=auth.uid() and request_id=p_request_id;
 if found then
  if result.mission_id<>p_mission_id then raise exception 'Request belongs to another mission'; end if;
  return to_jsonb(result);
 end if;
 select answers into expected from nexus_private.catalog where id=p_mission_id;
 if expected is null or jsonb_typeof(p_answers) is distinct from 'array' or jsonb_typeof(p_hints) is distinct from 'array' then raise exception 'Invalid answers'; end if;
 if jsonb_array_length(p_answers)<>jsonb_array_length(expected) or jsonb_array_length(p_hints)<>jsonb_array_length(expected) then raise exception 'Invalid answer count'; end if;
 for i in 0..jsonb_array_length(expected)-1 loop
  if jsonb_typeof(p_answers->i) is distinct from 'number' or jsonb_typeof(p_hints->i) is distinct from 'number' then raise exception 'Numeric values required'; end if;
  value:=(p_hints->>i)::numeric;
  if value not between 0 and 3 or trunc(value)<>value then raise exception 'Invalid hints'; end if;
  hint_total:=hint_total+value::integer;
  if abs((p_answers->>i)::numeric-(expected->>i)::numeric)<=0.000000001 then score:=score+1; else wrong:=wrong||jsonb_build_array(i); end if;
 end loop;
 insert into public.nexus_attempts(student_id,mission_id,correct,total,mistakes,request_id,hints_used,hints_by_question) values(auth.uid(),p_mission_id,score,jsonb_array_length(expected),wrong,p_request_id,hint_total,p_hints) returning * into result;
 delete from public.nexus_drafts where student_id=auth.uid() and mission_id=p_mission_id;
 return to_jsonb(result);
end; $$;
create or replace function public.nexus_submit_basic_attempt(p_mission_id text,p_answers jsonb,p_request_id uuid,p_hints jsonb) returns jsonb language sql security invoker set search_path='' as $$select nexus_private.submit_basic_attempt(p_mission_id,p_answers,p_request_id,p_hints);$$;
revoke all on function nexus_private.submit_basic_attempt(text,jsonb,uuid,jsonb),public.nexus_submit_basic_attempt(text,jsonb,uuid,jsonb) from public,anon,authenticated;
grant execute on function nexus_private.submit_basic_attempt(text,jsonb,uuid,jsonb),public.nexus_submit_basic_attempt(text,jsonb,uuid,jsonb) to authenticated;