-- Additive: preserve 0001–0004 and existing transaction history.
create extension if not exists btree_gist with schema extensions;
alter table public.clients add column vip boolean not null default false;
alter table public.payments add column refunded_at timestamptz;
alter table public.payments add column idempotency_key uuid unique default gen_random_uuid();

alter table public.branches add constraint branches_tenant_key unique (organization_id,id);
alter table public.clients add constraint clients_tenant_key unique (organization_id,id);
alter table public.services add constraint services_tenant_key unique (organization_id,id);
alter table public.staff add constraint staff_tenant_key unique (organization_id,id);
alter table public.appointments add constraint appointments_tenant_key unique (organization_id,id);
alter table public.staff add constraint staff_branch_tenant foreign key (organization_id,branch_id) references public.branches(organization_id,id);
alter table public.staff add constraint staff_member_tenant foreign key (organization_id,user_id) references public.organization_members(organization_id,user_id);
alter table public.appointments add constraint appointments_branch_tenant foreign key (organization_id,branch_id) references public.branches(organization_id,id);
alter table public.appointments add constraint appointments_client_tenant foreign key (organization_id,client_id) references public.clients(organization_id,id);
alter table public.appointments add constraint appointments_service_tenant foreign key (organization_id,service_id) references public.services(organization_id,id);
alter table public.appointments add constraint appointments_staff_tenant foreign key (organization_id,staff_id) references public.staff(organization_id,id);
alter table public.appointments add constraint appointments_actor_tenant foreign key (organization_id,created_by) references public.organization_members(organization_id,user_id);
alter table public.payments add constraint payments_appointment_tenant foreign key (organization_id,appointment_id) references public.appointments(organization_id,id);
alter table public.appointments add constraint no_staff_overlap exclude using gist (staff_id with =, tstzrange(starts_at,ends_at,'[)') with &&) where (status not in ('cancelled','no_show'));

create table public.staff_schedules (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 staff_id uuid not null,
 work_date date not null,
 starts_local time not null,
 ends_local time not null,
 unique(staff_id,work_date),
 check(ends_local > starts_local),
 foreign key(organization_id,staff_id) references public.staff(organization_id,id)
);
create index staff_schedules_org_date_idx on public.staff_schedules(organization_id,work_date);
create table public.staff_services (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 staff_id uuid not null,
 service_id uuid not null,
 unique(staff_id,service_id),
 foreign key(organization_id,staff_id) references public.staff(organization_id,id),
 foreign key(organization_id,service_id) references public.services(organization_id,id)
);
create index staff_services_org_idx on public.staff_services(organization_id);
create index staff_services_service_idx on public.staff_services(service_id);
create index payments_org_paid_idx on public.payments(organization_id,paid_at);
create index payments_org_refunded_idx on public.payments(organization_id,refunded_at) where refunded_at is not null;

alter table public.staff_schedules enable row level security;
alter table public.staff_services enable row level security;
revoke all on public.staff_schedules,public.staff_services from anon;
grant select,insert,update,delete on public.staff_schedules,public.staff_services to authenticated,service_role;
create policy "members read schedules" on public.staff_schedules for select to authenticated using ((select private.is_org_member(organization_id)));
create policy "operators insert schedules" on public.staff_schedules for insert to authenticated with check ((select private.is_org_member(organization_id,array['owner','admin']::public.member_role[])));
create policy "operators update schedules" on public.staff_schedules for update to authenticated using ((select private.is_org_member(organization_id,array['owner','admin']::public.member_role[]))) with check ((select private.is_org_member(organization_id,array['owner','admin']::public.member_role[])));
create policy "operators delete schedules" on public.staff_schedules for delete to authenticated using ((select private.is_org_member(organization_id,array['owner','admin']::public.member_role[])));
create policy "members read assignments" on public.staff_services for select to authenticated using ((select private.is_org_member(organization_id)));
create policy "operators insert assignments" on public.staff_services for insert to authenticated with check ((select private.is_org_member(organization_id,array['owner','admin']::public.member_role[])));
create policy "operators update assignments" on public.staff_services for update to authenticated using ((select private.is_org_member(organization_id,array['owner','admin']::public.member_role[]))) with check ((select private.is_org_member(organization_id,array['owner','admin']::public.member_role[])));
create policy "operators delete assignments" on public.staff_services for delete to authenticated using ((select private.is_org_member(organization_id,array['owner','admin']::public.member_role[])));

-- Specialist has no unrestricted CRM access or appointment editing privileges.
drop policy "members read clients" on public.clients;
create policy "operators read clients" on public.clients for select to authenticated using ((select private.is_org_member(organization_id,array['owner','admin']::public.member_role[])));
drop policy "members read appointments" on public.appointments;
create policy "authorized read appointments" on public.appointments for select to authenticated using (
 (select private.is_org_member(organization_id,array['owner','admin']::public.member_role[])) or
 ((select private.is_org_member(organization_id)) and exists(select 1 from public.staff s where s.id=staff_id and s.user_id=(select private.current_app_user_id())))
);
drop policy "authorized users update appointments" on public.appointments;
create policy "operators update appointments" on public.appointments for update to authenticated using ((select private.is_org_member(organization_id,array['owner','admin']::public.member_role[]))) with check ((select private.is_org_member(organization_id,array['owner','admin']::public.member_role[])));

