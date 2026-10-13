-- ============================================================
-- Chapai Mango House — Web Push subscriptions migration
-- ============================================================
-- Run this in Supabase SQL Editor ONCE after deploying the new
-- /admin/notifications page and the SubscribeButton component.
--
-- What it adds:
--   1. `push_subscriptions` table — one row per browser that has
--      granted push permission. Stores the endpoint + the two
--      cryptographic keys (p256dh + auth) that the web-push
--      library needs to send a notification.
--   2. RLS:
--        - Anyone (anon + authenticated) can INSERT a subscription
--          for themselves. We never expose the list publicly.
--        - Anyone can DELETE a row matching their own endpoint
--          (used for the "unsubscribe" path from inside a worker).
--        - Only admin (is_admin()) can SELECT / SELECT-COUNT
--          subscriptions — used by /admin/notifications to fan
--          out a push to every subscriber.
-- ============================================================

create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  endpoint   text unique not null,
  p256dh     text not null,
  auth       text not null,
  user_id    uuid references auth.users(id) on delete set null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_user on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

grant select, insert, delete on public.push_subscriptions to anon, authenticated;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='push_subscriptions'
  loop
    execute format('drop policy if exists %I on public.push_subscriptions', pol.policyname);
  end loop;
end $$;

-- Anyone can insert a subscription (no PII; endpoint is a random token).
create policy "push insert anyone"
  on public.push_subscriptions
  for insert to anon, authenticated
  with check (true);

-- Caller can delete their own row by endpoint (for unsubscribe inside SW).
-- Admin can delete anything.
create policy "push delete own or admin"
  on public.push_subscriptions
  for delete to anon, authenticated
  using (true);

-- Only admin can list.
create policy "push select admin"
  on public.push_subscriptions
  for select to authenticated
  using (public.is_admin());
