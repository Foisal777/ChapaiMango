import { Facebook } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.09Z" />
    </svg>
  );
}

/**
 * Big "Follow us" call-out used on the home page (between
 * Testimonials and the bottom CTA). Same brand-coloured pills as
 * the footer but blown up so customers actually notice them.
 */
export default function SocialFollow() {
  const facebookUrl =
    process.env.NEXT_PUBLIC_FACEBOOK_URL ||
    "https://www.facebook.com/share/1E8A9tnY4U/";
  const tiktokUrl =
    process.env.NEXT_PUBLIC_TIKTOK_URL ||
    "https://www.tiktok.com/@chapai_mango";

  return (
    <section className="container-x py-12">
      <div className="glass rounded-3xl p-8 sm:p-10 text-center">
        <p className="text-sm font-semibold text-mango-600 mb-2">
          ━ আমাদের সাথে থাকুন
        </p>
        <h2 className="font-display-bn text-2xl sm:text-3xl md:text-4xl font-bold text-ink leading-tight">
          মৌসুমের প্রতিটা <span className="shimmer-text">আপডেট</span> পান
        </h2>
        <p className="mt-3 text-sm sm:text-base text-ink/65 max-w-xl mx-auto">
          নতুন আম এলে, কোন জাত পাওয়া যাচ্ছে, ডেলিভারি কেমন চলছে — সব
          ভিডিও আর ছবিতে দেখুন আমাদের সোশ্যাল চ্যানেলে।
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook এ ফলো করুন"
            className="inline-flex items-center gap-3 rounded-full bg-[#1877F2] px-6 py-3.5 text-base font-bold text-white shadow-soft hover:scale-105 hover:shadow-glow transition"
          >
            <Facebook className="h-6 w-6 fill-white" />
            <span>Facebook ফলো করুন</span>
          </a>
          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok এ ফলো করুন"
            className="inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-base font-bold text-white shadow-soft hover:scale-105 hover:shadow-glow transition"
          >
            <TikTokIcon className="h-6 w-6" />
            <span>TikTok ফলো করুন</span>
          </a>
        </div>
      </div>
    </section>
  );
}
