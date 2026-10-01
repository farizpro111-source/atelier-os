-- Additive operational invariants; previously applied migrations are unchanged.
create or replace function private.payment_balance_guard()
returns trigger language plpgsql security invoker set search_path='' as $$
declare target public.appointments; committed bigint;
begin
 if new.appointment_id is null then raise exception 'payment_appointment_required'; end if;
 select * into target from public.appointments where id=new.appointment_id and organization_id=new.organization_id for update;
 if target.id is null then raise exception 'payment_appointment_required'; end if;
 if new.status in ('pending','paid') then
  if target.status in ('cancelled','no_show') then raise exception 'appointment_not_payable'; end if;
  select coalesce(sum(amount_minor),0) into committed from public.payments where appointment_id=new.appointment_id and id<>new.id and status in ('pending','paid');
  if new.amount_minor<=0 or committed+new.amount_minor>target.price_minor then raise exception 'payment_exceeds_balance'; end if;
 end if;
 return new;
end $$;
create trigger payment_balance_guard before insert or update on public.payments for each row execute function private.payment_balance_guard();
revoke all on function private.payment_balance_guard() from public,anon,authenticated;

-- Lock the staff row on both shift and booking writes to serialize schedule changes.
create or replace function private.schedule_guard()
returns trigger language plpgsql security invoker set search_path='' as $$
declare tz text;
begin
 if TG_OP='UPDATE' and (new.staff_id,new.organization_id,new.work_date) is distinct from (old.staff_id,old.organization_id,old.work_date) then raise exception 'schedule_identity_immutable'; end if;
 perform 1 from public.staff where id=new.staff_id and organization_id=new.organization_id for update;
 select timezone into tz from public.organizations where id=new.organization_id;
 if exists(select 1 from public.appointments a where a.staff_id=new.staff_id and a.status not in ('cancelled','no_show') and (a.starts_at at time zone tz)::date=new.work_date and ((a.starts_at at time zone tz)::time<new.starts_local or (a.ends_at at time zone tz)::time>new.ends_local)) then raise exception 'schedule_conflict'; end if;
 return new;
end $$;
create trigger schedule_guard before insert or update on public.staff_schedules for each row execute function private.schedule_guard();
revoke all on function private.schedule_guard() from public,anon,authenticated;

create or replace function private.appointment_lock_guard()
returns trigger language plpgsql security invoker set search_path='' as $$
declare committed bigint;
begin
 perform 1 from public.staff where id=new.staff_id and organization_id=new.organization_id for update;
 if TG_OP='UPDATE' then
  select coalesce(sum(amount_minor),0) into committed from public.payments where appointment_id=old.id and status in ('pending','paid');
  if new.price_minor<committed then raise exception 'payment_exceeds_balance'; end if;
  if new.status in ('cancelled','no_show') and committed>0 then raise exception 'refund_or_void_before_cancel'; end if;
 end if;
 return new;
end $$;
create trigger a_appointment_lock_guard before insert or update on public.appointments for each row execute function private.appointment_lock_guard();
revoke all on function private.appointment_lock_guard() from public,anon,authenticated;
