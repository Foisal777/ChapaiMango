import type { Metadata } from "next";
import TrackingForm from "@/components/tracking/TrackingForm";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "অর্ডার ট্র্যাক করুন",
  description:
    "Chapai Mango House থেকে দেওয়া আপনার অর্ডারের বর্তমান অবস্থা দেখুন — অর্ডার আইডি ও ফোন নম্বর দিয়ে।",
  alternates: { canonical: "/track" },
  // Tracking page is dynamic per query; not useful in search results.
  robots: { index: false, follow: true }
};

export default function TrackPage() {
  const d = getDictionary(getLocale());
  return (
    <section className="container-x pt-10 pb-20 max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-semibold text-mango-600 mb-2">
          {d.track.kicker}
        </p>
        <h1 className="section-title">
          {d.track.titleA} <span className="shimmer-text">{d.track.titleB}</span> {d.track.titleC}
        </h1>
        <p className="mt-3 text-sm text-ink/60 max-w-xl">
{d.track.intro}
        </p>
      </div>
      <TrackingForm />
    </section>
  );
}
