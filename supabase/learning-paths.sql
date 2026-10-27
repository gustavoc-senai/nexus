-- Generated update for existing Nexus installations. Run this file once.
BEGIN;
-- Incremental update: run on an existing Nexus installation.

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

-- Incremental update for existing Nexus installations.

create table if not exists public.nexus_messages (
 id uuid primary key default gen_random_uuid(), class_id uuid not null references public.nexus_classes(id) on delete cascade,
 student_id uuid not null references public.profiles(id), author_id uuid not null default auth.uid() references public.profiles(id),
 author_name text not null default '', body text not null check(length(trim(body)) between 1 and 2000),
 request_id uuid not null, created_at timestamptz not null default now(), unique(author_id,request_id)
);
create index if not exists nexus_messages_thread on public.nexus_messages(class_id,student_id,created_at);
create table if not exists public.nexus_video_lessons (
 id uuid primary key default gen_random_uuid(), class_id uuid not null references public.nexus_classes(id) on delete cascade,
 teacher_id uuid not null default auth.uid() references public.profiles(id), title text not null check(length(trim(title)) between 2 and 120),
 description text not null default '' check(length(description)<=1000), url text not null check(url ~ '^https://[^[:space:]]+$' and length(url)<=2000),
 created_at timestamptz not null default now()
);
create index if not exists nexus_videos_class on public.nexus_video_lessons(class_id,created_at);
alter table public.nexus_messages enable row level security;
alter table public.nexus_video_lessons enable row level security;
create or replace function nexus_private.can_discuss(p_class uuid,p_student uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.nexus_classes c join public.nexus_memberships m on m.class_id=c.id join public.profiles p on p.id=m.student_id
 where c.id=p_class and not c.archived and m.student_id=p_student and p.is_active and p.role::text='student'
 and (nexus_private.has_role('teacher') and c.teacher_id=auth.uid() or nexus_private.has_role('student') and p_student=auth.uid()));
$$;
create or replace function nexus_private.message_author() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.author_id is distinct from auth.uid() then raise exception 'Invalid sender'; end if;
 select full_name into new.author_name from public.profiles where id=auth.uid();
 return new;
end; $$;
drop trigger if exists nexus_message_author on public.nexus_messages;
create trigger nexus_message_author before insert on public.nexus_messages for each row execute function nexus_private.message_author();
drop policy if exists messages_read on public.nexus_messages;
create policy messages_read on public.nexus_messages for select to authenticated using(nexus_private.can_discuss(class_id,student_id));
drop policy if exists messages_send on public.nexus_messages;
create policy messages_send on public.nexus_messages for insert to authenticated with check(author_id=(select auth.uid()) and nexus_private.can_discuss(class_id,student_id));
drop policy if exists videos_read on public.nexus_video_lessons;
create policy videos_read on public.nexus_video_lessons for select to authenticated using(nexus_private.in_class(class_id) or nexus_private.owns_class(class_id));
drop policy if exists videos_publish on public.nexus_video_lessons;
create policy videos_publish on public.nexus_video_lessons for insert to authenticated with check(teacher_id=(select auth.uid()) and nexus_private.owns_class(class_id) and exists(select 1 from public.nexus_classes where id=class_id and not archived));
drop policy if exists videos_remove on public.nexus_video_lessons;
create policy videos_remove on public.nexus_video_lessons for delete to authenticated using(teacher_id=(select auth.uid()) and nexus_private.owns_class(class_id));
revoke all on public.nexus_messages,public.nexus_video_lessons from public,anon,authenticated;
grant select on public.nexus_messages,public.nexus_video_lessons to authenticated;
grant insert(class_id,student_id,body,request_id) on public.nexus_messages to authenticated;
grant insert(class_id,title,description,url) on public.nexus_video_lessons to authenticated;
grant delete on public.nexus_video_lessons to authenticated;
revoke all on function nexus_private.can_discuss(uuid,uuid),nexus_private.message_author() from public,anon,authenticated;
grant execute on function nexus_private.can_discuss(uuid,uuid) to authenticated;

-- Incremental update for an existing Nexus installation.

