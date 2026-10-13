-- ============================================================
-- Chapai Mango House — Supabase Security Advisor fixes
-- ============================================================
-- Run this in Supabase SQL Editor ONCE (it is idempotent — safe
-- to re-run). Addresses every warning shown in
--    Dashboard -> Advisors -> Security Advisor:
--
--   Warnings:
--     1. Function Search Path Mutable      (tg_reviews_recompute)
--     2. RLS Policy Always True            (orders, contact_messages,
--                                           products, testimonials,
--                                           push_subscriptions)
--     3. Public Can Execute SECURITY DEFINER
--     4. Signed-In Users Can Execute SECURITY DEFINER
--                                          (is_admin, track_order,
--                                           recompute_product_rating)
--
--   Suggestion (Dashboard toggle, NOT SQL):
--     5. Leaked Password Protection
--         Authentication -> Providers -> Email -> turn ON
--         "Leaked password protection".
--
-- Why all the policies were "always true": fix-rls.sql was a
-- legacy emergency patch that opened everything up while we
-- were debugging an order-insert RLS issue back in week 1. It
-- never got tightened back down. customer-auth.sql had the
-- correct is_admin()-gated versions, but fix-rls.sql ran later
-- and overwrote them. This migration restores the proper
-- gating + adds the function-level fixes.
-- ============================================================


-- =========================================================
-- 1. Lock down SECURITY DEFINER functions
-- =========================================================
-- PostgreSQL grants EXECUTE to PUBLIC (every role) by default.
-- The advisor's "Public Can Execute SECURITY DEFINER" warning
-- fires when that grant is still in place. Even when we layer
-- a `grant execute to anon, authenticated` on top, the implicit
-- PUBLIC grant remains until explicitly revoked.

-- ---- 1a. is_admin() — used by RLS policies ---------------
revoke execute on function public.is_admin() from public;
grant  execute on function public.is_admin() to anon, authenticated;

-- ---- 1b. track_order(uuid, text) — public order tracking -
revoke execute on function public.track_order(uuid, text) from public;
grant  execute on function public.track_order(uuid, text) to anon, authenticated;

-- ---- 1c. recompute_product_rating(uuid) — internal only --
-- Called only by the tg_reviews_recompute trigger (now SECURITY
-- DEFINER below, so it doesn't need EXECUTE on this either).
-- Locking it down means client code cannot call it directly.
revoke execute on function public.recompute_product_rating(uuid) from public;
revoke execute on function public.recompute_product_rating(uuid) from anon, authenticated;


-- =========================================================
-- 2. Fix Function Search Path Mutable on tg_reviews_recompute
-- =========================================================
-- The trigger function did not pin search_path, which meant a
-- SECURITY DEFINER call inside (recompute_product_rating) could
-- in theory be hijacked by altering search_path before the
-- INSERT on product_reviews. We pin it to '' (empty) and rely
-- on schema-qualified calls.
--
-- We also promote the trigger function itself to SECURITY DEFINER
-- so it can call recompute_product_rating without the inserting
-- user needing EXECUTE on that helper (we just revoked it above).

create or replace function public.tg_reviews_recompute()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'DELETE') then
    perform public.recompute_product_rating(old.product_id);
    return old;
  else
    perform public.recompute_product_rating(new.product_id);
    return new;
  end if;
end $$;

revoke execute on function public.tg_reviews_recompute() from public;
-- No further grants — triggers don't go through EXECUTE checks
-- the way direct calls do, so no role needs explicit access.


-- =========================================================
-- 3. ORDERS — drop the using(true) policy, restore is_admin()
-- =========================================================
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

create policy "orders_customer_insert_own"
  on public.orders
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "orders_customer_select_own_or_admin"
  on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "orders_admin_update"
  on public.orders
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders_admin_delete"
  on public.orders
  for delete to authenticated
  using (public.is_admin());


-- =========================================================
-- 4. CONTACT MESSAGES — anyone submits, only admin reads
-- =========================================================
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='contact_messages'
  loop
    execute format(
      'drop policy if exists %I on public.contact_messages',
      pol.policyname
    );
  end loop;
end $$;

create policy "contact_anyone_insert"
  on public.contact_messages
  for insert to anon, authenticated
  with check (true);

