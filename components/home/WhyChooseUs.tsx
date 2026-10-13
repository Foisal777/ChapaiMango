import {
  Leaf,
  PackageCheck,
  Sprout,
  ShieldCheck,
  Truck,
  Heart
} from "lucide-react";

const FEATURES = [
  {
    icon: Leaf,
    title: "১০০% কেমিক্যাল-মুক্ত",
    desc: "কার্বাইড নেই, ফরমালিন নেই। শুধুই গাছপাকা খাঁটি আম।"
  },
  {
    icon: Sprout,
    title: "সরাসরি বাগান থেকে",
    desc: "চাঁপাইনবাবগঞ্জের নিজস্ব বাগান থেকে সরাসরি আপনার বাসায়।"
  },
  {
    icon: PackageCheck,
    title: "নিরাপদ প্যাকেজিং",
    desc: "বিশেষ ফোম-প্যাডিং কার্টন — একটিও আম নষ্ট হবে না।"
  },
  {
    icon: Truck,
    title: "দ্রুত ডেলিভারি",
    desc: "২৪–৭২ ঘণ্টায় বাংলাদেশের ৬৪টি জেলায় হোম ডেলিভারি।"
  },
  {
    icon: ShieldCheck,
    title: "মান নিশ্চয়তা",
    desc: "নষ্ট আম পেলে ১০০% রিপ্লেসমেন্ট অথবা সম্পূর্ণ রিফান্ড।"
  },
  {
    icon: Heart,
    title: "ঐতিহ্যবাহী জাত",
    desc: "GI-ট্যাগ পাওয়া ক্ষীরসাপাত, খাঁটি হিমসাগর, ল্যাংড়া।"
  }
];

/**
 * "Why choose us" feature grid.
 *
 * Server component — was a client island only because of framer-motion's
 * whileInView staggered fade. The CSS `animate-fade-up` keyframe gives
 * the same effect with a per-card animationDelay, no JS required.
 */
export default function WhyChooseUs() {
  return (
    <section className="bg-gradient-to-b from-cream via-mango-50 to-cream py-20 sm:py-24">
      <div className="container-x">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-mango-600 mb-2">
            ━ কেন Chapai Mango House?
          </p>
          <h2 className="section-title">
            শুধু আম নয়, <span className="shimmer-text">বিশ্বাস</span> ডেলিভার
            করি
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass rounded-3xl p-6 hover:shadow-glow transition-shadow group animate-fade-up opacity-0"
              style={{
                animationDelay: `${i * 70}ms`,
                animationFillMode: "forwards"
              }}
            >
              <div className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-mango-gradient text-ink shadow-glow group-hover:scale-110 transition">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display-bn text-xl font-bold mt-4">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-ink/60 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
