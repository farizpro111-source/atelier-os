create extension if not exists "pgcrypto";

create type public.member_role as enum ('owner','admin','specialist');
create type public.appointment_status as enum ('pending','confirmed','checked_in','completed','cancelled','no_show');
create type public.payment_status as enum ('pending','paid','refunded','void');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'Asia/Almaty',
  currency text not null default 'KZT',
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'specialist',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  timezone text not null default 'Asia/Almaty',
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  title text,
  phone text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  notes text,
  birth_date date,
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create index clients_org_phone_idx on public.clients(organization_id, phone);
create index clients_org_name_idx on public.clients(organization_id, full_name);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  category text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_minor bigint not null check (price_minor >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  staff_id uuid not null references public.staff(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  notes text,
  price_minor bigint not null check (price_minor >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_time_valid check (ends_at > starts_at)
);

create index appointments_org_start_idx on public.appointments(organization_id, starts_at);
create index appointments_staff_start_idx on public.appointments(staff_id, starts_at);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  amount_minor bigint not null check (amount_minor >= 0),
  status public.payment_status not null default 'pending',
  method text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.is_org_member(target_org uuid, allowed_roles public.member_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = target_org
      and m.user_id = auth.uid()
      and (allowed_roles is null or m.role = any(allowed_roles))
  );
$$;

revoke all on function public.is_org_member(uuid, public.member_role[]) from public;
grant execute on function public.is_org_member(uuid, public.member_role[]) to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.branches enable row level security;
alter table public.staff enable row level security;
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;

create policy "members can read organizations"
on public.organizations for select to authenticated
using (public.is_org_member(id));

create policy "owners can update organizations"
on public.organizations for update to authenticated
using (public.is_org_member(id, array['owner']::public.member_role[]))
with check (public.is_org_member(id, array['owner']::public.member_role[]));

create policy "members can read memberships"
on public.organization_members for select to authenticated
using (public.is_org_member(organization_id));

create policy "owners manage memberships"
on public.organization_members for all to authenticated
using (public.is_org_member(organization_id, array['owner']::public.member_role[]))
with check (public.is_org_member(organization_id, array['owner']::public.member_role[]));

create policy "members read branches"
on public.branches for select to authenticated
using (public.is_org_member(organization_id));

create policy "operators manage branches"
on public.branches for all to authenticated
using (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]))
with check (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]));

create policy "members read staff"
on public.staff for select to authenticated
using (public.is_org_member(organization_id));

create policy "operators manage staff"
on public.staff for all to authenticated
using (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]))
with check (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]));

create policy "members read clients"
on public.clients for select to authenticated
using (public.is_org_member(organization_id));

create policy "operators manage clients"
on public.clients for all to authenticated
using (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]))
with check (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]));

create policy "members read services"
on public.services for select to authenticated
using (public.is_org_member(organization_id));

create policy "operators manage services"
on public.services for all to authenticated
using (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]))
with check (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]));

create policy "members read appointments"
on public.appointments for select to authenticated
using (public.is_org_member(organization_id));

create policy "operators manage appointments"
on public.appointments for all to authenticated
using (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]))
with check (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]));

create policy "specialists update own appointments"
on public.appointments for update to authenticated
using (
  public.is_org_member(organization_id, array['specialist']::public.member_role[])
  and exists (select 1 from public.staff s where s.id = staff_id and s.user_id = auth.uid())
)
with check (
  public.is_org_member(organization_id, array['specialist']::public.member_role[])
  and exists (select 1 from public.staff s where s.id = staff_id and s.user_id = auth.uid())
);

create policy "operators read payments"
on public.payments for select to authenticated
using (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]));

create policy "operators manage payments"
on public.payments for all to authenticated
using (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]))
with check (public.is_org_member(organization_id, array['owner','admin']::public.member_role[]));
