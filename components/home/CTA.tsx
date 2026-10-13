import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";

// SubscribeButton self-hides when Web Push is unsupported / VAPID key
// is missing. Lazy-loading it via dynamic({ ssr:false }) keeps it out
// of the home page's initial bundle (it ships react-hot-toast +
// service-worker registration code) so LCP is not impacted.
const SubscribeButton = dynamic(
  () => import("@/components/push/SubscribeButton"),
  { ssr: false }
);

export default function CTA() {
  return (
    <section className="container-x py-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-mango-gradient p-10 sm:p-14 text-center shadow-glow">
        <div className="absolute -top-10 -left-10 text-9xl opacity-20">🥭</div>
        <div className="absolute -bottom-10 -right-10 text-9xl opacity-20">
          🥭
        </div>
        <h2 className="relative font-display-bn text-3xl sm:text-4xl md:text-5xl font-bold text-ink leading-tight">
          আমের মৌসুম মিস করবেন না!
        </h2>
        <p className="relative mt-3 text-ink/80 max-w-xl mx-auto">
          সীমিত স্টক — চাঁপাইনবাবগঞ্জের গাছপাকা ঐতিহ্যবাহী আম, মে থেকে আগস্ট।
        </p>
        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-cream hover:scale-105 transition shadow-soft"
          >
            এখনই অর্ডার করুন <ArrowRight className="h-4 w-4" />
          </Link>
          <SubscribeButton />
        </div>
      </div>
    </section>
  );
}
