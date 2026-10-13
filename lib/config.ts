/**
 * Site-wide settings the operator can change without touching code —
 * just by setting environment variables in Railway / Vercel and
 * letting the auto-redeploy roll out (~30s).
 *
 * All values fall back to sensible defaults if the env var is unset
 * or invalid, so a fresh deploy works out of the box.
 */
import type { PaymentMethod } from "@/types";

const ALL_PAYMENT_METHODS: PaymentMethod[] = [
  "cod",
  "bkash",
  "nagad",
  "rocket",
  "upay",
  "bank"
];

const DEFAULT_DELIVERY_FEE = 120;
const DEFAULT_FREE_OVER = 2000;
const DEFAULT_MIN_ORDER_KG = 10;

function parseEnabledMethods(raw?: string): PaymentMethod[] {
  if (!raw || !raw.trim()) return [...ALL_PAYMENT_METHODS];
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase() as PaymentMethod)
    .filter((m) => ALL_PAYMENT_METHODS.includes(m));
  return list.length > 0 ? list : [...ALL_PAYMENT_METHODS];
}

function parseNonNegativeNumber(raw: string | undefined, fallback: number) {
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export const config = {
  /** Flat fee charged when the cart is below `freeDeliveryOver`. */
  deliveryFee: parseNonNegativeNumber(
    process.env.NEXT_PUBLIC_DELIVERY_FEE,
    DEFAULT_DELIVERY_FEE
  ),
  /** Cart subtotal at or above which delivery becomes free. */
  freeDeliveryOver: parseNonNegativeNumber(
    process.env.NEXT_PUBLIC_FREE_DELIVERY_OVER,
    DEFAULT_FREE_OVER
  ),
  /** Payment methods customers are allowed to pick on checkout. */
  paymentMethods: parseEnabledMethods(process.env.NEXT_PUBLIC_PAYMENT_METHODS),
  /** Minimum total kilograms across all cart items required to checkout. */
  minOrderKg: parseNonNegativeNumber(
    process.env.NEXT_PUBLIC_MIN_ORDER_KG,
    DEFAULT_MIN_ORDER_KG
  )
};

/**
 * The delivery fee that applies to the given cart subtotal.
 *
 * Three knobs:
 *   - NEXT_PUBLIC_DELIVERY_FEE=0       -> always free
 *   - NEXT_PUBLIC_FREE_DELIVERY_OVER=0 -> never free, always charge fee
 *   - subtotal >= freeDeliveryOver     -> free for that order
 *
 * Examples (defaults: fee=120, freeOver=2000):
 *   subtotal 1500 -> 120
 *   subtotal 2500 -> 0
 *   set fee=0     -> always 0
 */
export function calcDeliveryFee(subtotal: number): number {
  if (config.deliveryFee <= 0) return 0;
  if (config.freeDeliveryOver > 0 && subtotal >= config.freeDeliveryOver) {
    return 0;
  }
  return config.deliveryFee;
}

export function isPaymentMethodEnabled(method: PaymentMethod): boolean {
  return config.paymentMethods.includes(method);
}

/** First enabled payment method — used as the form default. */
export function defaultPaymentMethod(): PaymentMethod {
  return config.paymentMethods[0] ?? "cod";
}

/** Sum of `quantity_kg` across cart items. */
export function totalCartKg(items: { quantity_kg: number }[]): number {
  return items.reduce((sum, i) => sum + (i.quantity_kg || 0), 0);
}

// ─────────────────────────────────────────────────────────────────
// Per-method config — receiving number + fixed advance amount
// ─────────────────────────────────────────────────────────────────
//
// Every method has TWO env vars the operator can set on Railway:
//
//   NEXT_PUBLIC_<CODE>_NUMBER    receiving MFS number (single-line)
//   NEXT_PUBLIC_<CODE>_ADVANCE   fixed amount due up front (BDT)
//
// Bank is special — the customer expects FOUR distinct fields
// (holder, bank, branch, account number), so we expose those as
// separate env vars too. See `readBankInfo()` below.

export type PaymentMethodInfo = {
  code: PaymentMethod;
  /** Bangla label shown on the checkout card. */
  label: string;
  /**
   * Single-line summary suitable for receipt rows / track-order
   * displays. For MFS rails this is just the receiving number; for
   * bank it's a "Holder · Bank · Branch · A/C" join.
   */
  accountNumber: string;
  /** Fixed BDT amount required up front (0 = no advance). */
  advance: number;
  /** Free-form helper text shown under the selected card. */
  instructions: string;
  /**
   * Structured bank details, present ONLY when code === 'bank'.
   * The checkout form uses this to render the four fields as a
   * proper labelled block instead of one long string.
   */
  bankDetails?: BankAccountInfo;
};

/** Default labels + instructions per method. */
const METHOD_DEFAULTS: Record<
  PaymentMethod,
  { label: string; instructions: string }
> = {
  cod: {
    label: "ক্যাশ অন ডেলিভারি",
    // NOTE: when NEXT_PUBLIC_COD_ADVANCE > 0 this default is replaced
    // by an advance-aware fallback in `paymentMethodInfo()`. The
    // operator can also override either case by setting
    // NEXT_PUBLIC_COD_INSTRUCTIONS.
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

/** Read NEXT_PUBLIC_<CODE>_NUMBER for a method. Hard-coded refs (not
 *  template-string lookups) because Next.js inlines NEXT_PUBLIC_*
 *  at build time and dynamic keys wouldn't resolve. */
function readNumber(code: PaymentMethod): string {
  switch (code) {
    case "cod":
      // COD itself is "pay cash to courier", so this number is only
      // meaningful when COD_ADVANCE > 0 — i.e. the operator wants a
      // booking deposit sent via any MFS to this single number BEFORE
      // shipping. When advance is 0 the checkout never shows it.
      return (process.env.NEXT_PUBLIC_COD_NUMBER || "").trim();
    case "bkash":
      return (process.env.NEXT_PUBLIC_BKASH_NUMBER || "").trim();
    case "nagad":
      return (process.env.NEXT_PUBLIC_NAGAD_NUMBER || "").trim();
    case "rocket":
      return (process.env.NEXT_PUBLIC_ROCKET_NUMBER || "").trim();
    case "upay":
      return (process.env.NEXT_PUBLIC_UPAY_NUMBER || "").trim();
    case "bank":
      // Legacy single-line bank string. Used only as a fallback when
      // the structured fields are all blank — see formatBankSummary().
      return (process.env.NEXT_PUBLIC_BANK_NUMBER || "").trim();
    default:
      return "";
  }
}

function readAdvance(code: PaymentMethod): number {
  switch (code) {
    case "cod":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_COD_ADVANCE, 0);
    case "bkash":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_BKASH_ADVANCE, 0);
    case "nagad":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_NAGAD_ADVANCE, 0);
    case "rocket":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_ROCKET_ADVANCE, 0);
    case "upay":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_UPAY_ADVANCE, 0);
    case "bank":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_BANK_ADVANCE, 0);
    default:
      return 0;
  }
}

