"use client";

import { useState } from "react";
import { Banknote, Building2, Smartphone } from "lucide-react";

/**
 * Payment pill used on /checkout (method picker) and the footer
 * "We Accept" strip.
 *
 * If the admin uploaded / linked a logo for the method (Settings →
 * Payments → গ্যালারি থেকে লোগো), that image is shown. Otherwise we
 * render a brand-coloured text pill (nominative use of the brand
 * name — the same approach Daraz/Foodpanda use). Custom methods
 * created in admin get a mango-gradient pill with their label.
 */

export const BRAND_BG: Record<string, string> = {
  bkash: "bg-[#E2136E]",
  nagad: "bg-[#EE3225]",
  rocket: "bg-[#8B188F]",
  upay: "bg-[#E8B500]",
  bank: "bg-ink",
  cod: "bg-leaf-600"
};

const BRAND_FG: Record<string, string> = {
  bkash: "text-white",
  nagad: "text-white",
  rocket: "text-white",
  upay: "text-ink",
  bank: "text-white",
  cod: "text-white"
};

const BRAND_LABEL: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  upay: "Upay",
  bank: "Bank",
  cod: "COD"
};

function iconFor(code: string) {
  if (code === "cod") return Banknote;
  if (code === "bank") return Building2;
  return Smartphone;
}

export type PaymentBrandLogoSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<PaymentBrandLogoSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5 min-h-8",
  md: "px-4 py-2 text-sm gap-2 [&_svg]:h-4 [&_svg]:w-4 min-h-10",
  lg: "px-5 py-2.5 text-base gap-2 [&_svg]:h-5 [&_svg]:w-5 min-h-12"
};

const IMG_SIZE: Record<PaymentBrandLogoSize, string> = {
  sm: "max-h-5 max-w-20",
  md: "max-h-7 max-w-28",
  lg: "max-h-9 max-w-36"
};

export default function PaymentBrandLogo({
  code,
  size = "md",
  className = "",
  label,
  logoUrl
}: {
  code: string;
  size?: PaymentBrandLogoSize;
  className?: string;
  label?: string;
  logoUrl?: string;
}) {
  const displayLabel = label || BRAND_LABEL[code] || code;
  const Icon = iconFor(code);
  const isBuiltin = code in BRAND_BG;
  // Broken logo URL → degrade to the brand pill instead of a dead image.
  const [logoFailed, setLogoFailed] = useState(false);

  if (logoUrl && !logoFailed) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 shadow-soft ring-1 ring-mango-200/70 transition hover:-translate-y-0.5 hover:shadow-glow ${className}`}
        aria-label={displayLabel}
        title={displayLabel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={displayLabel}
          className={`${IMG_SIZE[size]} object-contain`}
          loading="lazy"
          onError={() => setLogoFailed(true)}
        />
      </span>
    );
  }
  return (
    <span
      className={[
        "inline-flex items-center rounded-lg font-bold shadow-soft tracking-tight transition hover:-translate-y-0.5 hover:shadow-glow",
        isBuiltin ? BRAND_BG[code] : "bg-mango-gradient",
        isBuiltin ? BRAND_FG[code] : "text-ink",
        SIZE_CLASSES[size],
        className
      ].join(" ")}
      aria-label={displayLabel}
    >
      <Icon aria-hidden="true" />
      {displayLabel}
    </span>
  );
}
