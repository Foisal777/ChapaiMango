-- ============================================================
-- Chapai Mango House — Product reviews migration
-- ============================================================
-- Run this in Supabase SQL Editor ONCE after deploying the new
-- ReviewSection on /products/[slug] and the /admin/reviews page.
--
-- What it adds:
--   1. `product_reviews` table — one row per customer review
--      (auth-required to insert; enforced by RLS).
--   2. `products.review_count` numeric column so we don't have
--      to count rows on every product page render.
--   3. A trigger that recomputes products.rating + review_count
--      from approved reviews any time a review is inserted /
--      updated / deleted. The legacy admin-set rating is kept as
--      a starting value for products with zero reviews.
--   4. RLS:
--        - Anyone (anon + authenticated) can SELECT approved
--          reviews — they show on the public product page.
--        - Authenticated users can INSERT a review only for
--          themselves (user_id = auth.uid()) and only one per
--          product (unique index on (product_id, user_id)).
--        - Authenticated users can UPDATE / DELETE their own
--          unmoderated review.
--        - Admin (is_admin()) can do anything (moderate, delete).
-- ============================================================

-- ---------- 1. Table ----------
create table if not exists public.product_reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating      int  not null check (rating between 1 and 5),
  title       text,
  body        text not null check (char_length(body) between 5 and 2000),
  is_approved boolean not null default true, -- auto-approve; admin can hide
  created_at  timestamptz not null default now()
);

create index if not exists idx_reviews_product on public.product_reviews(product_id);
create index if not exists idx_reviews_user    on public.product_reviews(user_id);
create index if not exists idx_reviews_created on public.product_reviews(created_at desc);

-- One review per user per product.
create unique index if not exists uq_reviews_product_user
  on public.product_reviews(product_id, user_id)
  where user_id is not null;

-- ---------- 2. products.review_count ----------
alter table public.products
  add column if not exists review_count integer not null default 0;

-- ---------- 3. Trigger to recompute rating + count ----------
create or replace function public.recompute_product_rating(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  agg_rating numeric(2,1);
  agg_count  integer;
begin
  select
    coalesce(round(avg(rating)::numeric, 1), 5.0),
    count(*)
  into agg_rating, agg_count
  from public.product_reviews
  where product_id = p_product_id and is_approved = true;

  update public.products
     set rating = case when agg_count > 0 then agg_rating else rating end,
         review_count = agg_count
   where id = p_product_id;
end $$;

create or replace function public.tg_reviews_recompute()
returns trigger
language plpgsql
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

drop trigger if exists trg_reviews_recompute on public.product_reviews;
create trigger trg_reviews_recompute
  after insert or update or delete on public.product_reviews
  for each row execute function public.tg_reviews_recompute();

-- ---------- 4. RLS ----------
alter table public.product_reviews enable row level security;

grant select on public.product_reviews to anon, authenticated;
grant insert, update, delete on public.product_reviews to authenticated;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='product_reviews'
  loop
    execute format('drop policy if exists %I on public.product_reviews', pol.policyname);
  end loop;
end $$;

-- Public: read approved reviews. Admin can read everything.
create policy "reviews public read approved"
  on public.product_reviews
  for select to anon, authenticated
  using (is_approved = true or public.is_admin());

-- Authenticated user can insert their own review.
create policy "reviews insert own"
  on public.product_reviews
  for insert to authenticated
  with check (user_id = auth.uid());

-- Author can edit / delete their own review; admin can edit / delete anyone's.
create policy "reviews update own or admin"
  on public.product_reviews
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "reviews delete own or admin"
  on public.product_reviews
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());
