import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/**
 * /robots.txt — tells search engine crawlers what they may visit.
 *
 * We allow the public marketing/storefront pages and explicitly block
 * the admin dashboard and API routes (those are not useful in search
 * results and could leak sensitive paths).
 */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api", "/api/", "/auth/callback"]
      }
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base
  };
}