/**
 * Optional per-method instruction override read from env. Returns ""
 * when unset so callers can fall back to METHOD_DEFAULTS. Only COD is
 * exposed today because every other rail has a single number + a
 * generic Send-Money instruction that already fits the UI; COD is
 * the special case where the deposit goes via SOME OTHER rail and
 * the operator needs to spell out which.
 */
function readInstructionsOverride(code: PaymentMethod): string {
  switch (code) {
    case "cod":
      return (process.env.NEXT_PUBLIC_COD_INSTRUCTIONS || "").trim();
    default:
      return "";
  }
}

/**
 * Sensible default helper text for COD when the operator has set an
 * advance > 0 but hasn't provided their own NEXT_PUBLIC_COD_INSTRUCTIONS.
 * Mentions every common MFS rail so the customer knows the listed
 * number accepts any of them.
 */
const COD_WITH_ADVANCE_DEFAULT_INSTRUCTIONS =
  "অগ্রিম bKash / Nagad / Rocket — যেকোনো রেলে এই নম্বরে Send Money করুন এবং TrxID দিন। বাকি টাকা পণ্য পেয়ে কুরিয়ারের কাছে নগদ পরিশোধ করুন।";

// ─────────────────────────────────────────────────────────────────
// Bank account — four structured env-var fields
// ─────────────────────────────────────────────────────────────────
// We split the bank info into Holder / Name / Branch / Account
// because the operator switches accounts occasionally (different
// banks for different seasons, etc.) and editing one field at a time
// is cleaner than re-keying a single combined string.
//
// Defaults are seeded with the operator's current account so the
// /checkout block renders meaningful info even before any env vars
// are set on Railway. Account number is intentionally blank by
// default — operator must fill it in before the bank option is
// useful. The CheckoutForm shows a clear "set in env" hint when
// the account number is empty.

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

