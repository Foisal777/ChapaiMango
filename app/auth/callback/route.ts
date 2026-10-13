import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * OAuth callback handler for Supabase social providers (e.g. Google).
 *
 * Flow:
 *   1. User clicks "Continue with Google" on /login or /signup.
 *   2. Browser hits Supabase -> Google -> Supabase, then is redirected
 *      back here with a `?code=...` query param.
 *   3. We exchange that code for a session cookie and bounce the user
 *      to the original `next` destination (defaults to /orders).
 *
 * Railway/Vercel/any-proxy note:
 *   `request.url` reflects the URL as the framework sees it *behind*
 *   the proxy (e.g. http://0.0.0.0:8080/...). For the final redirect we
 *   must use the public origin, which we read from the `x-forwarded-*`
 *   headers when present. Without this fix users land on 0.0.0.0:8080
 *   after Google sign-in and get ERR_CONNECTION_REFUSED.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/orders";

  // Only follow same-origin paths to avoid open-redirect abuse.
  const safeNext = next.startsWith("/") ? next : "/orders";

  // Resolve the *public* origin even when running behind a proxy
  // (Railway routes traffic to the app on 0.0.0.0:PORT internally).
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const publicOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : url.origin;

  if (code && isSupabaseConfigured()) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, publicOrigin));
    }
    // Surface the provider error on the login page so the user sees it.
    const failed = new URL("/login", publicOrigin);
    failed.searchParams.set("error", error.message);
    return NextResponse.redirect(failed);
  }

  // Missing code or Supabase not configured -> back to login.
  return NextResponse.redirect(new URL("/login", publicOrigin));
}
