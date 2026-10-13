/**
 * Server-side loader for operator-editable site settings.
 *
 * Resolution order (per field):
 *   1. `site_settings` row (saved from /admin/settings)
 *   2. environment variable (Railway / Vercel) — legacy setups keep working
 *   3. built-in default
 *
 * The merged result is cached with `unstable_cache` under the tag
 * `site-settings`. The admin save action calls `revalidateTag` so the
 * storefront picks up changes immediately, without waiting for the
 * hourly revalidate window.
 *
 * Uses the anon key WITHOUT cookies on purpose: it's a public read, and
 * keeping cookies() out of this path lets pages (and the root layout)
 * stay statically cacheable.
 */
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { SITE } from "@/lib/site";
import {
  mergeSettings,
  PAYMENT_METHOD_CODES,
  type SiteSettings
} from "@/lib/settings-schema";
import type { PaymentMethod } from "@/types";

export const SETTINGS_TAG = "site-settings";

const DEFAULT_KEYWORDS = [
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
].join(", ");

const env = (key: string) => (process.env[key] ?? "").trim();

function envNumber(key: string, fallback: number): number {
  const raw = env(key);
  if (raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function envPaymentMethods(): PaymentMethod[] {
  const raw = env("NEXT_PUBLIC_PAYMENT_METHODS");
  if (!raw) return [...PAYMENT_METHOD_CODES];
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase() as PaymentMethod)
    .filter((m) => PAYMENT_METHOD_CODES.includes(m));
  return list.length > 0 ? list : [...PAYMENT_METHOD_CODES];
}

/** Built-in defaults, overridden by the legacy env vars when present. */
export function envDefaultSettings(): SiteSettings {
  const enabled = envPaymentMethods();
  const numberFor: Record<PaymentMethod, string> = {
    cod: env("NEXT_PUBLIC_COD_NUMBER"),
    bkash: env("NEXT_PUBLIC_BKASH_NUMBER"),
    nagad: env("NEXT_PUBLIC_NAGAD_NUMBER"),
    rocket: env("NEXT_PUBLIC_ROCKET_NUMBER"),
    upay: env("NEXT_PUBLIC_UPAY_NUMBER"),
    bank: env("NEXT_PUBLIC_BANK_NUMBER")
  };
  const advanceFor: Record<PaymentMethod, number> = {
    cod: envNumber("NEXT_PUBLIC_COD_ADVANCE", 0),
    bkash: envNumber("NEXT_PUBLIC_BKASH_ADVANCE", 0),
    nagad: envNumber("NEXT_PUBLIC_NAGAD_ADVANCE", 0),
    rocket: envNumber("NEXT_PUBLIC_ROCKET_ADVANCE", 0),
    upay: envNumber("NEXT_PUBLIC_UPAY_ADVANCE", 0),
    bank: envNumber("NEXT_PUBLIC_BANK_ADVANCE", 0)
  };

  const methods = {} as SiteSettings["payments"]["methods"];
  for (const code of PAYMENT_METHOD_CODES) {
    methods[code] = {
      enabled: enabled.includes(code),
      number: numberFor[code],
      advance: advanceFor[code],
      instructions: code === "cod" ? env("NEXT_PUBLIC_COD_INSTRUCTIONS") : ""
    };
  }

  const phone = env("NEXT_PUBLIC_BUSINESS_PHONE") || "+880 1XXX-XXXXXX";

  return {
    brand: {
      name: SITE.name,
      nameBn: SITE.nameBn,
      shortDescription: SITE.shortDescription,
      longDescription: SITE.longDescription
    },
    contact: {
      phone,
      whatsapp: env("NEXT_PUBLIC_WHATSAPP_NUMBER") || env("NEXT_PUBLIC_BUSINESS_PHONE"),
      email: env("NEXT_PUBLIC_BUSINESS_EMAIL") || "hello@chapaimangohouse.com",
      address: "নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ",
      mapLabel:
        env("NEXT_PUBLIC_BUSINESS_MAP_LABEL") ||
        "নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ",
      mapLat: Number(env("NEXT_PUBLIC_BUSINESS_MAP_LAT")) || 24.7011,
      mapLng: Number(env("NEXT_PUBLIC_BUSINESS_MAP_LNG")) || 88.35
    },
    social: {
      facebook:
        env("NEXT_PUBLIC_FACEBOOK_URL") ||
        "https://www.facebook.com/share/1E8A9tnY4U/",
      tiktok:
        env("NEXT_PUBLIC_TIKTOK_URL") || "https://www.tiktok.com/@chapai_mango",
      instagram: "",
      youtube: ""
    },
    commerce: {
      deliveryFee: envNumber("NEXT_PUBLIC_DELIVERY_FEE", 120),
      freeDeliveryOver: envNumber("NEXT_PUBLIC_FREE_DELIVERY_OVER", 2000),
      minOrderKg: envNumber("NEXT_PUBLIC_MIN_ORDER_KG", 10)
    },
    payments: {
      methods,
      bank: {
        holder: env("NEXT_PUBLIC_BANK_HOLDER") || "MD FOISAL IQBAL",
        bankName: env("NEXT_PUBLIC_BANK_NAME") || "AB BANK",
        branch: env("NEXT_PUBLIC_BANK_BRANCH") || "RAJSHAHI",
        accountNumber: env("NEXT_PUBLIC_BANK_ACCOUNT_NUMBER")
      }
    },
    home: {
      heroBadge: "GI-ট্যাগ পাওয়া ক্ষীরসাপাত পাওয়া যাচ্ছে",
      heroTitle: "চাঁপাইনবাবগঞ্জের বাগান থেকে সরাসরি আপনার দরজায়",
      heroSubtitle:
        "গাছপাকা, কেমিক্যাল-মুক্ত, হাতে বাছাই করা আম — হিমসাগর, ল্যাংড়া, ক্ষীরসাপাত, ফজলি, আম্রপালি, গোপালভোগ। ঐতিহ্যবাহী জাত থেকে হাইব্রিড, সবকিছু এক জায়গায়।"
    },
    seo: {
      keywords: DEFAULT_KEYWORDS,
      googleVerification:
        env("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION") ||
        "9l1HBSx0SpXFJUDl4Eq4YJ2CoOPA41pJO04mTiEd_20",
      bingVerification: env("NEXT_PUBLIC_BING_SITE_VERIFICATION")
    }
  };
}

/** Reads the single `site_settings` row. Returns null on any failure so
 *  the storefront always falls back to env / defaults. */
async function fetchStoredSettings(): Promise<unknown> {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !key || url.includes("YOUR-PROJECT")) return null;
  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data, error } = await supabase
      .from("site_settings")
      .select("data")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return null;
    return data.data;
  } catch {
    return null;
  }
}

async function loadSettings(): Promise<SiteSettings> {
  const stored = await fetchStoredSettings();
  return mergeSettings(envDefaultSettings(), stored ?? {});
}

/**
 * Cached, tag-revalidated settings. Use this everywhere on the server
 * (layouts, pages, server components, metadata, sitemap).
 */
export const getSiteSettings = unstable_cache(loadSettings, ["site-settings"], {
  tags: [SETTINGS_TAG],
  revalidate: 3600
});