create policy "contact_admin_select"
  on public.contact_messages
  for select to authenticated
  using (public.is_admin());

create policy "contact_admin_update"
  on public.contact_messages
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_admin_delete"
  on public.contact_messages
  for delete to authenticated
  using (public.is_admin());


-- =========================================================
-- 5. PRODUCTS — public read, only admin writes
-- =========================================================
-- The "for all using(true)" admin policy meant any authenticated
-- user (including a signed-up customer) could insert / update /
-- delete products. Splitting it per-action and gating writes
-- on is_admin() restores intent.
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='products'
  loop
    execute format('drop policy if exists %I on public.products', pol.policyname);
  end loop;
end $$;

create policy "products_public_read"
  on public.products
  for select to anon, authenticated
  using (true);

create policy "products_admin_insert"
  on public.products
  for insert to authenticated
  with check (public.is_admin());

create policy "products_admin_update"
  on public.products
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_admin_delete"
  on public.products
  for delete to authenticated
  using (public.is_admin());


-- =========================================================
-- 6. TESTIMONIALS — public read, only admin writes
-- =========================================================
-- Even though the home page no longer reads from this table
-- (we now read product_reviews), the rows still exist and
-- previously any authenticated user could mutate them.
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='testimonials'
  loop
    execute format('drop policy if exists %I on public.testimonials', pol.policyname);
  end loop;
end $$;

create policy "testimonials_public_read"
  on public.testimonials
  for select to anon, authenticated
  using (true);

create policy "testimonials_admin_insert"
  on public.testimonials
  for insert to authenticated
  with check (public.is_admin());

create policy "testimonials_admin_update"
  on public.testimonials
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "testimonials_admin_delete"
  on public.testimonials
  for delete to authenticated
  using (public.is_admin());


-- =========================================================
-- 7. PUSH SUBSCRIPTIONS — fix the dangerous public DELETE
-- =========================================================
-- The legacy policy was:
--   create policy "push delete own or admin"
--     on public.push_subscriptions for delete
--     to anon, authenticated using (true);
--
-- which let ANY anonymous visitor issue
--   delete from public.push_subscriptions;
-- and wipe the entire subscriber table. Real CVE.
--
-- Real-world fix: keep direct DELETE admin-only, expose a
-- SECURITY DEFINER RPC that anyone can call for a self-
-- unsubscribe by endpoint. The endpoint is a long random
-- token issued by the browser's Push API, so guessing one
-- is computationally infeasible.

create or replace function public.unsubscribe_push(p_endpoint text)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  delete from public.push_subscriptions
   where endpoint = p_endpoint;
$$;

revoke execute on function public.unsubscribe_push(text) from public;
grant  execute on function public.unsubscribe_push(text) to anon, authenticated;

-- Now lock the direct table operations down.
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='push_subscriptions'
  loop
    execute format(
      'drop policy if exists %I on public.push_subscriptions',
      pol.policyname
    );
  end loop;
end $$;

-- Anyone (incl. logged-out browsers) can subscribe themselves.
create policy "push_anyone_insert"
  on public.push_subscriptions
  for insert to anon, authenticated
  with check (true);

-- Direct deletes only via admin (e.g. dead-endpoint cleanup
-- in the broadcast action which uses the service role). Ordinary
-- unsubscribes go through unsubscribe_push() above.
create policy "push_admin_delete"
  on public.push_subscriptions
  for delete to authenticated
  using (public.is_admin());

-- Only admin can list subscribers.
create policy "push_admin_select"
  on public.push_subscriptions
  for select to authenticated
  using (public.is_admin());

-- Belt-and-braces: revoke the table-level DELETE grant from anon
-- so it can't even attempt the operation. (RLS would have
-- rejected it but defense-in-depth is cheap.)
revoke delete on public.push_subscriptions from anon;


-- =========================================================
-- 8. Sanity check — list every public-schema policy
-- =========================================================
-- Uncomment the SELECT below to verify after running this
-- migration. You should see:
--   * No policy with `qual = 'true'` on a `for all` admin row.
--   * Every "admin_*" policy uses `is_admin()` as its USING /
--     WITH CHECK expression.
--
-- select schemaname, tablename, policyname, roles, cmd, qual, with_check
--   from pg_policies
--  where schemaname = 'public'
--  order by tablename, cmd, policyname;
-- =========================================================
