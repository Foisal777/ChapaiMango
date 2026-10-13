-- ============================================================
-- Chapai Mango House — Marquee items migration
-- ============================================================
-- Run this in Supabase SQL Editor ONCE after deploying the new
-- /admin/marquees page.
--
-- What it adds:
--   `marquee_items` — one row per scrolling promo strip message.
--   The /admin/marquees page lets the operator add/edit/reorder/
--   toggle items without a code change. The public TopMarquee
--   component reads from this table and falls back to a built-in
--   list of seeds when Supabase is unreachable / not configured
--   so dev and previews keep working.
--
-- RLS: anyone reads active items; admin (is_admin()) does
-- everything else.
-- ============================================================

create table if not exists public.marquee_items (
  id          uuid primary key default gen_random_uuid(),
  emoji       text not null default '✨',
  text        text not null,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_marquee_active_order
  on public.marquee_items(is_active, sort_order);

alter table public.marquee_items enable row level security;

grant select on public.marquee_items to anon, authenticated;
grant insert, update, delete on public.marquee_items to authenticated;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='marquee_items'
  loop
    execute format('drop policy if exists %I on public.marquee_items', pol.policyname);
  end loop;
end $$;

-- Public read of active items only. Admin can read everything.
create policy "marquee public read active"
  on public.marquee_items
  for select to anon, authenticated
  using (is_active = true or public.is_admin());

-- Admin-only writes.
create policy "marquee admin all"
  on public.marquee_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seed the same six lines that used to be hard-coded in
-- components/promo/TopMarquee.tsx, so the strip stays populated
-- the moment the migration runs.
insert into public.marquee_items (emoji, text, sort_order)
values
  ('🚚', 'সারাদেশে ফ্রী ডেলিভারি', 10),
  ('🥭', 'চাঁপাইনবাবগঞ্জের প্রিমিয়াম আম', 20),
  ('✨', '১০০% গাছপাকা, কেমিক্যাল-মুক্ত', 30),
  ('📦', 'ন্যূনতম অর্ডার ১০ কেজি', 40),
  ('🏆', 'GI ট্যাগ পাওয়া ক্ষীরসাপাত', 50),
  ('🏡', 'সরাসরি বাগান থেকে আপনার দরজায়', 60)
on conflict do nothing;
