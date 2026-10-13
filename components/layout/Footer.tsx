import Link from "next/link";
import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import AcceptedPayments from "@/components/social/AcceptedPayments";
import { getSiteSettings } from "@/lib/settings";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

// Inline TikTok logo (lucide doesn't ship one)
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

export default async function Footer() {
  const d = getDictionary(getLocale());
  const { brand, contact, social } = await getSiteSettings();
  const phone = contact.phone;
  const email = contact.email;
  const facebookUrl = social.facebook;
  const tiktokUrl = social.tiktok;

  return (
    <footer className="mt-24 bg-gradient-to-b from-cream to-mango-100 border-t border-mango-200/50">
      <div className="container-x py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🥭</span>
            <span className="font-display text-xl sm:text-2xl font-bold">
              {brand.name}
            </span>
          </div>
          <p className="text-ink/70 text-sm max-w-md leading-relaxed">
            {d.footer.tagline}
          </p>

          {/*
           * Bigger, branded social CTA. Was 4x4 grey icons in 2.5
           * padding — too easy to miss. Now full-color brand pills
           * with explicit "Follow on..." text so the click target
           * is obvious and finger-friendly on mobile.
           */}
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-mango-700 font-bold mb-3">
              {d.footer.followUs}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#1877F2] px-5 py-3 text-sm font-semibold text-white shadow-soft hover:scale-105 hover:shadow-glow transition"
              >
                <Facebook className="h-5 w-5 fill-white" />
                <span>Facebook</span>
              </a>
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="group inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft hover:scale-105 hover:shadow-glow transition"
              >
                <TikTokIcon className="h-5 w-5" />
                <span>TikTok</span>
              </a>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-display-bn text-lg font-semibold mb-4">
            {d.footer.explore}
          </h4>
          <ul className="space-y-2 text-sm text-ink/70">
            <li>
              <Link href="/" className="hover:text-mango-700">
                {d.nav.home}
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-mango-700">
                {d.nav.shop}
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-mango-700">
                {d.footer.track}
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-mango-700">
                {d.nav.about}
              </Link>
            </li>
            <li>
              <Link href="/team" className="hover:text-mango-700">
                {d.nav.team}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-mango-700">
                {d.footer.contact}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-mango-700">
                {d.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href="/refund" className="hover:text-mango-700">
                {d.footer.refund}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display-bn text-lg font-semibold mb-4">
            {d.footer.contact}
          </h4>
          <ul className="space-y-3 text-sm text-ink/70">
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-mango-600 mt-0.5 shrink-0" />
              <span>{phone}</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-mango-600 mt-0.5 shrink-0" />
              <span className="break-all">{email}</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-mango-600 mt-0.5 shrink-0" />
              <span>
                নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, রাজশাহী, বাংলাদেশ
              </span>
            </li>
          </ul>
        </div>
      </div>

      <AcceptedPayments />

      <div className="border-t border-mango-200/50">
        <div className="container-x py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-ink/60">
          <div>
            © {new Date().getFullYear()} Chapai Mango House · {d.footer.madeIn} 🥭
          </div>
          <div>
            Developed by{" "}
            <a
              href="https://www.facebook.com/foysal.iqbal.359"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-mango-700 hover:text-mango-600 transition underline-offset-2 hover:underline"
            >
              MD FOISAL IQBAL
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
