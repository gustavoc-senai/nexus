-- Incremental update for projects where the initial Nexus setup is already installed.
begin;
create or replace function nexus_private.join_class(p_code text) returns void language plpgsql security definer set search_path='' as $$
declare class_uuid uuid;
begin
  if not nexus_private.has_role('student') then raise exception 'Student access required'; end if;
  select c.id into class_uuid from public.nexus_classes c join public.profiles p on p.id=c.teacher_id
  where c.join_code=upper(trim(p_code)) and not c.archived and p.is_active and p.role::text in ('teacher','admin');
  if class_uuid is null then raise exception 'Invalid class code'; end if;
  insert into public.nexus_memberships(class_id,student_id) values(class_uuid,auth.uid()) on conflict do nothing;
end; $$;
create or replace function nexus_private.find_class(p_code text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
  if not nexus_private.has_role('student') then raise exception 'Student access required'; end if;
  if upper(trim(p_code)) !~ '^[A-F0-9]{12}$' then raise exception 'Invalid class code'; end if;
  select jsonb_build_object('id',c.id,'name',c.name,'teacher_name',p.full_name,'already_member',exists(select 1 from public.nexus_memberships m where m.class_id=c.id and m.student_id=auth.uid())) into result
  from public.nexus_classes c join public.profiles p on p.id=c.teacher_id
  where c.join_code=upper(trim(p_code)) and not c.archived and p.is_active and p.role::text in ('teacher','admin');
  if result is null then raise exception 'Class unavailable'; end if;
  return result;
end; $$;
create or replace function public.nexus_find_class(p_code text) returns jsonb language sql security invoker set search_path='' as $$select nexus_private.find_class(p_code);$$;
revoke all on function nexus_private.find_class(text) from public,anon;
revoke all on function public.nexus_find_class(text) from public,anon;
grant execute on function nexus_private.find_class(text),public.nexus_find_class(text) to authenticated;
commit;
