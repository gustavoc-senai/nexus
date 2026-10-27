-- Apply only to the Nexus project after reviewing its existing profiles schema.
-- Execute this file followed by catalog.sql in one transaction (see README).
create schema if not exists nexus_private;
revoke all on schema nexus_private from public, anon;
grant usage on schema nexus_private to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', email text, phone text, avatar_url text,
  role text not null default 'student' check (role in ('student','teacher','admin')),
  is_active boolean not null default true
);
alter table public.profiles enable row level security;

create table public.nexus_classes (
  id uuid primary key default gen_random_uuid(), teacher_id uuid not null references public.profiles(id),
  name text not null check (length(trim(name)) between 2 and 100),
  join_code text not null unique default upper(left(replace(gen_random_uuid()::text,'-',''),12)),
  archived boolean not null default false, created_at timestamptz not null default now()
);
create index nexus_classes_teacher on public.nexus_classes(teacher_id);
create table public.nexus_memberships (
  class_id uuid not null references public.nexus_classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(class_id,student_id)
);
create index nexus_memberships_student on public.nexus_memberships(student_id);
create table nexus_private.catalog (
  id text primary key, position integer unique not null, answers jsonb not null check(jsonb_typeof(answers)='array')
);
alter table nexus_private.catalog enable row level security;
create table public.nexus_attempts (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id) on delete cascade,
  mission_id text not null references nexus_private.catalog(id), correct integer not null, total integer not null,
  mistakes jsonb not null default '[]', request_id uuid not null, created_at timestamptz not null default now(),
  check (total > 0 and correct between 0 and total), unique(student_id,request_id)
);
create index nexus_attempts_student_mission on public.nexus_attempts(student_id,mission_id);
create table public.nexus_drafts (
  student_id uuid not null references public.profiles(id) on delete cascade,
  mission_id text not null references nexus_private.catalog(id), draft jsonb not null check(jsonb_typeof(draft)='object' and octet_length(draft::text)<30000),
  primary key(student_id,mission_id)
);
create table public.nexus_challenges (
  id uuid primary key default gen_random_uuid(), teacher_id uuid not null references public.profiles(id),
  class_id uuid references public.nexus_classes(id), title text not null check(length(trim(title)) between 2 and 120),
  prompt text not null check(length(trim(prompt)) between 10 and 2000), numeric_answer numeric not null,
  unit text not null check(unit in ('cm','m','cm²','m²','cm³','m³','L','unidades')),
  explanation text not null check(length(trim(explanation)) between 10 and 4000),
  difficulty text not null check(difficulty in ('easy','intermediate','hard')),
  shape text not null check(shape in ('cube','prism','cylinder','cone','pyramid','sphere')),
  created_at timestamptz not null default now()
);
create index nexus_challenges_teacher on public.nexus_challenges(teacher_id);
create index nexus_challenges_class on public.nexus_challenges(class_id);
create table public.nexus_custom_attempts (
  id uuid primary key default gen_random_uuid(), challenge_id uuid not null references public.nexus_challenges(id),
  student_id uuid not null references public.profiles(id), correct boolean not null, request_id uuid not null,
  created_at timestamptz not null default now(), unique(student_id,request_id)
);
create index nexus_custom_attempts_student on public.nexus_custom_attempts(student_id);
create index nexus_custom_attempts_challenge on public.nexus_custom_attempts(challenge_id);

