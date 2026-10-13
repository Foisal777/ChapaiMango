-- ============================================================
-- Chapai Mango House — RLS quick fix
-- ============================================================
-- Run this in Supabase SQL Editor IF you see:
--
--   "অর্ডার দেওয়া যায়নি: new row violates row-level security
--    policy for table 'orders'"
--
-- (or the same for "contact_messages")
--
-- This script wipes all old / partial / mistyped policies on the
-- public-write tables and creates clean ones that explicitly:
--   * grant the anon (logged-out customer) and authenticated (admin)
--     roles INSERT / SELECT permission at the SQL level
--   * add a permissive RLS policy for INSERT from any visitor
--   * keep admin (authenticated) full access for the dashboard
--
-- Safe to run multiple times.
-- ============================================================

-- ----------------------------------------------------------
-- 1. Make sure RLS is enabled on every public-write table
-- ----------------------------------------------------------
alter table public.orders            enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.products          enable row level security;
alter table public.testimonials      enable row level security;

-- ----------------------------------------------------------
-- 2. Grant table-level permissions to the Supabase roles.
--    RLS only matters AFTER the role has GRANT — without this,
--    the request is rejected before any policy is even checked.
-- ----------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant insert, select on public.orders           to anon, authenticated;
grant insert         on public.contact_messages to anon, authenticated;
grant select         on public.products         to anon, authenticated;
grant select         on public.testimonials     to anon, authenticated;

-- Authenticated admin gets everything else (update/delete) too.
grant update, delete on public.orders           to authenticated;
grant update, delete on public.contact_messages to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.testimonials to authenticated;

-- ----------------------------------------------------------
-- 3. Drop every old policy by all the names we may have used.
--    No-ops if the policy isn't there.
-- ----------------------------------------------------------
drop policy if exists "orders insert"              on public.orders;
drop policy if exists "Anyone can insert orders"   on public.orders;
drop policy if exists "auth all orders"            on public.orders;
drop policy if exists "orders public insert"       on public.orders;
drop policy if exists "orders admin all"           on public.orders;

drop policy if exists "contact insert"             on public.contact_messages;
drop policy if exists "auth all contact"           on public.contact_messages;
drop policy if exists "contact public insert"      on public.contact_messages;
drop policy if exists "contact admin all"          on public.contact_messages;

drop policy if exists "products read"              on public.products;
drop policy if exists "auth all products"          on public.products;
drop policy if exists "products public read"       on public.products;
drop policy if exists "products admin all"         on public.products;

drop policy if exists "testimonials read"          on public.testimonials;
drop policy if exists "auth all testimonials"      on public.testimonials;
drop policy if exists "testimonials public read"   on public.testimonials;
drop policy if exists "testimonials admin all"     on public.testimonials;

-- ----------------------------------------------------------
-- 4. Recreate the policies cleanly, with explicit role targets.
-- ----------------------------------------------------------

-- ORDERS:  any visitor can place an order, admin sees/edits all.
create policy "orders public insert"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

create policy "orders admin all"
  on public.orders
  for all
  to authenticated
  using (true)
  with check (true);

-- CONTACT MESSAGES:  any visitor can submit, admin reads/manages.
create policy "contact public insert"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

create policy "contact admin all"
  on public.contact_messages
  for all
  to authenticated
  using (true)
  with check (true);

-- PRODUCTS:  public read, admin write.
create policy "products public read"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "products admin all"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);

-- TESTIMONIALS:  public read, admin write.
create policy "testimonials public read"
  on public.testimonials
  for select
  to anon, authenticated
  using (true);

create policy "testimonials admin all"
  on public.testimonials
  for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------
-- 5. Quick sanity check — should return 8 rows, one policy per
--    (table, action). Useful while debugging.
-- ----------------------------------------------------------
-- select schemaname, tablename, policyname, roles, cmd
-- from   pg_policies
-- where  tablename in ('orders','contact_messages','products','testimonials')
-- order by tablename, cmd;
