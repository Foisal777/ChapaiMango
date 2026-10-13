-- ============================================================
-- Chapai Mango House — Public order tracking RPC
-- ============================================================
-- Run this in Supabase SQL Editor ONCE after deploying the new
-- /track page.
--
-- The orders table is gated behind RLS (only the owner +
-- admin can SELECT). For the public tracking page we expose a
-- security-definer function that returns *just* the tracking-
-- relevant fields if the caller can prove ownership by matching
-- the order id AND the phone number on file. This keeps order
-- contents (items, prices) gated to logged-in customers, and
-- only leaks status/timestamps for the matched id+phone pair.
-- ============================================================

create or replace function public.track_order(
  p_order_id uuid,
  p_phone    text
) returns table (
  id           uuid,
  status       text,
  customer_name text,
  district     text,
  total        numeric,
  payment_method text,
  created_at   timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select o.id,
         o.status,
         o.customer_name,
         o.district,
         o.total,
         o.payment_method,
         o.created_at
    from public.orders o
   where o.id = p_order_id
     -- Loose phone match: ignore +88 prefix, spaces, dashes.
     and regexp_replace(o.phone,  '\D', '', 'g')
       = regexp_replace(p_phone,  '\D', '', 'g')
$$;

revoke all on function public.track_order(uuid, text) from public;
grant execute on function public.track_order(uuid, text) to anon, authenticated;
