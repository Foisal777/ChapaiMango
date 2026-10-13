import { ImageResponse } from "next/og";
import { MangoMark } from "@/lib/brand-mark";

/**
 * Brand icon, served at /icon (favicon + web manifest).
 * Drawn with inline SVG at build time — no binary asset in the repo and
 * no network fetch (emoji rendering would call an external CDN).
 */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<MangoMark size={512} />, { ...size });
}
