alter table public.app_users enable row level security;

create policy "app_users server only"
on public.app_users for all to authenticated
using (false)
with check (false);
