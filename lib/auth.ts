import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Returns the currently signed-in user (server-side), or null.
 * Safe to call from any server component or server action.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user ?? null;
}

/**
 * Whether the current user (or a given user) is an admin —
 * driven by the `admin_emails` table populated via SQL.
 */
export async function isAdminUser(user: User | null): Promise<boolean> {
  if (!user?.email || !isSupabaseConfigured()) return false;
  const supabase = createClient();
  const { data } = await supabase
    .from("admin_emails")
    .select("email")
    .ilike("email", user.email)
    .maybeSingle();
  return !!data;
}

/** Convenience: get the current user AND whether they are admin. */
export async function getAuthContext() {
  const user = await getCurrentUser();
  const admin = await isAdminUser(user);
  return { user, isAdmin: admin };
}
