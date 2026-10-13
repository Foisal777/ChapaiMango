import type { Metadata } from "next";
import TrackingForm from "@/components/tracking/TrackingForm";

export const metadata: Metadata = {
  title: "অর্ডার ট্র্যাক করুন",
  description:
    "Chapai Mango House থেকে দেওয়া আপনার অর্ডারের বর্তমান অবস্থা দেখুন — অর্ডার আইডি ও ফোন নম্বর দিয়ে।",
  alternates: { canonical: "/track" },
  // Tracking page is dynamic per query; not useful in search results.
  robots: { index: false, follow: true }
};

export default function TrackPage() {
  return (
    <section className="container-x pt-10 pb-20 max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-semibold text-mango-600 mb-2">
          ━ ডেলিভারি ট্র্যাকিং
        </p>
        <h1 className="section-title">
          অর্ডার <span className="shimmer-text">ট্র্যাক</span> করুন
        </h1>
        <p className="mt-3 text-sm text-ink/60 max-w-xl">
          অর্ডার কনফার্মেশনে পাওয়া অর্ডার আইডি এবং অর্ডার করার সময় যে ফোন
          নম্বর দিয়েছিলেন সেটা দিয়ে এখনই অবস্থা দেখুন। সাইন ইন না করেও কাজ
          করবে।
        </p>
      </div>
      <TrackingForm />
    </section>
  );
}
