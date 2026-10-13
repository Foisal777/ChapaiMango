-- ============================================================
-- Chapai Mango House — Admin-editable Refund Policy
-- ============================================================
-- Run this in Supabase SQL Editor ONCE after deploying the
-- /admin/refund-policy page. Idempotent — safe to re-run.
--
-- Single-row table holding the refund policy markdown. Public
-- /refund page reads it. Admin /admin/refund-policy page edits
-- it. Versioning is intentionally NOT included — keep the
-- policy short and edited in place. Operator can paste into a
-- doc tool if they want history.
-- ============================================================

create table if not exists public.refund_policy (
  -- Always 1. Enforced by the unique check below so we can never
  -- accidentally end up with multiple rows confusing the public page.
  id           integer primary key default 1 check (id = 1),

  -- Markdown body shown on /refund. Headings start with ##, lists
  -- with - or *. Plain paragraphs work too. Max 50 KB to keep
  -- the public page snappy.
  body_md      text not null default '',

  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users(id) on delete set null
);

-- ----- updated_at trigger ---------------------------------
create or replace function public.tg_refund_policy_touch()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

revoke execute on function public.tg_refund_policy_touch() from public;

drop trigger if exists trg_refund_policy_touch on public.refund_policy;
create trigger trg_refund_policy_touch
  before update on public.refund_policy
  for each row execute function public.tg_refund_policy_touch();

-- ----- RLS ------------------------------------------------
alter table public.refund_policy enable row level security;

grant select on public.refund_policy to anon, authenticated;
grant insert, update, delete on public.refund_policy to authenticated;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='refund_policy'
  loop
    execute format(
      'drop policy if exists %I on public.refund_policy',
      pol.policyname
    );
  end loop;
end $$;

-- Anyone can read the policy.
create policy "refund_policy_public_read"
  on public.refund_policy
  for select to anon, authenticated
  using (true);

-- Only admin can insert (the seed) and update.
create policy "refund_policy_admin_insert"
  on public.refund_policy
  for insert to authenticated
  with check (public.is_admin());

create policy "refund_policy_admin_update"
  on public.refund_policy
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- We never expect to delete the row, but lock it down anyway.
create policy "refund_policy_admin_delete"
  on public.refund_policy
  for delete to authenticated
  using (public.is_admin());

-- ----- Seed: default Bangla policy ------------------------
-- Only inserts if the row is missing. Operator can rewrite from
-- /admin/refund-policy at any time without re-running this file.
insert into public.refund_policy (id, body_md)
values (
  1,
  $bn$
## রিফান্ড ও রিটার্ন পলিসি

Chapai Mango House — গ্রাহক সন্তুষ্টি আমাদের সবচেয়ে গুরুত্বপূর্ণ অগ্রাধিকার। গাছপাকা, কেমিক্যাল-মুক্ত আম পৌঁছানোর প্রতিশ্রুতি আমরা সর্বোচ্চ চেষ্টা দিয়ে রক্ষা করি। তবু কখনো সমস্যা হলে নিচের পদ্ধতি অনুসরণ করুন।

### ১. কখন রিফান্ড পাওয়া যায়
- পণ্য পেয়ে যদি **৩০% বা তার বেশি আম পচা / ছত্রাক-আক্রান্ত** থাকে।
- ভুল জাতের আম ডেলিভারি হলে (যেমন: হিমসাগর অর্ডার দিয়ে ল্যাংড়া পেলে)।
- **ওজন ১০% এর বেশি কম** হলে।
- কুরিয়ারের কারণে অর্ডার সম্পূর্ণ হারিয়ে গেলে।

### ২. কীভাবে অভিযোগ করবেন
পণ্য হাতে পাওয়ার **২৪ ঘণ্টার মধ্যে** আমাদের জানান:
- ফোন / WhatsApp: কন্ট্যাক্ট পেজ দেখুন
- ইমেইল: কন্ট্যাক্ট পেজ দেখুন
- সাথে দিন: অর্ডার আইডি, সমস্যার ছবি (অন্তত ৩টি), এবং আনপ্যাকিং ভিডিও থাকলে আরও ভালো।

### ৩. সমাধান প্রক্রিয়া
- অভিযোগ যাচাই: ১–২ কর্মদিবসের মধ্যে।
- যাচাই হলে আপনার পছন্দ অনুযায়ী **পুনরায় ডেলিভারি**, **আংশিক রিফান্ড**, বা **পূর্ণ রিফান্ড** পাবেন।
- রিফান্ড একই পেমেন্ট পদ্ধতিতে ফেরত দেওয়া হবে (bKash/Nagad/Rocket/Upay/ব্যাংক)।
- ক্যাশ অন ডেলিভারির ক্ষেত্রে bKash বা পছন্দের MFS-এ রিফান্ড আসবে।

### ৪. কখন রিফান্ড পাওয়া যাবে না
- পণ্য পেয়ে ২৪ ঘণ্টা পার হয়ে গেলে।
- প্রাকৃতিক বৈচিত্র্য (সামান্য রঙ-পার্থক্য, আকারের তারতম্য) — এগুলো গাছপাকা আমের স্বাভাবিক বৈশিষ্ট্য।
- গ্রাহক ভুল ঠিকানা দেওয়ায় ডেলিভারি ব্যর্থ হলে।
- ডেলিভারির পর সঠিক সংরক্ষণ না করায় পচন (গরম পরিবেশে রেখে দেওয়া)।

### ৫. বাতিল ও পরিবর্তন
- অর্ডার শিপ হওয়ার আগে যেকোনো সময় বাতিল করা যাবে — ১০০% রিফান্ড।
- শিপ হওয়ার পর বাতিল সম্ভব নয়, তবে উপরের শর্ত অনুযায়ী রিফান্ড দাবি করা যাবে।

### ৬. যোগাযোগ
যেকোনো প্রশ্নে আমাদের কন্ট্যাক্ট পেজে যান — আমরা ২৪ ঘণ্টার মধ্যে উত্তর দিই।
$bn$
)
on conflict (id) do nothing;

-- ============================================================
-- Sanity check (uncomment to verify):
--
-- select id, length(body_md) as policy_chars, updated_at
--   from public.refund_policy;
-- ============================================================
