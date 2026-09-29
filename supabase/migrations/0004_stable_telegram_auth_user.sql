alter table private.app_users set schema public;

drop table if exists private.app_sessions;

alter table public.app_users
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade;

alter table public.app_users enable row level security;

revoke all on table public.app_users from anon, authenticated;
grant select, insert, update, delete on table public.app_users to service_role;

create or replace function private.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public, private
as $$
  select u.id
  from public.app_users u
  where u.auth_user_id = (select auth.uid())
  limit 1;
$$;

revoke all on function private.current_app_user_id() from public, anon;
grant execute on function private.current_app_user_id() to authenticated;
