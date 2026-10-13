import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { User } from "@supabase/supabase-js";

/**
 * Returns the currently signed-in user (server-side), or null.
 * Safe to call from any server component or server action.
 *
 * Wrapped in React `cache()` so a page that asks for the user from
 * several components (layout + page + a child) only performs the
 * Supabase round-trip once per request.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user ?? null;
});

/**
 * The admin whitelist, cached for 10 minutes.
 *
 * It's a tiny table that changes about once ever, yet `isAdminUser()` was
 * queried on every single /admin page render — one extra Supabase
 * round-trip per navigation. `admin_emails` is publicly readable (the
 * SELECT policy is `using (true)`), so the cookie-free client is enough.
 *
 * Throws on a failed read instead of returning []: `unstable_cache` never
 * caches a thrown error, and `isAdminUser` falls back to a direct query,
 * so a transient hiccup can never lock the operator out of /admin.
 */
const loadAdminEmails = unstable_cache(
  async (): Promise<string[] | null> => {
    const supabase = createPublicClient();
    if (!supabase) return null;
    const { data, error } = await supabase.from("admin_emails").select("email");
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row) => (row.email || "").toLowerCase())
      .filter(Boolean);
  },
  ["admin-emails"],
  { tags: [CACHE_TAGS.adminEmails], revalidate: 600 }
);

/** Uncached fallback — used only if the cached read throws. */
async function directIsAdmin(email: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("admin_emails")
      .select("email")
      .ilike("email", email)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

/**
 * Whether the current user (or a given user) is an admin —
 * driven by the `admin_emails` table populated via SQL.
 */
export async function isAdminUser(user: User | null): Promise<boolean> {
  if (!user?.email || !isSupabaseConfigured()) return false;
  const email = user.email.toLowerCase();
  try {
    const emails = await loadAdminEmails();
    if (emails === null) return false;
    return emails.includes(email);
  } catch {
    return directIsAdmin(email);
  }
}

/** Convenience: get the current user AND whether they are admin. */
export async function getAuthContext() {
  const user = await getCurrentUser();
  const admin = await isAdminUser(user);
  return { user, isAdmin: admin };
}
