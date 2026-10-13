import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  /**
   * Only the routes where middleware actually makes an auth decision.
   *
   * It used to run on every request (`/((?!_next/static|…).*)`) just to
   * end up calling `NextResponse.next()` on the home page, products,
   * cart, about, … — and each of those invocations performed a Supabase
   * `getUser()` round-trip, including for `Link` prefetches. Scoping the
   * matcher means browsing the storefront never enters middleware at all,
   * and the auth routes below still get instant redirects.
   */
  matcher: [
    "/admin/:path*",
    "/checkout",
    "/orders",
    "/orders/:path*",
    "/login",
    "/signup"
  ]
};
