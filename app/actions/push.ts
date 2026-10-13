"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

type SubscribeInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string | null;
};

export type PushActionResult = { ok: true } | { error: string };

/**
 * Persist a Web Push subscription for the current browser.
 *
 * Called from the SubscribeButton client component after the browser
 * grants permission and the browser-issued PushSubscription has been
 * marshalled to the three string fields the web-push library needs
 * to send a push.
 *
 * `endpoint` has a UNIQUE index in the migration, so re-subscribing
 * from the same browser is a no-op (we upsert by endpoint).
 *
 * The optional user_id link to auth.users is set if the visitor is
 * signed in — useful for "your subscriber count" stats and for
 * filtered sends in future. Anonymous subscriptions are allowed.
 */
export async function savePushSubscriptionAction(
  input: SubscribeInput
): Promise<PushActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase কনফিগার হয়নি" };
  }
  if (!input.endpoint || !input.p256dh || !input.auth) {
    return { error: "Subscription incomplete" };
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      user_agent: input.user_agent ?? null,
      user_id: user?.id ?? null
    },
    { onConflict: "endpoint" }
  );

  if (error) return { error: error.message };
  return { ok: true };
}

/** Best-effort cleanup when the user clicks "Unsubscribe" client-side.
 *
 * Goes through the `unsubscribe_push(endpoint)` SECURITY DEFINER RPC
 * instead of a direct DELETE on the table. Why: the old direct DELETE
 * required an `using (true)` RLS policy on `push_subscriptions`,
 * which let any anonymous visitor wipe the entire subscriber table
 * with a single bulk DELETE. The RPC takes the endpoint as an
 * argument so it can only ever delete the matching row. See
 * supabase/security-fixes.sql for the full migration. */
export async function deletePushSubscriptionAction(
  endpoint: string
): Promise<PushActionResult> {
  if (!isSupabaseConfigured()) return { error: "Supabase কনফিগার হয়নি" };
  if (!endpoint) return { error: "Missing endpoint" };
  const supabase = createClient();
  const { error } = await supabase.rpc("unsubscribe_push", {
    p_endpoint: endpoint
  });
  if (error) return { error: error.message };
  return { ok: true };
}