create or replace function public.onboard_salon(telegram_id bigint,salon_name text,branch_name text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare actor_id uuid; org_id uuid;
begin
 if char_length(trim(salon_name)) not between 2 and 80 or char_length(trim(branch_name)) not between 2 and 80 then raise exception 'invalid_name'; end if;
 select id into actor_id from public.app_users where telegram_user_id=telegram_id for update;
 if actor_id is null then raise exception 'identity_missing'; end if;
 select organization_id into org_id from public.organization_members where user_id=actor_id order by created_at limit 1;
 if org_id is not null then return org_id; end if;
 org_id:=gen_random_uuid();
 insert into public.organizations(id,name,slug) values(org_id,trim(salon_name),'salon-'||org_id);
 insert into public.organization_members values(org_id,actor_id,'owner',now());
 insert into public.branches(organization_id,name) values(org_id,trim(branch_name));
 return org_id;
end $$;
revoke all on function public.onboard_salon(bigint,text,text) from public,anon,authenticated;
grant execute on function public.onboard_salon(bigint,text,text) to service_role;

create or replace function private.appointment_guard()
returns trigger language plpgsql security invoker set search_path='' as $$
declare tz text; shift public.staff_schedules; local_start timestamp; local_end timestamp;
begin
 if TG_OP='UPDATE' then
  if new.organization_id<>old.organization_id then raise exception 'tenant_immutable'; end if;
  if old.status in ('completed','cancelled','no_show') and new is distinct from old then raise exception 'terminal_appointment'; end if;
  if new.status<>old.status and not (
   (old.status='pending' and new.status in ('confirmed','cancelled','no_show')) or
   (old.status='confirmed' and new.status in ('checked_in','cancelled','no_show')) or
   (old.status='checked_in' and new.status in ('completed','cancelled'))
  ) then raise exception 'invalid_status_transition'; end if;
 end if;
 if TG_OP='INSERT' and new.status<>'pending' then raise exception 'initial_status_pending'; end if;
 if TG_OP='INSERT' or (new.starts_at,new.ends_at,new.staff_id,new.service_id,new.client_id,new.branch_id) is distinct from (old.starts_at,old.ends_at,old.staff_id,old.service_id,old.client_id,old.branch_id) then
  if not exists(select 1 from public.clients where id=new.client_id and organization_id=new.organization_id and archived_at is null) then raise exception 'client_unavailable'; end if;
  if not exists(select 1 from public.branches where id=new.branch_id and organization_id=new.organization_id and archived_at is null) then raise exception 'branch_unavailable'; end if;
  if not exists(select 1 from public.staff where id=new.staff_id and organization_id=new.organization_id and branch_id=new.branch_id and active and archived_at is null) then raise exception 'staff_unavailable'; end if;
  if not exists(select 1 from public.services where id=new.service_id and organization_id=new.organization_id and active and archived_at is null) then raise exception 'service_unavailable'; end if;
  if not exists(select 1 from public.staff_services where staff_id=new.staff_id and service_id=new.service_id and organization_id=new.organization_id) then raise exception 'service_not_assigned'; end if;
  select timezone into tz from public.organizations where id=new.organization_id;
  local_start:=new.starts_at at time zone tz; local_end:=new.ends_at at time zone tz;
  select * into shift from public.staff_schedules where staff_id=new.staff_id and work_date=local_start::date for share;
  if shift.id is null or local_start::date<>local_end::date or local_start::time<shift.starts_local or local_end::time>shift.ends_local then raise exception 'outside_schedule'; end if;
 end if;
 new.updated_at:=clock_timestamp();
 return new;
end $$;
create trigger appointment_guard before insert or update on public.appointments for each row execute function private.appointment_guard();

create or replace function private.payment_guard()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  if (new.organization_id,new.appointment_id,new.amount_minor,new.idempotency_key) is distinct from (old.organization_id,old.appointment_id,old.amount_minor,old.idempotency_key) then raise exception 'payment_identity_immutable'; end if;
  if new.status<>old.status and not ((old.status='pending' and new.status in ('paid','void')) or (old.status='paid' and new.status='refunded')) then raise exception 'invalid_payment_transition'; end if;
  new.paid_at:=old.paid_at; new.refunded_at:=old.refunded_at;
 else
  if new.status not in ('pending','paid') then raise exception 'invalid_initial_payment'; end if;
  new.paid_at:=null; new.refunded_at:=null;
 end if;
 if new.status='paid' and new.paid_at is null then new.paid_at:=now(); end if;
 if new.status='refunded' and new.refunded_at is null then new.refunded_at:=now(); end if;
 return new;
end $$;
create trigger payment_guard before insert or update on public.payments for each row execute function private.payment_guard();

create or replace function private.protect_owner()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 perform 1 from public.organizations where id=old.organization_id for update;
 if TG_OP='UPDATE' and (new.organization_id,new.user_id) is distinct from (old.organization_id,old.user_id) then raise exception 'membership_identity_immutable'; end if;
 if old.role='owner' and (TG_OP='DELETE' or new.role<>'owner') and not exists(select 1 from public.organization_members where organization_id=old.organization_id and role='owner' and user_id<>old.user_id) then raise exception 'last_owner'; end if;
 if TG_OP='DELETE' then return old; end if;
 return new;
end $$;
create trigger protect_owner before update or delete on public.organization_members for each row execute function private.protect_owner();

-- Historical accounting rows and appointment history cannot be deleted by API actors.
revoke delete on public.payments,public.appointments from authenticated;
revoke all on function private.appointment_guard(),private.payment_guard(),private.protect_owner() from public,anon,authenticated;
