create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_org_member(
  target_org uuid,
  allowed_roles public.member_role[] default null
)
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
      and m.user_id = (select auth.uid())
      and (allowed_roles is null or m.role = any(allowed_roles))
  );
$$;

revoke all on function private.is_org_member(uuid, public.member_role[]) from public, anon;
grant execute on function private.is_org_member(uuid, public.member_role[]) to authenticated;

drop policy if exists "members can read organizations" on public.organizations;
drop policy if exists "owners can update organizations" on public.organizations;
drop policy if exists "members can read memberships" on public.organization_members;
drop policy if exists "owners manage memberships" on public.organization_members;
drop policy if exists "members read branches" on public.branches;
drop policy if exists "operators manage branches" on public.branches;
drop policy if exists "members read staff" on public.staff;
drop policy if exists "operators manage staff" on public.staff;
drop policy if exists "members read clients" on public.clients;
drop policy if exists "operators manage clients" on public.clients;
drop policy if exists "members read services" on public.services;
drop policy if exists "operators manage services" on public.services;
drop policy if exists "members read appointments" on public.appointments;
drop policy if exists "operators manage appointments" on public.appointments;
drop policy if exists "specialists update own appointments" on public.appointments;
drop policy if exists "operators read payments" on public.payments;
drop policy if exists "operators manage payments" on public.payments;

create policy "members can read organizations"
on public.organizations for select to authenticated
using ((select private.is_org_member(id)));

create policy "owners can update organizations"
on public.organizations for update to authenticated
using ((select private.is_org_member(id, array['owner']::public.member_role[])))
with check ((select private.is_org_member(id, array['owner']::public.member_role[])));

create policy "members can read memberships"
on public.organization_members for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy "owners can insert memberships"
on public.organization_members for insert to authenticated
with check ((select private.is_org_member(organization_id, array['owner']::public.member_role[])));

create policy "owners can update memberships"
on public.organization_members for update to authenticated
using ((select private.is_org_member(organization_id, array['owner']::public.member_role[])))
with check ((select private.is_org_member(organization_id, array['owner']::public.member_role[])));

create policy "owners can delete memberships"
on public.organization_members for delete to authenticated
using ((select private.is_org_member(organization_id, array['owner']::public.member_role[])));

create policy "members read branches"
on public.branches for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy "operators insert branches"
on public.branches for insert to authenticated
with check ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators update branches"
on public.branches for update to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])))
with check ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators delete branches"
on public.branches for delete to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "members read staff"
on public.staff for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy "operators insert staff"
on public.staff for insert to authenticated
with check ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators update staff"
on public.staff for update to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])))
with check ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators delete staff"
on public.staff for delete to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "members read clients"
on public.clients for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy "operators insert clients"
on public.clients for insert to authenticated
with check ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators update clients"
on public.clients for update to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])))
with check ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators delete clients"
on public.clients for delete to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "members read services"
on public.services for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy "operators insert services"
on public.services for insert to authenticated
with check ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators update services"
on public.services for update to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])))
with check ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators delete services"
on public.services for delete to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "members read appointments"
on public.appointments for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy "operators insert appointments"
on public.appointments for insert to authenticated
with check ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "authorized users update appointments"
on public.appointments for update to authenticated
using (
  (select private.is_org_member(organization_id, array['owner','admin']::public.member_role[]))
  or (
    (select private.is_org_member(organization_id, array['specialist']::public.member_role[]))
    and exists (
      select 1 from public.staff s
      where s.id = staff_id and s.user_id = (select auth.uid())
    )
  )
)
with check (
  (select private.is_org_member(organization_id, array['owner','admin']::public.member_role[]))
  or (
    (select private.is_org_member(organization_id, array['specialist']::public.member_role[]))
    and exists (
      select 1 from public.staff s
      where s.id = staff_id and s.user_id = (select auth.uid())
    )
  )
);

create policy "operators delete appointments"
on public.appointments for delete to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators read payments"
on public.payments for select to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators insert payments"
on public.payments for insert to authenticated
with check ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators update payments"
on public.payments for update to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])))
with check ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

create policy "operators delete payments"
on public.payments for delete to authenticated
using ((select private.is_org_member(organization_id, array['owner','admin']::public.member_role[])));

drop function if exists public.is_org_member(uuid, public.member_role[]);

create index if not exists branches_org_idx on public.branches(organization_id);
create index if not exists org_members_user_idx on public.organization_members(user_id);
create index if not exists staff_org_idx on public.staff(organization_id);
create index if not exists staff_branch_idx on public.staff(branch_id);
create index if not exists staff_user_idx on public.staff(user_id);
create index if not exists services_org_idx on public.services(organization_id);
create index if not exists appointments_branch_idx on public.appointments(branch_id);
create index if not exists appointments_client_idx on public.appointments(client_id);
create index if not exists appointments_service_idx on public.appointments(service_id);
create index if not exists appointments_created_by_idx on public.appointments(created_by);
create index if not exists payments_org_idx on public.payments(organization_id);
create index if not exists payments_appointment_idx on public.payments(appointment_id);
