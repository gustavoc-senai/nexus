-- Incremental update for an existing Nexus installation.
BEGIN;
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
COMMIT;