import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Hind_Siliguri } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SiteShell from "@/components/layout/SiteShell";
import TopMarquee from "@/components/promo/TopMarquee";
import Footer from "@/components/layout/Footer";
import { getSiteUrl, SITE } from "@/lib/site";
import "./globals.css";

/*
 * Font diet round 2.
 *
 * We previously shipped 3 families × 7 files: Inter (Latin body),
 * Hind Siliguri (Bengali body) and Noto Serif Bengali (Bengali display
 * headlines). Lighthouse pinpointed the Bengali serif as the dominant
 * LCP cost — the H1 on every page uses `font-display-bn`, so the
 * largest text element waited for that font to download.
 *
 * Now: 2 families × 4 files. Hind Siliguri serves BOTH body and
 * display (700 weight is bold enough for headlines), Inter handles
 * Latin body. `font-display-bn` and `font-display` in tailwind.config
 * resolve to `--font-bangla` (Hind Siliguri) so headlines paint as
 * soon as it's available.
 *
 * Also dropped:
 *   - Inter weight 600 (barely used; 700 covers the bold cases).
 *   - Hind Siliguri "latin" subset (redundant — Inter handles Latin).
 *
 * Net: ~200 KB lighter font payload, ~1 RTT shaved off the LCP path.
 */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-sans"
});
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-bangla"
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  // metadataBase makes every relative og:image / canonical absolute.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name} — চাঁপাইনবাবগঞ্জের সেরা আম`,
    template: `%s — ${SITE.name}`
  },
  description: SITE.longDescription,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: siteUrl }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "shopping",
  keywords: [
    "Chapai Mango House",
    "চাঁপাই ম্যাঙ্গো",
    "চাঁপাইনবাবগঞ্জের আম",
    "চাঁপাইয়ের আম অনলাইনে",
    "আম অনলাইনে কিনুন",
    "Himsagar mango",
    "Langra mango",
    "Khirsapat mango",
    "Fazli mango",
    "Amrapali mango",
    "Gopalbhog mango",
    "buy mango online Bangladesh",
    "GI Khirsapat",
    "Nachole Chapainawabganj",
    "organic mango Bangladesh"
  ],
  alternates: {
    canonical: "/",
    languages: {
      "bn-BD": "/",
      "en-US": "/"
    }
  },
  openGraph: {
    type: "website",
    locale: SITE.defaultLocale,
    url: siteUrl,
    siteName: SITE.name,
    title: `${SITE.name} — চাঁপাইনবাবগঞ্জের সেরা আম`,
    description: SITE.shortDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — চাঁপাইনবাবগঞ্জের গাছপাকা আম`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — চাঁপাইনবাবগঞ্জের সেরা আম`,
    description: SITE.shortDescription,
    images: ["/opengraph-image"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: "/favicon.ico"
  },
  // Search Console / Bing Webmaster verification.
  //
  // We support TWO Search Console verification methods at once because
  // every operator hits a different gotcha:
  //
  //   1) DNS TXT record — the operator adds
  //        google-site-verification=<token>
  //      to their domain's DNS zone. Most reliable for custom domains
  //      and never expires. Doesn't need any code change to work.
  //
  //   2) HTML meta tag — Google reads the
  //        <meta name="google-site-verification" content="<token>" />
  //      we render below. Works regardless of DNS, useful as a backup
  //      while DNS propagation is still settling.
  //
  // The hard-coded fallback is the same token currently set as the
  // operator's DNS TXT record on dealhub2026.shop, so HTML-tag
  // verification picks up the slack if the TXT record is misconfigured
  // or hasn't propagated yet. Setting NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  // in Railway overrides this default.
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
      "9l1HBSx0SpXFJUDl4Eq4YJ2CoOPA41pJO04mTiEd_20",
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${hindSiliguri.variable}`}
    >
      <body className="min-h-screen bg-cream text-ink">
        <SiteShell
          topMarquee={
            <Suspense
              fallback={
                /*
                 * Height-matched skeleton so the marquee streaming in
                 * doesn't push the navbar/hero down. Keeps CLS at 0
                 * while letting the rest of the page render without
                 * waiting for the Supabase round-trip.
                 */
                <div
                  aria-hidden
                  className="bg-gradient-to-r from-mango-700 via-mango-500 to-mango-700 border-b border-mango-800/30 h-[44px] sm:h-[52px]"
                />
              }
            >
              <TopMarquee />
            </Suspense>
          }
          footer={<Footer />}
        >
          {children}
        </SiteShell>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#fff7e8",
              color: "#1a0f00",
              border: "1px solid #ffdc80",
              fontFamily: "var(--font-bangla), var(--font-sans)"
            }
          }}
        />
      </body>
    </html>
  );
}
