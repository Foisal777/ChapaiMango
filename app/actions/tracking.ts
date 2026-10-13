"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { normalizeTrackingId } from "@/lib/tracking-id";
import type { TrackedOrder } from "@/types";

export type TrackResult = { ok: true; order: TrackedOrder } | { error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toOrder(row: Record<string, unknown>): TrackedOrder {
  return {
    id: String(row.id),
    tracking_id: (row.tracking_id as string | null) ?? null,
    status: row.status as TrackedOrder["status"],
    customer_name: String(row.customer_name),
    district: String(row.district),
    total: Number(row.total),
    payment_method: row.payment_method as TrackedOrder["payment_method"],
    created_at: String(row.created_at)
  };
}

/**
 * Public order lookup by short CMH tracking id (preferred) or the
 * legacy full UUID. Both paths go through `security definer` RPCs
 * (supabase/track-order.sql + cmh-tracking-and-storage.sql) that only
 * return the order when the phone also matches — orders RLS stays
 * locked down.
 */
export async function trackOrderAction(rawOrderId: string, rawPhone: string): Promise<TrackResult> {
  if (!isSupabaseConfigured()) return { error: "Supabase কনফিগার হয়নি" };
  const input = rawOrderId.trim();
  const phone = rawPhone.trim();
  if (phone.replace(/\D/g, "").length < 10) return { error: "সঠিক ফোন নম্বর দিন" };

  const supabase = createClient();
  const trackingId = normalizeTrackingId(input);

  if (trackingId) {
    const { data, error } = await supabase.rpc("track_order_by_tracking", { p_tracking_id: trackingId, p_phone: phone });
    if (error) {
      // Migration not run yet / function missing → explain, don't crash.
      if (/track_order_by_tracking|function/i.test(error.message)) {
        return { error: "CMH ট্র্যাকিং এখনো সক্রিয় হয়নি — পুরো অর্ডার আইডি (UUID) দিয়ে চেষ্টা করুন, অথবা অ্যাডমিনকে cmh-tracking-and-storage.sql রান করতে বলুন" };
      }
      return { error: error.message };
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { error: "অর্ডার পাওয়া যায়নি — ট্র্যাকিং আইডি বা ফোন নম্বর চেক করুন" };
    return { ok: true, order: toOrder(row) };
  }

  if (!UUID_RE.test(input)) {
    return { error: "ট্র্যাকিং আইডি ভুল — CMH-XXXXXX (যেমন CMH-7K3QX9) অথবা পুরো অর্ডার আইডি দিন" };
  }
  const { data, error } = await supabase.rpc("track_order", { p_order_id: input, p_phone: phone });
  if (error) return { error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { error: "অর্ডার পাওয়া যায়নি — আইডি বা ফোন নম্বর চেক করুন" };
  return { ok: true, order: toOrder(row) };
}
