"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { TrackedOrder } from "@/types";

export type TrackResult =
  | { ok: true; order: TrackedOrder }
  | { error: string };

/**
 * Public order lookup. Calls the `track_order(uuid, text)` RPC defined
 * in supabase/track-order.sql which is `security definer` and only
 * returns the order if the (id, phone) pair matches a digit-stripped
 * comparison. The RLS on the orders table itself stays locked down.
 *
 * Inputs are validated on the server too — UUID shape + at least 10
 * digits in the phone — so the RPC doesn't get hammered with garbage.
 */
export async function trackOrderAction(
  rawOrderId: string,
  rawPhone: string
): Promise<TrackResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase কনফিগার হয়নি" };
  }

  const orderId = rawOrderId.trim();
  const phone = rawPhone.trim();

  // Cheap UUID v4-ish shape check — we accept any UUID, not just v4.
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      orderId
    )
  ) {
    return { error: "অর্ডার আইডি ভুল ফরম্যাটে" };
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return { error: "সঠিক ফোন নম্বর দিন" };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("track_order", {
    p_order_id: orderId,
    p_phone: phone
  });

  if (error) {
    return { error: error.message };
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return { error: "অর্ডার পাওয়া যায়নি — আইডি বা ফোন নম্বর চেক করুন" };
  }

  return {
    ok: true,
    order: {
      id: row.id,
      status: row.status,
      customer_name: row.customer_name,
      district: row.district,
      total: Number(row.total),
      payment_method: row.payment_method,
      created_at: row.created_at
    }
  };
}
