import { Banknote, Building2, Smartphone } from "lucide-react";
import type { PaymentMethod } from "@/types";

/**
 * Brand-coloured payment pill used on /checkout (method picker)
 * and the footer "We Accept" strip.
 *
 * Why we render a brand-coloured text pill rather than reproducing
 * the bitmap brand artwork: bKash, Nagad, Rocket and Upay are
 * registered trademarks. The brand NAME is freely usable in
 * nominative-use ("we accept bKash") which is exactly what this
 * component expresses — a recognisable brand-coloured pill with
 * the brand wordmark and a category icon. This is the same
 * approach Daraz / Foodpanda / Pickaboo use on their checkout
 * screens.
 *
 * If the operator wants the real bitmap brand logos (because they
 * have a partnership / their own creative), they can:
 *   1. Drop a PNG (or SVG) per code into `public/payment-logos/`
 *      named `<code>.png` (e.g. `bkash.png`).
 *   2. Replace the body of this component with an <img src=...>
 *      using that path.
 * Both ends — checkout form + footer strip — pick up the swap
 * automatically because they both render through this component.
 */

export const BRAND_BG: Record<PaymentMethod, string> = {
  bkash: "bg-[#E2136E]", // bKash signature pink
  nagad: "bg-[#EE3225]", // Nagad red
  rocket: "bg-[#8B188F]", // Rocket purple
  upay: "bg-[#E8B500]", // Upay yellow
  bank: "bg-ink", // Generic ink-black
  cod: "bg-leaf-600" // Cash green
};

const BRAND_FG: Record<PaymentMethod, string> = {
  bkash: "text-white",
  nagad: "text-white",
  rocket: "text-white",
  upay: "text-ink", // yellow needs dark text
  bank: "text-white",
  cod: "text-white"
};

const BRAND_LABEL: Record<PaymentMethod, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  upay: "Upay",
  bank: "Bank",
  cod: "COD"
};

function iconFor(code: PaymentMethod) {
  switch (code) {
    case "cod":
      return Banknote;
    case "bank":
      return Building2;
    default:
      // bkash, nagad, rocket, upay — all MFS rails
      return Smartphone;
  }
}

export type PaymentBrandLogoSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<PaymentBrandLogoSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5",
  md: "px-4 py-2 text-sm gap-2 [&_svg]:h-4 [&_svg]:w-4",
  lg: "px-5 py-2.5 text-base gap-2 [&_svg]:h-5 [&_svg]:w-5"
};

export default function PaymentBrandLogo({
  code,
  size = "md",
  className = ""
}: {
  code: PaymentMethod;
  size?: PaymentBrandLogoSize;
  className?: string;
}) {
  const Icon = iconFor(code);
  return (
    <span
      className={[
        "inline-flex items-center rounded-lg font-bold shadow-soft tracking-tight",
        BRAND_BG[code],
        BRAND_FG[code],
        SIZE_CLASSES[size],
        className
      ].join(" ")}
      aria-label={BRAND_LABEL[code]}
    >
      <Icon aria-hidden="true" />
      {BRAND_LABEL[code]}
    </span>
  );
}
