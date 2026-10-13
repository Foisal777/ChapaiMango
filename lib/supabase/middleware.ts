import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const ADMIN_PREFIX = "/admin";
const ADMIN_LOGIN = "/admin/login";

// Customer pages that require any signed-in user.
const CUSTOMER_PROTECTED = ["/checkout", "/orders"];

// Customer auth pages — signed-in users are bounced away from these.
const CUSTOMER_AUTH_PAGES = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // If Supabase isn't configured, skip auth (so dev still works)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR-PROJECT")
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith(ADMIN_PREFIX);
  const isAdminLogin = path === ADMIN_LOGIN;
  const isCustomerProtected = CUSTOMER_PROTECTED.some(
    (p) => path === p || path.startsWith(p + "/")
  );
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