/** Read the four structured bank fields from env, with sane defaults. */
function readBankInfo(): BankAccountInfo {
  return {
    holder: (process.env.NEXT_PUBLIC_BANK_HOLDER || "MD FOISAL IQBAL").trim(),
    bankName: (process.env.NEXT_PUBLIC_BANK_NAME || "AB BANK").trim(),
    branch: (process.env.NEXT_PUBLIC_BANK_BRANCH || "RAJSHAHI").trim(),
    accountNumber: (
      process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || ""
    ).trim()
  };
}

/**
 * Format the structured bank info as a single string for places
 * that don't have room for a 4-row block (track-order page,
 * order receipt, etc.).
 *
 * Priority:
 *   1. NEXT_PUBLIC_BANK_NUMBER if set (legacy single-line override)
 *   2. Otherwise concat the four structured fields with " · "
 *
 * That ordering means an operator who already had
 *   NEXT_PUBLIC_BANK_NUMBER="DBBL · A/C 1234567890 · Branch X"
 * keeps that exact display until they delete the var and start
 * using the structured fields.
 */
function formatBankSummary(info: BankAccountInfo): string {
  const legacy = (process.env.NEXT_PUBLIC_BANK_NUMBER || "").trim();
  if (legacy) return legacy;

  const parts: string[] = [];
  if (info.holder) parts.push(`Holder: ${info.holder}`);
  if (info.bankName) parts.push(info.bankName);
  if (info.branch) parts.push(`Branch: ${info.branch}`);
  if (info.accountNumber) parts.push(`A/C: ${info.accountNumber}`);
  return parts.join(" · ");
}

/** Full info bundle for a single payment method. */
export function paymentMethodInfo(code: PaymentMethod): PaymentMethodInfo {
  const def = METHOD_DEFAULTS[code];
  const override = readInstructionsOverride(code);
  const advance = readAdvance(code);

  // For COD specifically, the default text ("পণ্য পেয়ে কুরিয়ারের কাছে
  // নগদ পরিশোধ করুন।") is wrong when an advance is required, so swap
  // in an advance-aware default. Operator override (when set) wins
  // over both branches.
  const instructions =
    override ||
    (code === "cod" && advance > 0
      ? COD_WITH_ADVANCE_DEFAULT_INSTRUCTIONS
      : def.instructions);

  if (code === "bank") {
    const bank = readBankInfo();
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
    accountNumber: readNumber(code),
    advance,
    instructions
  };
}

/** All ENABLED methods, in the same order as `paymentMethods`. */
export function getEnabledPaymentMethodsInfo(): PaymentMethodInfo[] {
  return config.paymentMethods.map(paymentMethodInfo);
}

/**
 * How much the customer has to pay RIGHT NOW for this method.
 * 0 means classic COD (pay full on delivery).
 */
export function amountToSendNow(
  info: PaymentMethodInfo,
  total: number
): number {
  if (info.advance > 0) return info.advance;
  if (info.code === "cod") return 0;
  return total;
}