-- Internal lookups avoid recursive policies. Each is scoped to the current identity.
create function nexus_private.has_role(p_role text) returns boolean language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(select 1 from public.profiles where id=auth.uid() and is_active and (role::text=p_role or p_role='teacher' and role::text='admin'));
$$;
create function nexus_private.owns_class(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
  select nexus_private.has_role('teacher') and exists(select 1 from public.nexus_classes where id=p_id and teacher_id=auth.uid());
$$;
create function nexus_private.in_class(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
  select nexus_private.has_role('student') and exists(select 1 from public.nexus_memberships m join public.nexus_classes c on c.id=m.class_id where m.class_id=p_id and m.student_id=auth.uid() and not c.archived);
$$;
create function nexus_private.teaches(p_student uuid) returns boolean language sql stable security definer set search_path='' as $$
  select nexus_private.has_role('teacher') and exists(select 1 from public.nexus_memberships m join public.nexus_classes c on c.id=m.class_id where m.student_id=p_student and c.teacher_id=auth.uid());
$$;

create function nexus_private.protect_profile() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if auth.uid() is not null then
    if tg_op='INSERT' and (new.id<>auth.uid() or new.role::text<>'student' or not new.is_active) then raise exception 'Profile authorization cannot be assigned by the client'; end if;
    if tg_op='UPDATE' and (new.id<>old.id or new.role is distinct from old.role or new.is_active is distinct from old.is_active or new.email is distinct from old.email) then raise exception 'Protected profile fields'; end if;
  end if;
  return new;
end; $$;
create trigger nexus_protect_profile before insert or update on public.profiles for each row execute function nexus_private.protect_profile();
create function nexus_private.new_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,full_name,email,phone,role) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email,new.raw_user_meta_data->>'phone','student') on conflict(id) do nothing;
  return new;
end; $$;
create trigger nexus_new_profile after insert on auth.users for each row execute function nexus_private.new_profile();
-- Do not overwrite existing profile roles. Backfill missing accounts as students.
insert into public.profiles(id,full_name,email,role) select id,coalesce(raw_user_meta_data->>'full_name',''),email,'student' from auth.users on conflict(id) do nothing;

create policy nexus_profiles_scope on public.profiles as restrictive for select to authenticated using (id=(select auth.uid()) or nexus_private.teaches(id));
create policy nexus_profiles_read on public.profiles for select to authenticated using (id=(select auth.uid()) or nexus_private.teaches(id));
create policy nexus_profiles_edit_scope on public.profiles as restrictive for update to authenticated using (id=(select auth.uid())) with check(id=(select auth.uid()));
create policy nexus_profiles_insert_scope on public.profiles as restrictive for insert to authenticated with check(id=(select auth.uid()) and role::text='student' and is_active);
create policy nexus_profiles_delete_scope on public.profiles as restrictive for delete to authenticated using(false);
revoke all on public.profiles from public,anon;
grant select on public.profiles to authenticated;

alter table public.nexus_classes enable row level security;
alter table public.nexus_memberships enable row level security;
alter table public.nexus_attempts enable row level security;
alter table public.nexus_drafts enable row level security;
alter table public.nexus_challenges enable row level security;
alter table public.nexus_custom_attempts enable row level security;

create policy classes_read on public.nexus_classes for select to authenticated using(teacher_id=(select auth.uid()) and nexus_private.has_role('teacher') or nexus_private.in_class(id));
create policy classes_create on public.nexus_classes for insert to authenticated with check(teacher_id=(select auth.uid()) and nexus_private.has_role('teacher'));
create policy classes_edit on public.nexus_classes for update to authenticated using(teacher_id=(select auth.uid()) and nexus_private.has_role('teacher')) with check(teacher_id=(select auth.uid()) and nexus_private.has_role('teacher'));
create policy members_read on public.nexus_memberships for select to authenticated using(student_id=(select auth.uid()) and nexus_private.has_role('student') or nexus_private.owns_class(class_id));
create policy members_remove on public.nexus_memberships for delete to authenticated using(nexus_private.owns_class(class_id));
create policy attempts_read on public.nexus_attempts for select to authenticated using(student_id=(select auth.uid()) and nexus_private.has_role('student') or nexus_private.teaches(student_id));
create policy drafts_read on public.nexus_drafts for select to authenticated using(student_id=(select auth.uid()) and nexus_private.has_role('student'));
create policy drafts_insert on public.nexus_drafts for insert to authenticated with check(student_id=(select auth.uid()) and nexus_private.has_role('student'));
create policy drafts_edit on public.nexus_drafts for update to authenticated using(student_id=(select auth.uid()) and nexus_private.has_role('student')) with check(student_id=(select auth.uid()) and nexus_private.has_role('student'));
create policy drafts_remove on public.nexus_drafts for delete to authenticated using(student_id=(select auth.uid()) and nexus_private.has_role('student'));
create policy questions_read on public.nexus_challenges for select to authenticated using(teacher_id=(select auth.uid()) and nexus_private.has_role('teacher'));
create policy questions_create on public.nexus_challenges for insert to authenticated with check(teacher_id=(select auth.uid()) and nexus_private.has_role('teacher') and (class_id is null or nexus_private.owns_class(class_id)));
create policy questions_edit on public.nexus_challenges for update to authenticated using(teacher_id=(select auth.uid()) and nexus_private.has_role('teacher')) with check(teacher_id=(select auth.uid()) and nexus_private.has_role('teacher') and (class_id is null or nexus_private.owns_class(class_id)));
create policy custom_attempts_read on public.nexus_custom_attempts for select to authenticated using(student_id=(select auth.uid()) and nexus_private.has_role('student') or nexus_private.teaches(student_id) and exists(select 1 from public.nexus_challenges q where q.id=challenge_id and q.teacher_id=(select auth.uid())));

