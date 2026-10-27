-- Incremental update for existing Nexus installations.
BEGIN;
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
COMMIT;