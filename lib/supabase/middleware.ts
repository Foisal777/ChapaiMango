import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const ADMIN_PREFIX = "/admin";
const ADMIN_LOGIN = "/admin/login";

// Customer pages that require any signed-in user.
const CUSTOMER_PROTECTED = ["/checkout", "/orders"];

// Customer auth pages — signed-in users are bounced away from these.
const CUSTOMER_AUTH_PAGES = ["/login", "/signup"];

/**
 * Matches `sb-<project-ref>-auth-token` plus the chunked `.0`, `.1`, …
 * variants @supabase/ssr writes when a session is too big for one cookie.
 * If none of these cookies is present there is no session to validate.
 */
const AUTH_COOKIE_RE = /^sb-.*-auth-token(\.\d+)?$/;

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("YOUR-PROJECT"));
}

const matches = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(p + "/"));

/**
 * True only for the handful of routes where middleware actually has to
 * make an auth decision (see the matcher in middleware.ts). It also acts
 * as a safety net: if that matcher is ever widened, routes that don't
 * need a decision still skip the Supabase round-trip.
 */
function routeNeedsAuthDecision(path: string) {
  return (
    matches(path, [ADMIN_PREFIX]) ||
    matches(path, CUSTOMER_PROTECTED) ||
    CUSTOMER_AUTH_PAGES.includes(path)
  );
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Not configured (fresh clone / dev) — nothing to validate.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  const needsDecision = routeNeedsAuthDecision(path);
  const isAdminRoute = matches(path, [ADMIN_PREFIX]);
  const isAdminLogin = path === ADMIN_LOGIN;

  /*
   * FAST PATH #1 — anonymous visitor (no auth cookie at all).
   *
   * This is the vast majority of traffic: first visits, logged-out
   * shoppers, every crawler, and every `Link` prefetch. Previously we
   * called `supabase.auth.getUser()` here — a full HTTPS round-trip to
   * Supabase on every single request, including prefetches — which is
   * what made navigation feel sluggish. With no session cookie there is
   * nothing to validate, so we decide from the cookie jar alone.
   */
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => AUTH_COOKIE_RE.test(c.name));

  if (!hasAuthCookie) {
    if (isAdminRoute && !isAdminLogin) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    if (matches(path, CUSTOMER_PROTECTED)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    // Public page (or /login, /signup) — straight through, zero network.
    return NextResponse.next({ request });
  }

  /*
   * FAST PATH #2 — a route that doesn't need an auth decision (nothing in
   * the current matcher, but kept so widening the matcher can't silently
   * re-introduce a Supabase round-trip on public pages). The browser
   * client refreshes its own token in the background, so there is nothing
   * to validate here.
   */
  if (!needsDecision) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isCustomerProtected = matches(path, CUSTOMER_PROTECTED);
  const isCustomerAuth = CUSTOMER_AUTH_PAGES.includes(path);

  // 1) /admin/* (except /admin/login) requires an authenticated session.
  //    Admin role is enforced inside app/admin/layout.tsx via is_admin().
  if (isAdminRoute && !isAdminLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN;
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // 2) Already logged in -> bounce away from /admin/login.
  if (isAdminLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_PREFIX;
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  // 3) /checkout and /orders require a signed-in customer.
  if (isCustomerProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // 4) Already logged in -> /login and /signup redirect to /orders.
  if (isCustomerAuth && user) {
    const url = request.nextUrl.clone();
    url.pathname =
      typeof request.nextUrl.searchParams.get("next") === "string"
        ? request.nextUrl.searchParams.get("next") || "/orders"
        : "/orders";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
