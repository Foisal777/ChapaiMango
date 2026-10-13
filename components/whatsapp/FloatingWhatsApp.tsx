"use client";

import { useEffect, useState } from "react";

/**
 * Floating WhatsApp call-to-action.
 *
 * Renders a fixed-position green pill in the bottom-right corner that
 * opens a WhatsApp chat with the business with a Bangla pre-filled
 * message. We:
 *   - read the number from NEXT_PUBLIC_WHATSAPP_NUMBER (international
 *     format, no `+`, e.g. "8801XXXXXXXXX") and fall back to
 *     NEXT_PUBLIC_BUSINESS_PHONE so existing setups work.
 *   - render nothing if neither env var is set, so dev / preview never
 *     ship a "01XXXXXXXXX" button.
 *   - delay first paint by ~600ms so the button never competes with
 *     LCP on the homepage.
 */
export default function FloatingWhatsApp() {
  const [show, setShow] = useState(false);

  // Sanitize phone -> digits-only international format expected by wa.me
  const number = pickNumber();

  useEffect(() => {
    if (!number) return;
    const id = window.setTimeout(() => setShow(true), 600);
    return () => window.clearTimeout(id);
  }, [number]);

  if (!number || !show) return null;

  const message = encodeURIComponent(
    "আসসালামু আলাইকুম! চাঁপাই ম্যাঙ্গো হাউস থেকে আম অর্ডারের ব্যাপারে জানতে চাচ্ছি।"
  );
  const href = `https://wa.me/${number}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp এ যোগাযোগ করুন"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition will-change-transform"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden sm:inline text-sm font-semibold">
        WhatsApp এ অর্ডার
      </span>
    </a>
  );
}

function pickNumber(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_BUSINESS_PHONE ||
    "";
  const digits = raw.replace(/\D/g, "");
  if (!digits || digits.includes("XXXXXXXXX")) return null;
  // BD local "01XXXXXXXXX" -> "8801XXXXXXXXX". Anything that already
  // starts with a country code is left as-is.
  if (digits.startsWith("0")) return "88" + digits;
  if (digits.startsWith("88")) return digits;
  return digits;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.94 11.94 0 0 0 12.04 0C5.45 0 .1 5.34.1 11.94c0 2.1.55 4.16 1.6 5.97L0 24l6.27-1.64a11.92 11.92 0 0 0 5.77 1.47h.01c6.59 0 11.94-5.34 11.95-11.94 0-3.19-1.24-6.19-3.48-8.41zM12.05 21.8h-.01a9.85 9.85 0 0 1-5.02-1.37l-.36-.21-3.72.97.99-3.62-.23-.37a9.83 9.83 0 0 1-1.5-5.26c0-5.45 4.43-9.88 9.88-9.88 2.64 0 5.12 1.03 6.99 2.9a9.84 9.84 0 0 1 2.9 6.99c-.01 5.45-4.45 9.85-9.92 9.85zm5.42-7.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.18-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.06 2.85 1.21 3.05.15.2 2.09 3.19 5.06 4.47.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}
