-- New migration only. Preserve all previously applied migration bytes.
create or replace function private.organization_settings_guard()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=new.timezone) then raise exception 'invalid_timezone'; end if;
 if new.currency is distinct from old.currency then raise exception 'accounting_currency_immutable'; end if;
 if new.timezone is distinct from old.timezone and (
   exists(select 1 from public.staff_schedules where organization_id=old.id) or
   exists(select 1 from public.appointments where organization_id=old.id)
 ) then raise exception 'timezone_has_operations'; end if;
 return new;
end $$;
create trigger organization_settings_guard before update on public.organizations for each row execute function private.organization_settings_guard();
revoke all on function private.organization_settings_guard() from public,anon,authenticated;

-- The REST Data API must enforce the same owner-only account-link rule as Next.js.
create or replace function private.staff_account_guard()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if current_user='authenticated' and
   ((TG_OP='INSERT' and new.user_id is not null) or (TG_OP='UPDATE' and new.user_id is distinct from old.user_id)) and
   not private.is_org_member(new.organization_id,array['owner']::public.member_role[]) then
   raise exception 'owner_required_for_account_link';
 end if;
 return new;
end $$;
create trigger staff_account_guard before insert or update on public.staff for each row execute function private.staff_account_guard();
revoke all on function private.staff_account_guard() from public,anon,authenticated;

alter policy "operators insert branches" on public.branches with check ((select private.is_org_member(organization_id,array['owner']::public.member_role[])));
alter policy "operators update branches" on public.branches using ((select private.is_org_member(organization_id,array['owner']::public.member_role[]))) with check ((select private.is_org_member(organization_id,array['owner']::public.member_role[])));
alter policy "operators delete branches" on public.branches using ((select private.is_org_member(organization_id,array['owner']::public.member_role[])));
