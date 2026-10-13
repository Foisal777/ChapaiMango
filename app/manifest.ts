import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/settings";

/**
 * Web app manifest (/manifest.webmanifest). Makes the store installable
 * to the home screen and gives Lighthouse / Google a PWA signal.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { brand } = await getSiteSettings();
  return {
    name: brand.name,
    short_name: brand.name.split(" ").slice(0, 2).join(" "),
    description: brand.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#fff7e8",
    theme_color: "#f59e0b",
    lang: "bn",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" }
    ]
  };
}
