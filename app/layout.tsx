import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Hind_Siliguri } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SiteShell from "@/components/layout/SiteShell";
import TopMarquee from "@/components/promo/TopMarquee";
import Footer from "@/components/layout/Footer";
import { getSiteUrl, SITE } from "@/lib/site";
import { getSiteSettings } from "@/lib/settings";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
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

/**
 * Metadata is generated from the operator-managed site settings, so the
 * SEO title / description / keywords / verification tokens can be changed
 * from /admin/settings without a redeploy.
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const brandTitle = `${s.brand.name} — চাঁপাইনবাবগঞ্জের সেরা আম`;
  const keywords = s.seo.keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    // metadataBase makes every relative og:image / canonical absolute.
    metadataBase: new URL(siteUrl),
    title: {
      default: brandTitle,
      template: `%s — ${s.brand.name}`
    },
    description: s.brand.longDescription,
    applicationName: s.brand.name,
    authors: [{ name: s.brand.name, url: siteUrl }],
    creator: s.brand.name,
    publisher: s.brand.name,
    category: "shopping",
    keywords,
    alternates: {
      canonical: "/",
      languages: {
        "bn-BD": "/"
      }
    },
    openGraph: {
      type: "website",
      locale: SITE.defaultLocale,
      url: siteUrl,
      siteName: s.brand.name,
      title: brandTitle,
      description: s.brand.shortDescription,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${s.brand.name} — চাঁপাইনবাবগঞ্জের গাছপাকা আম`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: brandTitle,
      description: s.brand.shortDescription,
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
      icon: "/icon",
      apple: "/apple-icon"
    },
    manifest: "/manifest.webmanifest",
    // Search Console / Bing Webmaster verification tokens (set in
    // /admin/settings → SEO). Blank tokens are simply not rendered.
    verification: {
      google: s.seo.googleVerification || undefined,
      other: s.seo.bingVerification
        ? { "msvalidate.01": s.seo.bingVerification }
        : undefined
    }
  };
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="bn"
      className={`${inter.variable} ${hindSiliguri.variable}`}
    >
      <body className="min-h-screen bg-cream text-ink">
        <SettingsProvider value={settings}>
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
        </SettingsProvider>
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
