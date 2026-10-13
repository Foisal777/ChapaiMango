/**
 * Commerce helpers (delivery fee, payment methods, minimum order).
 *
 * All values now come from the operator-managed site settings
 * (/admin/settings → `SiteSettings`), read in components via the
 * `useSettings()` hook or on the server via `getSiteSettings()`.
 * These helpers are pure: they take the relevant settings slice as an
 * argument, so they're safe to use in both client and server code.
 */
import type { PaymentMethod } from "@/types";
import {
  PAYMENT_METHOD_CODES,
  type SiteSettings
} from "@/lib/settings-schema";

export type CommerceSettings = SiteSettings["commerce"];
export type PaymentSettings = SiteSettings["payments"];

/** Structured bank details, shown as a labelled block on checkout. */
export type BankAccountInfo = {
  /** Account holder name (e.g. "MD FOISAL IQBAL"). */
  holder: string;
  /** Bank name (e.g. "AB BANK"). */
  bankName: string;
  /** Branch (e.g. "RAJSHAHI"). */
  branch: string;
  /** Account number — digits + optional dashes. */
  accountNumber: string;
};

export type PaymentMethodInfo = {
  /** Built-in code (cod/bkash/…) or an admin-created custom code. */
  code: string;
  /** Bangla label shown on the checkout card. */
  label: string;
  /** Single-line summary for receipts / track-order. */
  accountNumber: string;
  /** Fixed BDT amount required up front (0 = no advance). */
  advance: number;
  /** Helper text shown under the selected card. */
  instructions: string;
  /** Optional logo (gallery upload / URL) for checkout + footer. */
  logoUrl?: string;
  /** Custom methods: also listed in the footer "We Accept" strip. */
  showInFooter?: boolean;
  /** Structured bank details, present ONLY when code === 'bank'. */
  bankDetails?: BankAccountInfo;
};

/** Default labels + instructions per method (used when the operator
 *  leaves the instructions field blank). */
const METHOD_DEFAULTS: Record<PaymentMethod, { label: string; instructions: string }> =
  {
    cod: {
      label: "ক্যাশ অন ডেলিভারি",
      instructions: "পণ্য পেয়ে কুরিয়ারের কাছে নগদ পরিশোধ করুন।"
    },
    bkash: {
      label: "bKash",
      instructions:
        "উপরের নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।"
    },
    nagad: {
      label: "Nagad",
      instructions:
        "উপরের নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।"
    },
    rocket: {
      label: "Rocket",
      instructions:
        "উপরের নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।"
    },
    upay: {
      label: "Upay",
      instructions:
        "উপরের Upay নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।"
    },
    bank: {
      label: "ব্যাংক ট্রান্সফার",
      instructions:
        "এই অ্যাকাউন্টে ফান্ড ট্রান্সফার করুন এবং ট্রান্সফার রেফারেন্স ফর্মে দিন।"
    }
  };

/**
 * Sensible default helper text for COD when the operator has set an
 * advance > 0 but hasn't written their own instructions.
 */
const COD_WITH_ADVANCE_DEFAULT_INSTRUCTIONS =
  "অগ্রিম bKash / Nagad / Rocket — যেকোনো রেলে এই নম্বরে Send Money করুন এবং TrxID দিন। বাকি টাকা পণ্য পেয়ে কুরিয়ারের কাছে নগদ পরিশোধ করুন।";

/**
 * The delivery fee that applies to the given cart subtotal.
 *   deliveryFee = 0            -> always free
 *   freeDeliveryOver = 0       -> never free
 *   subtotal >= freeDeliveryOver -> free for that order
 */
export function calcDeliveryFee(subtotal: number, c: CommerceSettings): number {
  if (c.deliveryFee <= 0) return 0;
  if (c.freeDeliveryOver > 0 && subtotal >= c.freeDeliveryOver) return 0;
  return c.deliveryFee;
}

/** Sum of `quantity_kg` across cart items. */
export function totalCartKg(items: { quantity_kg: number }[]): number {
  return items.reduce((sum, i) => sum + (i.quantity_kg || 0), 0);
}

/** Single-line bank summary for places without room for a 4-row block. */
export function formatBankSummary(info: BankAccountInfo): string {
  const parts: string[] = [];
  if (info.holder) parts.push(`Holder: ${info.holder}`);
  if (info.bankName) parts.push(info.bankName);
  if (info.branch) parts.push(`Branch: ${info.branch}`);
  if (info.accountNumber) parts.push(`A/C: ${info.accountNumber}`);
  return parts.join(" · ");
}

/** Full info bundle for a single payment method. */
export function paymentMethodInfo(
  p: PaymentSettings,
  code: string
): PaymentMethodInfo {
  const custom = (p.customMethods ?? []).find((m) => m.code === code);
  if (custom) {
    return {
      code: custom.code,
      label: custom.label,
      accountNumber: (custom.number || "").trim(),
      advance: custom.advance ?? 0,
      instructions: (custom.instructions || "").trim() ||
        "উপরের নম্বরে/অ্যাকাউন্টে পেমেন্ট করুন → TrxID + sender number ফর্মে দিন।",
      logoUrl: custom.logoUrl || undefined,
      showInFooter: custom.showInFooter
    };
  }
  const builtin = code as PaymentMethod;
  const def = METHOD_DEFAULTS[builtin] ?? METHOD_DEFAULTS.cod;
  const m = p.methods[builtin];
  const override = (m?.instructions || "").trim();
  const advance = m?.advance ?? 0;

  // COD's default text is wrong when an advance is required, so swap in
  // the advance-aware text. An operator override always wins.
  const instructions =
    override ||
    (code === "cod" && advance > 0
      ? COD_WITH_ADVANCE_DEFAULT_INSTRUCTIONS
      : def.instructions);

  if (code === "bank") {
    const bank: BankAccountInfo = { ...p.bank };
    return {
      code,
      label: def.label,
      accountNumber: formatBankSummary(bank),
      advance,
      instructions,
      bankDetails: bank
    };
  }
  return {
    code,
    label: def.label,
    accountNumber: (m?.number || "").trim(),
    advance,
    instructions
  };
}

/** All ENABLED methods: built-ins in canonical order, then admin-created customs. */
export function getEnabledPaymentMethodsInfo(
  p: PaymentSettings
): PaymentMethodInfo[] {
  const builtins = PAYMENT_METHOD_CODES.filter((c) => p.methods[c]?.enabled).map((c) =>
    paymentMethodInfo(p, c)
  );
  const customs = (p.customMethods ?? []).filter((m) => m.enabled).map((m) => paymentMethodInfo(p, m.code));
  return [...builtins, ...customs];
}

export function isPaymentMethodEnabled(
  p: PaymentSettings,
  method: string
): boolean {
  if ((PAYMENT_METHOD_CODES as string[]).includes(method)) {
    return Boolean(p.methods[method as PaymentMethod]?.enabled);
  }
  return Boolean((p.customMethods ?? []).find((m) => m.code === method)?.enabled);
}

/** First enabled payment method — used as the form default. */
export function defaultPaymentMethod(p: PaymentSettings): string {
  return getEnabledPaymentMethodsInfo(p)[0]?.code ?? "cod";
}

/**
 * How much the customer has to pay RIGHT NOW for this method.
 * 0 means classic COD (pay full on delivery).
 */
export function amountToSendNow(info: PaymentMethodInfo, total: number): number {
  if (info.advance > 0) return info.advance;
  if (info.code === "cod") return 0;
  return total;
}
