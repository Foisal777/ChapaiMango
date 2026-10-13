"use client";

import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/*
 * Shared client-side auth helpers.
 *
 * Everything the navbar/user-menu/admin-sidebar needs, in one place, so
 * that all three components share:
 *   - one local session read (no network round-trip per component),
 *   - one `admin_emails` lookup per email (memoised),
 *   - one bullet-proof sign-out.
 */

/** `sb-<project-ref>-auth-token` plus the chunked `.0`, `.1`, … variants. */
const AUTH_COOKIE_RE = /^sb-.*-auth-token(\.\d+)?$/;

/**
 * Read the session from local storage/cookies — deliberately NOT
 * `getUser()`, which spends a network round-trip to Supabase on every
 * page load just to render an avatar. RLS plus the server-side checks in
 * `app/admin/layout.tsx` remain the real gate.
 */
export async function getSessionUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Every mounted auth consumer (navbar, user menu, admin sidebar) is
 * registered here so that `signOutClient()` can flip them all to
 * "signed out" itself, without waiting for Supabase.
 */
const listeners = new Set<(user: User | null) => void>();

/**
 * Subscribes to auth changes and immediately emits the current user.
 * Returns an unsubscribe function (safe to call with nothing to clean up).
 */
export function subscribeToAuth(cb: (user: User | null) => void): () => void {
  if (!isSupabaseConfigured()) return () => {};
  const supabase = createClient();
  let disposed = false;

  const emit = (user: User | null) => {
    if (!disposed) cb(user);
  };

  listeners.add(emit);

  getSessionUser().then(emit);

  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    emit(session?.user ?? null);
  });

  return () => {
    disposed = true;
    listeners.delete(emit);
    sub.subscription.unsubscribe();
  };
}

// ----- admin whitelist (memoised) -----

const ADMIN_TTL_MS = 5 * 60 * 1000;
const adminCache = new Map<string, { at: number; value: Promise<boolean> }>();

/**
 * Is this email on the admin whitelist? Memoised per email for 5 minutes
 * so the navbar and the user menu don't each fire the same query on
 * every page load. (Was 2 extra Supabase round-trips per page view.)
 */
export function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  if (!email || !isSupabaseConfigured()) return Promise.resolve(false);
  const key = email.toLowerCase();

  const hit = adminCache.get(key);
  if (hit && Date.now() - hit.at < ADMIN_TTL_MS) return hit.value;

  const value = (async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("admin_emails")
        .select("email")
        .ilike("email", key)
        .maybeSingle();
      return !!data;
    } catch {
      adminCache.delete(key); // never cache a failure
      return false;
    }
  })();

  adminCache.set(key, { at: Date.now(), value });
  return value;
}

// ----- sign out -----

/**
 * Expire every Supabase auth cookie for this project (all chunks).
 *
 * This is the safety net that makes sign-out *always* work: the previous
 * implementation awaited `supabase.auth.signOut({ scope: "global" })`,
 * which calls Supabase BEFORE clearing the local session — so on a slow
 * or flaky connection the request hung, the session survived, and the
 * user only appeared signed out after a manual page reload.
 */
function expireAuthCookies() {
  if (typeof document === "undefined") return;
  const jar = document.cookie ? document.cookie.split(";") : [];
  for (const part of jar) {
    const name = part.split("=")[0]?.trim();
    if (!name || !AUTH_COOKIE_RE.test(name)) continue;
    document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  }
}

/** Fire-and-forget server-side revocation of the refresh token. */
function revokeRefreshToken(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  // `keepalive` lets the request finish even if we navigate away.
  void fetch(`${url}/auth/v1/logout?scope=global`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
    keepalive: true
  }).catch(() => {
    /* offline or already invalid — the local session is gone regardless */
  });
}

/**
 * Sign the current visitor out — instantly and unconditionally.
 *
 * Order matters:
 *   1. read the token locally (so we can still revoke it in the background)
 *   2. expire the auth cookies — the guaranteed, network-free part
 *   3. tell every auth consumer on the page that we're signed out, so the
 *      avatar/menu flip immediately
 *   4. local `signOut()` — now a purely local call that also fires
 *      `SIGNED_OUT` for any listener we don't own
 *   5. best-effort global revoke in the background
 *
 * The caller never waits on Supabase for more than a moment, so sign-out
 * cannot hang the way the old server-action version did.
 */
export async function signOutClient(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();

  let accessToken: string | null = null;
  try {
    // Never let a stalled session read (or a locked storage mutex in
    // another tab) hold up the sign-out itself.
    const { data } = await withTimeout(supabase.auth.getSession(), 1500);
    accessToken = data?.session?.access_token ?? null;
  } catch {
    /* unreadable session — the cookie sweep below still signs us out */
  }

  expireAuthCookies();

  for (const notify of listeners) {
    try {
      notify(null);
    } catch {
      /* a listener throwing must not block the others */
    }
  }

  try {
    await withTimeout(supabase.auth.signOut({ scope: "local" }), 1500);
  } catch {
    /* already gone — nothing left to do locally */
  }

  if (accessToken) revokeRefreshToken(accessToken);
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_resolve, reject) =>
      setTimeout(() => reject(new Error("auth-timeout")), ms)
    )
  ]);
}
