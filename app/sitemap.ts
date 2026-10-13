import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

/**
 * Auto-generated sitemap.xml — exposed at /sitemap.xml.
 *
 * Includes every static marketing/auth page plus a fresh entry per
 * product (driven by the products table / mock data).
 *
 * Submit this URL in Google Search Console:
 *   https://YOUR-DOMAIN/sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/cart`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/checkout`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.3 }
  ];

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    productEntries = products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }));
  } catch {
    // Don't break the sitemap if Supabase is briefly unreachable.
  }

  return [...staticEntries, ...productEntries];
}