create table if not exists public.nexus_tasks (
 id uuid primary key default gen_random_uuid(), class_id uuid not null references public.nexus_classes(id) on delete cascade,
 teacher_id uuid not null default auth.uid() references public.profiles(id), title text not null check(length(trim(title)) between 2 and 120),
 activities text not null check(length(trim(activities)) between 10 and 4000), due_at timestamptz not null, created_at timestamptz not null default now()
);
create index if not exists nexus_tasks_class_due on public.nexus_tasks(class_id,due_at);
create table if not exists public.nexus_task_completions (
 task_id uuid not null references public.nexus_tasks(id) on delete cascade, student_id uuid not null default auth.uid() references public.profiles(id),
 completed_at timestamptz not null default now(), primary key(task_id,student_id)
);
create index if not exists nexus_task_completions_student on public.nexus_task_completions(student_id);
alter table public.nexus_tasks enable row level security;
alter table public.nexus_task_completions enable row level security;
drop policy if exists tasks_read on public.nexus_tasks;
create policy tasks_read on public.nexus_tasks for select to authenticated using(nexus_private.owns_class(class_id) or nexus_private.in_class(class_id));
drop policy if exists tasks_publish on public.nexus_tasks;
create policy tasks_publish on public.nexus_tasks for insert to authenticated with check(teacher_id=(select auth.uid()) and nexus_private.owns_class(class_id) and due_at>now() and exists(select 1 from public.nexus_classes where id=class_id and not archived));
drop policy if exists tasks_edit on public.nexus_tasks;
create policy tasks_edit on public.nexus_tasks for update to authenticated using(teacher_id=(select auth.uid()) and nexus_private.owns_class(class_id)) with check(teacher_id=(select auth.uid()) and nexus_private.owns_class(class_id) and due_at>now() and exists(select 1 from public.nexus_classes where id=class_id and not archived));
drop policy if exists completions_read on public.nexus_task_completions;
create policy completions_read on public.nexus_task_completions for select to authenticated using(exists(select 1 from public.nexus_tasks t where t.id=task_id and (nexus_private.owns_class(t.class_id) or student_id=(select auth.uid()) and nexus_private.in_class(t.class_id))));
drop policy if exists completions_create on public.nexus_task_completions;
create policy completions_create on public.nexus_task_completions for insert to authenticated with check(student_id=(select auth.uid()) and nexus_private.has_role('student') and exists(select 1 from public.nexus_tasks t where t.id=task_id and nexus_private.in_class(t.class_id)));
revoke all on public.nexus_tasks,public.nexus_task_completions from public,anon,authenticated;
grant select on public.nexus_tasks,public.nexus_task_completions to authenticated;
grant insert(class_id,title,activities,due_at) on public.nexus_tasks to authenticated;
grant update(title,activities,due_at) on public.nexus_tasks to authenticated;
grant insert(task_id) on public.nexus_task_completions to authenticated;

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
insert into nexus_private.catalog(id,position,answers) values
('basic-addition-1', 15, '[2,3,4,5,5,6,7,8]'::jsonb),
('basic-addition-2', 16, '[13,15,19,19,23,30,25,35]'::jsonb),
('basic-addition-3', 17, '[45,61,65,92,125,193,375,615]'::jsonb),
('basic-subtraction-1', 18, '[1,2,2,2,4,3,5,0]'::jsonb),
('basic-subtraction-2', 19, '[7,8,9,14,16,18,18,23]'::jsonb),
('basic-subtraction-3', 20, '[26,34,45,63,119,165,232,335]'::jsonb),
('basic-multiplication-1', 21, '[2,4,6,8,10,9,12,20]'::jsonb),
('basic-multiplication-2', 22, '[12,21,32,30,42,56,72,90]'::jsonb),
('basic-multiplication-3', 23, '[36,60,66,70,112,144,240,400]'::jsonb),
('basic-division-1', 24, '[1,2,3,2,4,3,5,3]'::jsonb),
('basic-division-2', 25, '[5,6,5,4,7,4,6,9]'::jsonb),
('basic-division-3', 26, '[8,8,9,9,12,12,12,12]'::jsonb),
('basic-fractions-1', 27, '[10,30,3,20,16,0.75]'::jsonb),
('basic-fractions-2', 28, '[20,60,4,40,32,1.5]'::jsonb),
('basic-decimals-1', 29, '[3.75,6.25,10,2.5,1.75,3]'::jsonb),
('basic-decimals-2', 30, '[5.25,16.25,20,5,1.5,6]'::jsonb),
('basic-percent-1', 31, '[20,20,80,55,75,15]'::jsonb),
('basic-percent-2', 32, '[40,40,160,110,75,30]'::jsonb),
('basic-measures-1', 33, '[300,120,1500,2.5,2500,0.75]'::jsonb),
('basic-measures-2', 34, '[600,240,3000,5,4500,1.5]'::jsonb),
('basic-plane-1', 35, '[16,24,20,110,16,12]'::jsonb),
('basic-plane-2', 36, '[32,48,40,80,26,48]'::jsonb),
('basic-powers-1', 37, '[16,6,16,14,10,100]'::jsonb),
('basic-powers-2', 38, '[25,7,32,21,20,1000]'::jsonb),
('basic-algebra-1', 39, '[7,5,10,3,3,14]'::jsonb),
('basic-algebra-2', 40, '[14,10,20,6,6,26]'::jsonb),
('basic-statistics-1', 41, '[4,3,2,45,9,5]'::jsonb),
('basic-statistics-2', 42, '[8,6,4,90,18,10]'::jsonb),
('basic-probability-1', 43, '[60,50,50,20,12,100]'::jsonb),
('basic-probability-2', 44, '[60,50,50,20,24,100]'::jsonb),
('basic-diagnostic', 45, '[12,24,10,3.75,20,300,7,4]'::jsonb)
on conflict(id) do update set position=excluded.position,answers=excluded.answers;

-- Catalog-linked activities. Existing task ownership and completion RLS remains in force.
alter table public.nexus_tasks add column if not exists mission_ids text[] not null default '{}';
create or replace function nexus_private.validate_task_missions() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is not null and not nexus_private.owns_class(new.class_id) then raise exception 'Teacher access required'; end if;
 if cardinality(new.mission_ids)>30 or exists(select 1 from unnest(new.mission_ids) as item(id) where item.id is null or item.id='basic-diagnostic' or not exists(select 1 from nexus_private.catalog c where c.id=item.id)) then
  raise exception 'Select up to 30 valid catalog activities';
 end if;
 return new;
end; $$;
revoke all on function nexus_private.validate_task_missions() from public,anon,authenticated;
drop trigger if exists nexus_task_missions on public.nexus_tasks;
create trigger nexus_task_missions before insert or update of mission_ids on public.nexus_tasks for each row execute function nexus_private.validate_task_missions();
grant insert(mission_ids),update(mission_ids) on public.nexus_tasks to authenticated;

COMMIT;
