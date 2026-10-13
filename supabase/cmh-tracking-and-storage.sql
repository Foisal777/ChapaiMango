-- ============================================================
-- Chapai Mango House — CMH tracking IDs + gallery uploads
-- ============================================================
-- Run this ONCE in Supabase SQL Editor. Idempotent — safe to re-run.
--
-- 1) orders.tracking_id — short branded id like CMH-7K3QX9 on EVERY
--    order (new ones via trigger, old ones backfilled below).
-- 2) track_order_by_tracking(tracking_id, phone) RPC for /track.
--    The original track_order(uuid, phone) is also upgraded to
--    return tracking_id.
-- 3) Storage bucket `site-images` (public) so admins can pick photos
--    straight from their phone/computer gallery in:
--      - Admin → Products (product photos)
--      - Admin → Settings → Payments (payment-method logos)
-- ============================================================

-- ---------- 1) tracking_id column + generator + trigger ----------
alter table public.orders add column if not exists tracking_id text;

create or replace function public.generate_tracking_id() returns text
language plpgsql as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; -- no 0/O/1/I/L
  code text;
begin
  loop
    code := 'CMH-';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.orders where tracking_id = code);
  end loop;
  return code;
end $$;

create or replace function public.tg_orders_tracking_id() returns trigger
language plpgsql as $$
begin
  if new.tracking_id is null or new.tracking_id = '' then
    new.tracking_id := public.generate_tracking_id();
  end if;
  return new;
end $$;

drop trigger if exists orders_tracking_id on public.orders;
create trigger orders_tracking_id
  before insert on public.orders
  for each row execute function public.tg_orders_tracking_id();

-- Backfill existing orders (each gets its own unique CMH id).
update public.orders set tracking_id = public.generate_tracking_id()
 where tracking_id is null or tracking_id = '';

create unique index if not exists idx_orders_tracking_id on public.orders(tracking_id);

-- ---------- 2) Tracking RPCs (phone-verified, public-safe) ----------
drop function if exists public.track_order(uuid, text);
create or replace function public.track_order(p_order_id uuid, p_phone text)
returns table (id uuid, tracking_id text, status text, customer_name text, district text, total numeric, payment_method text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select o.id, o.tracking_id, o.status, o.customer_name, o.district, o.total, o.payment_method, o.created_at
    from public.orders o
   where o.id = p_order_id
     and regexp_replace(o.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
$$;
revoke all on function public.track_order(uuid, text) from public;
grant execute on function public.track_order(uuid, text) to anon, authenticated;

drop function if exists public.track_order_by_tracking(text, text);
create or replace function public.track_order_by_tracking(p_tracking_id text, p_phone text)
returns table (id uuid, tracking_id text, status text, customer_name text, district text, total numeric, payment_method text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select o.id, o.tracking_id, o.status, o.customer_name, o.district, o.total, o.payment_method, o.created_at
    from public.orders o
   where upper(o.tracking_id) = upper(trim(p_tracking_id))
     and regexp_replace(o.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
$$;
revoke all on function public.track_order_by_tracking(text, text) from public;
grant execute on function public.track_order_by_tracking(text, text) to anon, authenticated;

-- ---------- 3) Storage bucket for gallery uploads ----------
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

drop policy if exists "site images public read" on storage.objects;
create policy "site images public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-images');

drop policy if exists "site images admin write" on storage.objects;
create policy "site images admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'site-images')
  with check (bucket_id = 'site-images');
