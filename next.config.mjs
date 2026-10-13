/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strip the X-Powered-By header (tiny, but free).
  poweredByHeader: false,
  compress: true,
  // Smaller, modern image formats for every next/image usage.
  images: {
    formats: ["image/avif", "image/webp"],
    // Product photos effectively never change, so keep the optimised
    // variants on disk/CDN for 30 days instead of re-encoding them every
    // 60 seconds (the default) — pages with many product images get
    // noticeably quicker on repeat views.
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" }
    ]
  },
  experimental: {
    // Only ship the icons/motion primitives actually imported, instead of
    // the whole barrel file — trims JS on every route.
    optimizePackageImports: ["lucide-react", "framer-motion"]
  },
  reactStrictMode: true
};

export default nextConfig;
