create table if not exists private.app_users (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint not null unique,
  first_name text,
  last_name text,
  username text,
  photo_url text,
  language_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists private.app_sessions (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  app_user_id uuid not null references private.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists app_sessions_app_user_idx
on private.app_sessions(app_user_id);

alter table public.organization_members
  drop constraint if exists organization_members_user_id_fkey;

alter table public.organization_members
  add constraint organization_members_user_id_fkey
  foreign key (user_id) references private.app_users(id) on delete cascade;

alter table public.staff
  drop constraint if exists staff_user_id_fkey;

alter table public.staff
  add constraint staff_user_id_fkey
  foreign key (user_id) references private.app_users(id) on delete set null;

alter table public.appointments
  drop constraint if exists appointments_created_by_fkey;

alter table public.appointments
  add constraint appointments_created_by_fkey
  foreign key (created_by) references private.app_users(id) on delete set null;

create or replace function private.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public, private
as $$
  select s.app_user_id
  from private.app_sessions s
  where s.auth_user_id = (select auth.uid())
  limit 1;
$$;

revoke all on function private.current_app_user_id() from public, anon;
grant execute on function private.current_app_user_id() to authenticated;

create or replace function private.is_org_member(
  target_org uuid,
  allowed_roles public.member_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = target_org
      and m.user_id = (select private.current_app_user_id())
      and (allowed_roles is null or m.role = any(allowed_roles))
  );
$$;

revoke all on function private.is_org_member(uuid, public.member_role[]) from public, anon;
grant execute on function private.is_org_member(uuid, public.member_role[]) to authenticated;

drop policy if exists "authorized users update appointments" on public.appointments;

create policy "authorized users update appointments"
on public.appointments for update to authenticated
using (
  (select private.is_org_member(organization_id, array['owner','admin']::public.member_role[]))
  or (
    (select private.is_org_member(organization_id, array['specialist']::public.member_role[]))
    and exists (
      select 1
      from public.staff s
      where s.id = staff_id
        and s.user_id = (select private.current_app_user_id())
    )
  )
)
with check (
  (select private.is_org_member(organization_id, array['owner','admin']::public.member_role[]))
  or (
    (select private.is_org_member(organization_id, array['specialist']::public.member_role[]))
    and exists (
      select 1
      from public.staff s
      where s.id = staff_id
        and s.user_id = (select private.current_app_user_id())
    )
  )
);
