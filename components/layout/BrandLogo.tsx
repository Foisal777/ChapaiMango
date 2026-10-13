"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Unique brand mark — the same mango geometry as the generated app
 * icons (app/icon.tsx / app/apple-icon.tsx) so the favicon, tab icon,
 * navbar, login / signup cards and admin panel all carry one single
 * identity instead of a plain 🥭 emoji.
 *
 * Gradient ids are made unique per instance (useId) so any number of
 * marks can render on one page without SVG <defs> collisions.
 */
export function MangoLogoMark({
  className,
  title
}: {
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const bgId = `mango-bg-${uid}`;
  const fruitId = `mango-fruit-${uid}`;
  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title ?? "Chapai Mango House"}
      className={cn(className)}
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffdc80" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={fruitId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#ea8a00" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${bgId})`} />
      {/* soft ground shadow under the fruit */}
      <ellipse cx="262" cy="428" rx="150" ry="22" fill="#7a3f0d" opacity="0.14" />
      {/* mango fruit */}
      <path
        d="M262 150 C 374 128 430 232 404 322 C 380 404 318 430 262 396 C 206 430 144 404 120 322 C 94 232 150 128 262 150 Z"
        fill={`url(#${fruitId})`}
      />
      {/* leaf */}
      <path
        d="M262 168 C 300 118 360 104 398 118 C 372 160 322 178 262 168 Z"
        fill="#15803d"
      />
      <path
        d="M282 158 C 320 136 358 124 386 122"
        stroke="#166534"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
      {/* highlight */}
      <path
        d="M226 214 C 246 196 270 194 286 204"
        stroke="#fff7e8"
        strokeOpacity="0.7"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const SIZES = {
  sm: { mark: "h-8 w-8", text: "text-sm sm:text-base", gap: "gap-2" },
  md: { mark: "h-9 w-9 sm:h-10 sm:w-10", text: "text-base sm:text-xl", gap: "gap-2 sm:gap-2.5" },
  lg: { mark: "h-12 w-12 sm:h-14 sm:w-14", text: "text-xl sm:text-2xl", gap: "gap-3" }
} as const;

/**
 * Brand lockup (mark + wordmark) for the navbar, auth pages, footer
 * and admin panel.
 *
 * `wordmark`:
 *   - "full"  → "Chapai Mango House" ("House" hides below sm so the
 *                mobile header never truncates)
 *   - "short" → "Chapai Mango"
 *   - "none"  → mark only
 */
export default function BrandLogo({
  size = "md",
  wordmark = "full",
  className
}: {
  size?: keyof typeof SIZES;
  wordmark?: "full" | "short" | "none";
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center min-w-0", s.gap, className)}>
      <MangoLogoMark
        className={cn(s.mark, "shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3")}
      />
      {wordmark !== "none" && (
        <span
          className={cn(
            "font-display font-bold text-ink leading-tight tracking-tight whitespace-nowrap",
            s.text
          )}
        >
          Chapai{" "}
          <span className="shimmer-text">Mango</span>
          {wordmark === "full" && (
            <span className="hidden sm:inline"> House</span>
          )}
        </span>
      )}
    </span>
  );
}
