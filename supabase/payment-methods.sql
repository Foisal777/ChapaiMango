-- ============================================================
-- Chapai Mango House — Cleanup: drop orders.payment_method check
-- ============================================================
-- Run this in Supabase SQL Editor ONCE. Idempotent — safe to re-run.
--
-- Why this migration: the original schema.sql had
--   payment_method text not null check (payment_method in ('cod','bkash','nagad','rocket'))
-- on the orders table. We've now added Upay and Bank as supported
-- payment options, configured via env vars. The check constraint
-- would reject any order using upay/bank/future-method codes.
--
-- An earlier version of this file (pre-PR-#29 revert) created a full
-- `payment_methods` table for admin-panel management. We've since
-- gone back to env-var-driven config because the operator preferred
-- that workflow, so this migration also tears down that table if it
-- exists from a previous run.
-- ============================================================

-- 1) Drop the legacy IN-list check on orders.payment_method
do $$
declare
  con_name text;
begin
  select conname
    into con_name
    from pg_constraint
   where conrelid = 'public.orders'::regclass
     and pg_get_constraintdef(oid) ilike '%payment_method%in%';
  if con_name is not null then
    execute format('alter table public.orders drop constraint %I', con_name);
  end if;
end $$;

-- 2) Tear down the payment_methods table if a previous run of this
--    migration created it. Reverting to env-var-driven config — no
--    table needed any more.
drop table  if exists public.payment_methods cascade;
drop function if exists public.tg_payment_methods_touch() cascade;
