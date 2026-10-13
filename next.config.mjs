/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strip the X-Powered-By header (tiny, but free).
  poweredByHeader: false,
  compress: true,
  // Smaller, modern image formats for every next/image usage.
  images: {
    formats: ["image/avif", "image/webp"],
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
