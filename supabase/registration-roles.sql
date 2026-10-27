-- Incremental update: allow students and teachers to choose their role at signup only.
BEGIN;
create or replace function nexus_private.new_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,full_name,email,phone,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email,new.raw_user_meta_data->>'phone',
    case when new.raw_user_meta_data->>'signup_role'='teacher' then 'teacher' else 'student' end)
  on conflict(id) do nothing;
  return new;
end; $$;
revoke all on function nexus_private.new_profile() from public,anon,authenticated;
COMMIT;