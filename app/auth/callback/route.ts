import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * OAuth + password-recovery callback for Supabase.
 *
 * Two flows land here with a `?code=...` query param:
 *
 *   1. Google OAuth — the user clicks "Continue with Google" on
 *      /login or /signup, bounces through Google, and returns here.
 *
 *   2. Password recovery — the user clicks the link in the reset
 *      email. GoTrue verifies the recovery token and redirects to our
 *      `redirectTo` (set to /auth/callback?next=/reset-password) with
 *      a PKCE code. We exchange it for a session and open
 *      /reset-password, where the user picks the new password.
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
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") || "/orders";

  // Only follow same-origin paths to avoid open-redirect abuse.
  const safeNext = next.startsWith("/") ? next : "/orders";

  // Recovery detection: GoTrue marks the link with type=recovery and
  // we also pass next=/reset-password from /forgot-password.
  const isRecovery = type === "recovery" || safeNext === "/reset-password";
  const target = isRecovery ? "/reset-password" : safeNext;

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
      return NextResponse.redirect(new URL(target, publicOrigin));
    }
    // Surface the error on the page the user expects to be on.
    const failed = new URL(target, publicOrigin);
    failed.searchParams.set("error", error.message);
    return NextResponse.redirect(failed);
  }

  // Missing code (or Supabase not configured) -> back to the entry page.
  // The /reset-password page shows its own "link not valid" state, so
  // no error param is needed here.
  return NextResponse.redirect(new URL(isRecovery ? "/reset-password" : "/login", publicOrigin));
}
