import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(n: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(n);
}

/**
 * Only allow same-origin, root-relative redirect targets.
 *
 * `?next=` values come straight from the URL, so without this a link like
 * `/login?next=https://evil.example` would bounce a freshly signed-in
 * customer to an attacker's site (classic open redirect).
 */
export function safeNextPath(
  value: string | null | undefined,
  fallback = "/"
): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  // "//evil.com" and "/\evil.com" are protocol-relative, not internal.
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}
