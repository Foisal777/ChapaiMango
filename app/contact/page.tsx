import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import { getSiteSettings } from "@/lib/settings";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata = {
  title: "যোগাযোগ — Chapai Mango House",
  description:
    "Chapai Mango House-এর সাথে যোগাযোগ করুন — অর্ডার, ডেলিভারি বা যে কোনো প্রশ্নে।"
};

/**
 * Default coordinates for Nijampur, Nachole, Chapainawabganj.
 * Operator can override with NEXT_PUBLIC_BUSINESS_MAP_LAT / _LNG
 * (and optionally NEXT_PUBLIC_BUSINESS_MAP_LABEL) without a code change.
 *
 * Why we hard-code coords instead of relying on a place query: the old
 * embed used `https://www.google.com/maps?q=Nijampur,...&output=embed`
 * which Google's geocoder often resolves to the wrong place — or just
 * renders blank because the host disallows being framed for that path.
 * Using `https://maps.google.com/maps?q=LAT,LNG&output=embed` is the
 * most reliable no-API-key embed in 2024+.
 */

export default async function ContactPage() {
  const d = getDictionary(getLocale());
  const { contact } = await getSiteSettings();
  const phone = contact.phone;
  const email = contact.email;

  const lat = String(contact.mapLat);
  const lng = String(contact.mapLng);
  const mapLabel = contact.mapLabel;

  // No-API-key embed. The `q=lat,lng(label)` syntax drops a labelled
  // pin; `z=15` is street-level, `hl=bn` keeps the UI in Bangla.
  const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${lat},${lng}(${mapLabel})`
  )}&z=15&hl=${getLocale() === "en" ? "en" : "bn"}&output=embed`;
  // Friendly external link — opens the full Google Maps app/site.
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;

  return (
    <>
      <section className="bg-hero-radial">
        <div className="container-x py-16 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-mango-600 mb-2">{d.contact.kicker}</p>
          <h1 className="font-display-bn text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {d.contact.titleA} <span className="shimmer-text">{d.contact.titleB}</span>
          </h1>
          <p className="mt-5 text-ink/70 text-base sm:text-lg">
{d.contact.subtitleLong}
          </p>
        </div>
      </section>

      <section className="container-x py-14 grid lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <InfoCard
            icon={<Phone className="h-5 w-5" />}
            title={d.contact.phoneCard}
            value={phone}
            href={`tel:${phone}`}
          />
          <InfoCard
            icon={<Mail className="h-5 w-5" />}
            title={d.contact.emailCard}
            value={email}
            href={`mailto:${email}`}
          />
          <InfoCard
            icon={<MapPin className="h-5 w-5" />}
            title={d.contact.addressCard}
            value="নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, রাজশাহী, বাংলাদেশ"
          />
          <InfoCard
            icon={<Clock className="h-5 w-5" />}
            title={d.contact.support}
            value={d.contact.supportHours}
          />
        </div>

        <div className="lg:col-span-2 glass rounded-3xl p-6 sm:p-8">
          <h2 className="font-display-bn text-xl sm:text-2xl font-bold mb-1">
            {d.contact.writeMessage}
          </h2>
          <p className="text-sm text-ink/60 mb-6">
            {d.contact.replyNote}
          </p>
          <ContactForm />
        </div>
      </section>

      {/* Map embed (Nijampur, Nachole, Chapainawabganj) */}
      <section className="container-x pb-16">
        <div className="rounded-3xl overflow-hidden glass">
          <iframe
            src={mapEmbedSrc}
            className="w-full h-[360px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            title={mapLabel}
          />
          <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white/60 border-t border-mango-200/60 flex-wrap">
            <div className="flex items-start gap-2 text-sm text-ink/70 min-w-0">
              <MapPin className="h-4 w-4 text-mango-600 mt-0.5 shrink-0" />
              <span className="truncate">{mapLabel}</span>
            </div>
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-mango-gradient px-4 py-1.5 text-xs font-bold text-ink shadow-soft hover:scale-105 transition shrink-0"
            >
              {d.contact.viewMaps}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoCard({
  icon,
  title,
  value,
  href
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
}) {
  const Body = (
    <div className="glass rounded-2xl p-5 hover:shadow-glow transition-shadow">
      <div className="flex items-start gap-4">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-mango-gradient shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider font-semibold text-mango-600">
            {title}
          </div>
          <div className="text-sm font-medium text-ink mt-1 break-words">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
  return href ? <a href={href}>{Body}</a> : Body;
}
