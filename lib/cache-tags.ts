/**
 * Central registry of Next.js cache tags used by `unstable_cache`.
 *
 * Public data (products, marquees, team, reviews, …) is cached without
 * cookies so a storefront page render costs ZERO Supabase round-trips
 * on a cache hit. Admin save actions call `revalidateTag(...)` with the
 * matching tag so an edit still shows up instantly on the storefront.
 *
 * Keep every tag in this one file — a typo'd string in two places is
 * the classic way a "instant update" silently becomes a 10-minute wait.
 */
export const CACHE_TAGS = {
  /** public.products — home, /products, /products/[slug], sitemap */
  products: "products",
  /** public.product_reviews (+ products.rating aggregate) */
  reviews: "reviews",
  /** public.marquee_items — the promo strip above the navbar */
  marquees: "marquees",
  /** public.team_members — /team, /about */
  team: "team-members",
  /** public.refund_policy — /refund */
  refundPolicy: "refund-policy",
  /** public.admin_emails — the admin whitelist */
  adminEmails: "admin-emails"
} as const;
