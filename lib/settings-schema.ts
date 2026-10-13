/**
 * Operator-editable site settings — shared, client-safe definitions.
 *
 * This file has NO env reads and NO server imports, so both the admin
 * form (client) and the server action / loaders can import it.
 *
 * Source of truth at runtime is the `site_settings` table (edited from
 * /admin/settings). `lib/settings.ts` merges that row over env-var
 * defaults and built-in defaults.
 */
import { z } from "zod";
import type { PaymentMethod } from "@/types";

export const PAYMENT_METHOD_CODES: PaymentMethod[] = [
  "cod",
  "bkash",
  "nagad",
  "rocket",
  "upay",
  "bank"
];

export type MethodSettings = {
  /** Show this method on checkout. */
  enabled: boolean;
  /** Receiving MFS number (ignored for bank). */
  number: string;
  /** Fixed BDT amount due up front. 0 = nothing up front. */
  advance: number;
  /** Custom helper text. Blank = built-in default text. */
  instructions: string;
};

export type BankSettings = {
  holder: string;
  bankName: string;
  branch: string;
  accountNumber: string;
};

export type SiteSettings = {
  brand: {
    name: string;
    nameBn: string;
    shortDescription: string;
    longDescription: string;
  };
  contact: {
    phone: string;
    /** International digits only, e.g. 8801XXXXXXXXX. Blank = use phone. */
    whatsapp: string;
    email: string;
    address: string;
    mapLabel: string;
    mapLat: number;
    mapLng: number;
  };
  social: {
    facebook: string;
    tiktok: string;
    instagram: string;
    youtube: string;
  };
  commerce: {
    /** Flat delivery fee (BDT). 0 = always free. */
    deliveryFee: number;
    /** Subtotal (BDT) at/above which delivery is free. 0 = never free. */
    freeDeliveryOver: number;
    /** Minimum total kg across the cart. 0 = no minimum. */
    minOrderKg: number;
  };
  payments: {
    methods: Record<PaymentMethod, MethodSettings>;
    bank: BankSettings;
  };
  home: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
  };
  seo: {
    /** Comma-separated keywords for <meta name="keywords"> and JSON-LD. */
    keywords: string;
    googleVerification: string;
    bingVerification: string;
  };
};

// ─────────────────────────────────────────────────────────────────
// Validation (used by the admin server action before saving)
// ─────────────────────────────────────────────────────────────────

const text = (max: number) => z.string().trim().max(max);
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), {
    message: "Link https:// diye shuru hote hobe"
  });
const money = z.coerce.number().min(0, "0 ba tar beshi hote hobe").max(1_000_000);

const methodSchema = z.object({
  enabled: z.boolean(),
  number: text(60),
  advance: money,
  instructions: text(300)
});

export const siteSettingsSchema = z.object({
  brand: z.object({
    name: text(80).min(1, "Brand name dorkar"),
    nameBn: text(120),
    shortDescription: text(240),
    longDescription: text(1000)
  }),
  contact: z.object({
    phone: text(40),
    whatsapp: text(20).refine((v) => v === "" || /^\d{10,15}$/.test(v), {
      message: "WhatsApp number shudhu digits, country code shoho (8801…)"
    }),
    email: text(120).refine((v) => v === "" || /^\S+@\S+\.\S+$/.test(v), {
      message: "Email thik nei"
    }),
    address: text(200),
    mapLabel: text(120),
    mapLat: z.coerce.number().min(-90).max(90),
    mapLng: z.coerce.number().min(-180).max(180)
  }),
  social: z.object({
    facebook: optionalUrl,
    tiktok: optionalUrl,
    instagram: optionalUrl,
    youtube: optionalUrl
  }),
  commerce: z.object({
    deliveryFee: money,
    freeDeliveryOver: money,
    minOrderKg: money
  }),
  payments: z.object({
    methods: z.object({
      cod: methodSchema,
      bkash: methodSchema,
      nagad: methodSchema,
      rocket: methodSchema,
      upay: methodSchema,
      bank: methodSchema
    }),
    bank: z.object({
      holder: text(100),
      bankName: text(100),
      branch: text(100),
      accountNumber: text(60)
    })
  }),
  home: z.object({
    heroBadge: text(80),
    heroTitle: text(120),
    heroSubtitle: text(300)
  }),
  seo: z.object({
    keywords: text(1000),
    googleVerification: text(120),
    bingVerification: text(120)
  })
});

/** Deep-merge `patch` over `base`. Keeps base keys the patch omits and
 *  ignores patch values whose type doesn't match the base value, so a
 *  stale or partial DB row can never break the page. */
export function mergeSettings<T>(base: T, patch: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return (typeof patch === typeof base && patch !== null
      ? patch
      : base) as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(base as Record<string, unknown>)) {
    if (key in patch) {
      out[key] = mergeSettings(
        (base as Record<string, unknown>)[key],
        (patch as Record<string, unknown>)[key]
      );
    }
  }
  return out as T;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
