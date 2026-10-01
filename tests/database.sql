-- Executes only in a rolled-back transaction. No permanent test users or business data.
begin;
create temporary table qa_results (test text, passed boolean);
grant all on qa_results to authenticated;
create function pg_temp.check_result(label text, ok boolean) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'QA FAILED: %',label; end if; insert into qa_results values(label,true); end $$;
create function pg_temp.must_fail(label text, statement text, expected text) returns void language plpgsql as $$
declare failed boolean:=false;
begin
 begin execute statement; exception when others then
   if sqlerrm not like '%'||expected||'%' then raise exception 'Unexpected failure for %: %',label,sqlerrm; end if;
   failed:=true;
 end;
 perform pg_temp.check_result(label,failed);
end $$;
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000001'),('10000000-0000-4000-8000-000000000002');
insert into public.app_users(id,telegram_user_id,first_name,auth_user_id) values
('20000000-0000-4000-8000-000000000001',-930000001,'QA Owner','10000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000002',-930000002,'QA Specialist','10000000-0000-4000-8000-000000000002');
select set_config('qa.org',public.onboard_salon(-930000001,'QA isolated salon','QA branch')::text,true);
select pg_temp.check_result('atomic onboarding is idempotent',public.onboard_salon(-930000001,'QA duplicate','QA branch')::text=current_setting('qa.org'));
select pg_temp.check_result('onboarding creates one branch',(select count(*)=1 from public.branches where organization_id=current_setting('qa.org')::uuid));
select set_config('qa.branch',(select id::text from public.branches where organization_id=current_setting('qa.org')::uuid),true);
insert into public.organizations(id,name,slug) values ('30000000-0000-4000-8000-000000000002','QA other tenant','qa-rollback-other-930');
insert into public.organization_members(organization_id,user_id,role) values(current_setting('qa.org')::uuid,'20000000-0000-4000-8000-000000000002','specialist');
insert into public.clients(id,organization_id,full_name) values
('40000000-0000-4000-8000-000000000001',current_setting('qa.org')::uuid,'QA client'),
('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','QA other client');
insert into public.services(id,organization_id,name,duration_minutes,price_minor) values('50000000-0000-4000-8000-000000000001',current_setting('qa.org')::uuid,'QA service',60,10000);
insert into public.staff(id,organization_id,branch_id,user_id,display_name) values('60000000-0000-4000-8000-000000000001',current_setting('qa.org')::uuid,current_setting('qa.branch')::uuid,'20000000-0000-4000-8000-000000000002','QA staff');
insert into public.staff_services(organization_id,staff_id,service_id) values(current_setting('qa.org')::uuid,'60000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001');
insert into public.staff_schedules(organization_id,staff_id,work_date,starts_local,ends_local) values(current_setting('qa.org')::uuid,'60000000-0000-4000-8000-000000000001','2026-10-01','09:00','18:00');
insert into public.appointments(id,organization_id,branch_id,client_id,staff_id,service_id,starts_at,ends_at,price_minor) values('70000000-0000-4000-8000-000000000001',current_setting('qa.org')::uuid,current_setting('qa.branch')::uuid,'40000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','2026-10-01 05:00Z','2026-10-01 06:00Z',10000);
select pg_temp.must_fail('overlap blocked',$q$insert into public.appointments(organization_id,branch_id,client_id,staff_id,service_id,starts_at,ends_at,price_minor) select organization_id,branch_id,client_id,staff_id,service_id,'2026-10-01 05:30Z','2026-10-01 06:30Z',10000 from public.appointments where id='70000000-0000-4000-8000-000000000001'$q$,'no_staff_overlap');
insert into public.appointments(id,organization_id,branch_id,client_id,staff_id,service_id,starts_at,ends_at,price_minor) select '70000000-0000-4000-8000-000000000002',organization_id,branch_id,client_id,staff_id,service_id,'2026-10-01 06:00Z','2026-10-01 07:00Z',10000 from public.appointments where id='70000000-0000-4000-8000-000000000001';
select pg_temp.check_result('adjacent appointment allowed',(select count(*)=2 from public.appointments where organization_id=current_setting('qa.org')::uuid));
select pg_temp.must_fail('cross-tenant relation blocked',$q$update public.appointments set client_id='40000000-0000-4000-8000-000000000002' where id='70000000-0000-4000-8000-000000000001'$q$,'client_unavailable');
select pg_temp.must_fail('schedule shrink blocked',$q$update public.staff_schedules set starts_local='11:00' where staff_id='60000000-0000-4000-8000-000000000001'$q$,'schedule_conflict');
update public.appointments set starts_at='2026-10-01 07:00Z',ends_at='2026-10-01 08:00Z' where id='70000000-0000-4000-8000-000000000002';
select pg_temp.check_result('appointment rescheduled',(select starts_at='2026-10-01 07:00Z' from public.appointments where id='70000000-0000-4000-8000-000000000002'));
update public.appointments set status='cancelled' where id='70000000-0000-4000-8000-000000000002';
select pg_temp.must_fail('terminal status immutable',$q$update public.appointments set status='confirmed' where id='70000000-0000-4000-8000-000000000002'$q$,'terminal_appointment');
insert into public.payments(id,organization_id,appointment_id,amount_minor,status,method) values('80000000-0000-4000-8000-000000000001',current_setting('qa.org')::uuid,'70000000-0000-4000-8000-000000000001',10000,'paid','cash');
select pg_temp.check_result('payment timestamp recorded',(select paid_at is not null from public.payments where id='80000000-0000-4000-8000-000000000001'));
select pg_temp.must_fail('overpayment blocked',$q$insert into public.payments(organization_id,appointment_id,amount_minor,status) values(current_setting('qa.org')::uuid,'70000000-0000-4000-8000-000000000001',1,'paid')$q$,'payment_exceeds_balance');
update public.payments set status='refunded' where id='80000000-0000-4000-8000-000000000001';
select pg_temp.check_result('refund preserves payment timestamp',(select paid_at is not null and refunded_at is not null from public.payments where id='80000000-0000-4000-8000-000000000001'));
select pg_temp.must_fail('lifecycle cannot skip check-in',$q$update public.appointments set status='completed' where id='70000000-0000-4000-8000-000000000001'$q$,'invalid_status_transition');
update public.appointments set status='confirmed' where id='70000000-0000-4000-8000-000000000001';
update public.appointments set status='checked_in' where id='70000000-0000-4000-8000-000000000001';
update public.appointments set status='completed' where id='70000000-0000-4000-8000-000000000001';
select pg_temp.check_result('full appointment lifecycle persists',(select status='completed' from public.appointments where id='70000000-0000-4000-8000-000000000001'));
select pg_temp.must_fail('last owner protected',$q$update public.organization_members set role='admin' where organization_id=current_setting('qa.org')::uuid and user_id='20000000-0000-4000-8000-000000000001'$q$,'last_owner');
select pg_temp.must_fail('timezone with operations protected',$q$update public.organizations set timezone='UTC' where id=current_setting('qa.org')::uuid$q$,'timezone_has_operations');
select pg_temp.must_fail('accounting currency protected',$q$update public.organizations set currency='USD' where id=current_setting('qa.org')::uuid$q$,'accounting_currency_immutable');
update public.organizations set name='QA renamed salon' where id=current_setting('qa.org')::uuid;
select pg_temp.check_result('organization rename persists',(select name='QA renamed salon' from public.organizations where id=current_setting('qa.org')::uuid));
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select pg_temp.check_result('owner sees own client',(select count(*)=1 from public.clients where id='40000000-0000-4000-8000-000000000001'));
select pg_temp.check_result('RLS hides other tenant',(select count(*)=0 from public.clients where id='40000000-0000-4000-8000-000000000002'));
select pg_temp.must_fail('RLS rejects cross-tenant insert',$q$insert into public.clients(organization_id,full_name) values('30000000-0000-4000-8000-000000000002','forbidden')$q$,'row-level security');
update public.clients set full_name='QA edited',archived_at=now() where id='40000000-0000-4000-8000-000000000001';
select pg_temp.check_result('client update and archive persisted',(select full_name='QA edited' and archived_at is not null from public.clients where id='40000000-0000-4000-8000-000000000001'));
update public.services set name='QA service edited',archived_at=now() where id='50000000-0000-4000-8000-000000000001';
select pg_temp.check_result('service update and archive persisted',(select name='QA service edited' and archived_at is not null from public.services where id='50000000-0000-4000-8000-000000000001'));
update public.staff set display_name='QA staff edited',archived_at=now() where id='60000000-0000-4000-8000-000000000001';
select pg_temp.check_result('staff update and archive persisted',(select display_name='QA staff edited' and archived_at is not null from public.staff where id='60000000-0000-4000-8000-000000000001'));
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select pg_temp.check_result('specialist cannot read CRM',(select count(*)=0 from public.clients));
select pg_temp.check_result('specialist cannot read payments',(select count(*)=0 from public.payments));
select pg_temp.check_result('specialist reads own appointments',(select count(*)=2 from public.appointments where organization_id=current_setting('qa.org')::uuid));
select pg_temp.must_fail('specialist cannot create clients',$q$insert into public.clients(organization_id,full_name) values(current_setting('qa.org')::uuid,'forbidden')$q$,'row-level security');
reset role;
update public.organization_members set role='admin' where organization_id=current_setting('qa.org')::uuid and user_id='20000000-0000-4000-8000-000000000002';
set local role authenticated;
select pg_temp.must_fail('admin cannot relink staff account',$q$update public.staff set user_id='20000000-0000-4000-8000-000000000001' where id='60000000-0000-4000-8000-000000000001'$q$,'owner_required_for_account_link');
select pg_temp.must_fail('admin cannot create branch',$q$insert into public.branches(organization_id,name) values(current_setting('qa.org')::uuid,'forbidden')$q$,'row-level security');
reset role;
select * from qa_results;
rollback;
