/**
 * Resolve the canonical public site URL.
 *
 * Priority:
 *   1. NEXT_PUBLIC_SITE_URL — explicit override (recommended for production).
 *   2. RAILWAY_PUBLIC_DOMAIN / VERCEL_URL — auto-set by the host.
 *   3. localhost fallback for dev.
 *
 * Always returns an https URL with no trailing slash so it can be safely
 * concatenated with paths like `${siteUrl}/products`.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return stripTrailingSlash(explicit);

  const railway = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (railway) return `https://${railway}`;

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Brand metadata used across SEO surfaces (sitemap, JSON-LD, OG). */
export const SITE = {
  name: "Chapai Mango House",
  nameBn: "চাঁপাই ম্যাঙ্গো হাউস",
  shortDescription:
    "চাঁপাইনবাবগঞ্জের গাছপাকা, কেমিক্যাল-মুক্ত আম সরাসরি আপনার দরজায়।",
  longDescription:
    "Chapai Mango House — চাঁপাইনবাবগঞ্জের নিজামপুর, নাচোল থেকে সরাসরি আপনার দরজায় গাছপাকা ও কেমিক্যাল-মুক্ত আম। হিমসাগর, ল্যাংড়া, ক্ষীরসাপাত, ফজলি, আম্রপালি, গোপালভোগ — সব জাত এক জায়গায়।",
  defaultLocale: "bn_BD",
  twitterHandle: "@chapai_mango"
} as const;