revoke all on public.nexus_classes,public.nexus_memberships,public.nexus_attempts,public.nexus_drafts,public.nexus_challenges,public.nexus_custom_attempts from anon,authenticated;
grant select,insert on public.nexus_classes to authenticated;
grant update(name,archived) on public.nexus_classes to authenticated;
grant select,delete on public.nexus_memberships to authenticated;
grant select on public.nexus_attempts,public.nexus_custom_attempts to authenticated;
grant select,insert,update,delete on public.nexus_drafts to authenticated;
grant select,insert,update on public.nexus_challenges to authenticated;

create function nexus_private.join_class(p_code text) returns void language plpgsql security definer set search_path='' as $$
declare class_uuid uuid;
begin
  if not nexus_private.has_role('student') then raise exception 'Student access required'; end if;
  select id into class_uuid from public.nexus_classes where join_code=upper(trim(p_code)) and not archived;
  if class_uuid is null then raise exception 'Invalid class code'; end if;
  insert into public.nexus_memberships(class_id,student_id) values(class_uuid,auth.uid()) on conflict do nothing;
end; $$;
create function public.nexus_join_class(p_code text) returns void language sql security invoker set search_path='' as $$select nexus_private.join_class(p_code);$$;

create function nexus_private.roster() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
  if not nexus_private.has_role('teacher') then raise exception 'Teacher access required'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('class_id',c.id,'class_name',c.name,'student_id',p.id,'name',p.full_name)) from public.nexus_memberships m join public.nexus_classes c on c.id=m.class_id join public.profiles p on p.id=m.student_id where c.teacher_id=auth.uid()),'[]'::jsonb);
end; $$;
create function public.nexus_roster() returns jsonb language sql security invoker set search_path='' as $$select nexus_private.roster();$$;

