-- ============================================================
-- Chapai Mango House — Site settings migration
-- ============================================================
-- Run this in Supabase SQL Editor ONCE after deploying the
-- /admin/settings page.
--
-- What it adds:
--   `site_settings` — a single-row table (id = 1) holding the whole
--   operator-editable configuration as one JSON document: brand
--   text, contact details, social links, delivery fee / free-delivery
--   threshold / minimum order, payment methods (numbers, advance
--   amounts, instructions, enabled flags), bank account, homepage hero
--   copy and SEO keywords / verification tokens.
--
--   Values saved from /admin/settings override the environment
--   variables (Railway / Vercel). Anything left blank in the DB falls
--   back to the env var, and then to the built-in default.
--
-- RLS: anyone can read (the storefront needs it to render prices,
-- payment numbers, etc. — the same data is shown at checkout anyway);
-- only admins (public.is_admin()) can write.
-- ============================================================

create table if not exists public.site_settings (
  id          smallint primary key default 1 check (id = 1),
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.site_settings enable row level security;

grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'site_settings'
  loop
    execute format('drop policy if exists %I on public.site_settings', pol.policyname);
  end loop;
end $$;

create policy "site settings public read"
  on public.site_settings
  for select to anon, authenticated
  using (true);

create policy "site settings admin write"
  on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_settings (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;
