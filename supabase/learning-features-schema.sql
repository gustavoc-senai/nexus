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
