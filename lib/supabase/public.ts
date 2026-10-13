import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for PUBLIC reads.
 *
 * Why this exists (performance):
 *   The regular server client (`@/lib/supabase/server`) calls `cookies()`,
 *   which makes every route that touches it dynamic *and* un-cacheable —
 *   so `getProducts()` used to hit Supabase on every single page view.
 *
 *   This client never touches `cookies()`, which is exactly what
 *   `unstable_cache` requires. Public loaders therefore run at most once
 *   per revalidate window (and are busted instantly by `revalidateTag`
 *   from the admin actions).
 *
 * Security: only the anon key is used, so row level security is still
 * the single source of truth for what is readable. Never use this for
 * anything user-specific.
 */
export function isPublicDataConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("YOUR-PROJECT"));
}

let cached: SupabaseClient | null = null;

/** Returns a shared, cookie-free anon client — or null in dev/unconfigured. */
export function createPublicClient(): SupabaseClient | null {
  if (!isPublicDataConfigured()) return null;
  if (cached) return cached;

  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        headers: { "X-Client-Info": "chapai-mango/public-read" }
      }
    }
  );

  return cached;
}
