-- ============================================================
-- Chapai Mango House — Team members migration
-- ============================================================
-- Run this in Supabase SQL Editor ONCE after deploying the new
-- /admin/team page.
--
-- What it adds:
--   `team_members` — one row per Founder / Supplier / Team Member
--   shown on the public /team page. Operator manages it from
--   /admin/team without a code change.
--
-- The role column is a text enum (founder/supplier/member) so the
-- /team page can group people into sections. photo_url stores any
-- public image URL (Supabase Storage, Unsplash, the Facebook CDN
-- if the operator pastes a profile photo URL — anything that loads
-- in an <img>).
--
-- RLS: anyone reads active members; admin (is_admin()) does
-- everything else.
-- ============================================================

create table if not exists public.team_members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text not null default 'member'
               check (role in ('founder', 'supplier', 'member')),
  title        text not null default '',
  bio          text not null default '',
  photo_url    text not null default '',
  phone        text,
  email        text,
  facebook_url text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists idx_team_active_role_order
  on public.team_members(is_active, role, sort_order);

alter table public.team_members enable row level security;

grant select on public.team_members to anon, authenticated;
grant insert, update, delete on public.team_members to authenticated;

-- Drop any existing policies so re-running this migration is safe.
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='team_members'
  loop
    execute format('drop policy if exists %I on public.team_members', pol.policyname);
  end loop;
end $$;

-- Public read of active members only. Admin can read everything
-- (including hidden rows so they can re-enable them).
create policy "team public read active"
  on public.team_members
  for select to anon, authenticated
  using (is_active = true or public.is_admin());

-- Admin-only writes.
create policy "team admin all"
  on public.team_members
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seed a couple of placeholder rows so the new /team page has
-- something to show on first deploy. Operator should edit / delete
-- these from /admin/team. Photo URLs use Unsplash so they always
-- render even before any uploads happen.
insert into public.team_members (name, role, title, bio, photo_url, sort_order)
values
  (
    'MD FOISAL IQBAL',
    'founder',
    'প্রতিষ্ঠাতা ও পরিচালক',
    'তিন প্রজন্মের আম-চাষি পরিবারের সন্তান। চাঁপাইনবাবগঞ্জের ঐতিহ্যকে সারা দেশে পৌঁছে দেওয়ার লক্ষ্যেই Chapai Mango House।',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    10
  ),
  (
    'নাচোলের আম সরবরাহকারী দল',
    'supplier',
    'বাগান অংশীদার',
    'নিজামপুর, নাচোলের অভিজ্ঞ আম-চাষিরা — গাছপাকা, কেমিক্যাল-মুক্ত আম সংগ্রহের দায়িত্বে।',
    'https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=600',
    20
  ),
  (
    'ডেলিভারি ও সাপোর্ট টিম',
    'member',
    'কাস্টমার কেয়ার',
    'আপনার অর্ডার সঠিক সময়ে, নিরাপদে পৌঁছে দিতে দিন-রাত কাজ করে আমাদের ডেলিভারি ও সাপোর্ট টিম।',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600',
    30
  )
on conflict do nothing;