create function nexus_private.submit_attempt(p_mission_id text,p_answers jsonb,p_request_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare catalog_row nexus_private.catalog%rowtype; result public.nexus_attempts%rowtype; score integer:=0; wrong jsonb:='[]'; expected numeric; response numeric; i integer; previous_id text;
begin
  if not nexus_private.has_role('student') then raise exception 'Student access required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
  select * into result from public.nexus_attempts where student_id=auth.uid() and request_id=p_request_id;
  if found then
    if result.mission_id<>p_mission_id then raise exception 'Request belongs to another mission'; end if;
    return to_jsonb(result);
  end if;
  select * into catalog_row from nexus_private.catalog where id=p_mission_id;
  if not found or jsonb_typeof(p_answers) is distinct from 'array' or jsonb_array_length(p_answers)<>jsonb_array_length(catalog_row.answers) then raise exception 'Invalid answers'; end if;
  select id into previous_id from nexus_private.catalog where position=catalog_row.position-1;
  if previous_id is not null and not exists(select 1 from public.nexus_attempts where student_id=auth.uid() and mission_id=previous_id and correct::numeric/total>=0.6) then raise exception 'Mission locked'; end if;
  for i in 0..jsonb_array_length(catalog_row.answers)-1 loop
    expected:=(catalog_row.answers->>i)::numeric;
    if jsonb_typeof(p_answers->i) is distinct from 'number' then raise exception 'Every answer must be numeric'; end if;
    response:=(p_answers->>i)::numeric;
    if abs(response-expected)<=0.000000001 then score:=score+1; else wrong:=wrong||jsonb_build_array(i); end if;
  end loop;
  insert into public.nexus_attempts(student_id,mission_id,correct,total,mistakes,request_id) values(auth.uid(),p_mission_id,score,jsonb_array_length(catalog_row.answers),wrong,p_request_id) returning * into result;
  delete from public.nexus_drafts where student_id=auth.uid() and mission_id=p_mission_id;
  return to_jsonb(result);
end; $$;
create function public.nexus_submit_attempt(p_mission_id text,p_answers jsonb,p_request_id uuid) returns jsonb language sql security invoker set search_path='' as $$select nexus_private.submit_attempt(p_mission_id,p_answers,p_request_id);$$;

create function nexus_private.assigned_challenges() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
  if not nexus_private.has_role('student') then raise exception 'Student access required'; end if;
  return coalesce((select jsonb_agg(to_jsonb(q)-'numeric_answer'-'explanation'-'teacher_id') from public.nexus_challenges q where nexus_private.in_class(q.class_id)),'[]'::jsonb);
end; $$;
create function public.nexus_assigned_challenges() returns jsonb language sql security invoker set search_path='' as $$select nexus_private.assigned_challenges();$$;
create function nexus_private.answer_challenge(p_id uuid,p_answer numeric,p_request_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare question public.nexus_challenges%rowtype; prior public.nexus_custom_attempts%rowtype; passed boolean;
begin
  if not nexus_private.has_role('student') then raise exception 'Student access required'; end if;
  select * into question from public.nexus_challenges where id=p_id;
  if not found or not nexus_private.in_class(question.class_id) then raise exception 'Challenge access denied'; end if;
  if p_answer is null or p_answer::text in ('NaN','Infinity','-Infinity') then raise exception 'Invalid answer'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
  select * into prior from public.nexus_custom_attempts where student_id=auth.uid() and request_id=p_request_id;
  if found then
    if prior.challenge_id<>p_id then raise exception 'Request belongs to another challenge'; end if;
    passed:=prior.correct;
  else
    passed:=abs(p_answer-question.numeric_answer)<=0.000000001;
    insert into public.nexus_custom_attempts(challenge_id,student_id,correct,request_id) values(p_id,auth.uid(),passed,p_request_id);
  end if;
  return jsonb_build_object('correct',passed,'explanation',question.explanation);
end; $$;
create function public.nexus_answer_challenge(p_id uuid,p_answer numeric,p_request_id uuid) returns jsonb language sql security invoker set search_path='' as $$select nexus_private.answer_challenge(p_id,p_answer,p_request_id);$$;

revoke all on all functions in schema nexus_private from public,anon,authenticated;
grant execute on function nexus_private.has_role(text),nexus_private.owns_class(uuid),nexus_private.in_class(uuid),nexus_private.teaches(uuid),nexus_private.join_class(text),nexus_private.roster(),nexus_private.submit_attempt(text,jsonb,uuid),nexus_private.assigned_challenges(),nexus_private.answer_challenge(uuid,numeric,uuid) to authenticated;
revoke all on function public.nexus_join_class(text),public.nexus_roster(),public.nexus_submit_attempt(text,jsonb,uuid),public.nexus_assigned_challenges(),public.nexus_answer_challenge(uuid,numeric,uuid) from public,anon;
grant execute on function public.nexus_join_class(text),public.nexus_roster(),public.nexus_submit_attempt(text,jsonb,uuid),public.nexus_assigned_challenges(),public.nexus_answer_challenge(uuid,numeric,uuid) to authenticated;
