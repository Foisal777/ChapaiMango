-- ============================================================
-- Chapai Mango House — Customer auth + Order history migration
-- ============================================================
-- Run this in Supabase SQL Editor ONCE after deploying the new
-- /login, /signup, /orders pages.
--
-- What it does:
--   1. Adds `user_id` column to orders (links each order to a
--      Supabase Auth user)
--   2. Adds an `admin_emails` whitelist table — only emails listed
--      here count as admin (full /admin access)
--   3. Adds an `is_admin()` helper so RLS policies can check if
--      the current logged-in user is an admin
--   4. Replaces the previous "anyone can insert" policy with
--      proper auth-required policies:
--        - Customer: can only insert + read THEIR OWN orders
--        - Admin:    can read/update/delete ALL orders
--   5. Tightens contact_messages: anyone (incl. anon) can submit,
--      only admin can read/manage
-- ============================================================

-- ---------- 1. Add user_id to orders ----------
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_orders_user on public.orders(user_id);

-- ---------- 2. admin_emails whitelist ----------
create table if not exists public.admin_emails (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_emails enable row level security;

drop policy if exists "admin_emails_read" on public.admin_emails;
create policy "admin_emails_read"
  on public.admin_emails
  for select to anon, authenticated
  using (true);

-- ---------- 3. is_admin() helper ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    exists(
      select 1
      from public.admin_emails
      where lower(email) = lower(auth.jwt() ->> 'email')
    ),
    false
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------- 4. Reset orders RLS policies ----------
alter table public.orders enable row level security;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='orders'
  loop
    execute format('drop policy if exists %I on public.orders', pol.policyname);
  end loop;
end $$;

-- Customers can only insert orders that belong to themselves.
create policy "customer_insert_own_order"
  on public.orders
  for insert to authenticated
  with check (user_id = auth.uid());

-- Customers see their own orders; admins see everything.
create policy "customer_select_own_or_admin"
  on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Only admin can update / delete.
create policy "admin_update_orders"
  on public.orders
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_orders"
  on public.orders
  for delete to authenticated
  using (public.is_admin());

-- ---------- 5. Reset contact_messages RLS policies ----------
alter table public.contact_messages enable row level security;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='contact_messages'
  loop
    execute format('drop policy if exists %I on public.contact_messages', pol.policyname);
  end loop;
end $$;

-- Anyone (incl. logged-out visitor) can send a contact message.
create policy "anyone_insert_contact"
  on public.contact_messages
  for insert to anon, authenticated
  with check (true);

-- Only admin can read / update / delete contact messages.
create policy "admin_all_contact"
  on public.contact_messages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- 6. Add YOUR admin email ----------
-- IMPORTANT: replace the email below with the admin email you
-- created in Supabase Authentication -> Users.
-- Without this row, /admin/* will reject every login.
--
-- Example:
--   insert into public.admin_emails (email)
--   values ('foysaliqbal333@gmail.com')
--   on conflict do nothing;
-- ============================================================
