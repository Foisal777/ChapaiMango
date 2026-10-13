import Image from "next/image";
import Link from "next/link";
import { Award, Leaf, Users, TreePine } from "lucide-react";

export const metadata = {
  title: "আমাদের সম্পর্কে — Chapai Mango House",
  description:
    "চাঁপাইনবাবগঞ্জের আমের ঐতিহ্য, আমাদের বাগান, ও আমাদের গল্প।"
};

const TIMELINE = [
  {
    year: "১৯৮৫",
    title: "পারিবারিক বাগানের সূচনা",
    desc: "আমাদের দাদা চাঁপাইনবাবগঞ্জে প্রথম ৫০টি আম গাছ রোপণ করেন।"
  },
  {
    year: "২০১০",
    title: "জৈব চাষে পূর্ণ যাত্রা",
    desc: "কেমিক্যাল-মুক্ত চাষে বিশেষ ফোকাস — কীটনাশক বন্ধ।"
  },
  {
    year: "২০১৮",
    title: "ক্ষীরসাপাতের GI ট্যাগ",
    desc: "চাঁপাই ক্ষীরসাপাত Geographical Indication-এ নিবন্ধিত হয়।"
  },
  {
    year: "২০২৪",
    title: "অনলাইন যাত্রা শুরু",
    desc: "Chapai Mango House — সারা বাংলাদেশে হোম ডেলিভারি শুরু।"
  }
];

const STATS = [
  { icon: TreePine, value: "৫০০+", label: "আম গাছ" },
  { icon: Leaf, value: "০%", label: "কেমিক্যাল ব্যবহার" },
  { icon: Users, value: "১২হাজার+", label: "সন্তুষ্ট গ্রাহক" },
  { icon: Award, value: "GI", label: "ট্যাগ সার্টিফায়েড" }
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-radial">
        <div className="container-x py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-mango-600 mb-2">
              ━ আমাদের গল্প
            </p>
            <h1 className="font-display-bn text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              তিন <span className="shimmer-text">প্রজন্মের</span> বাগান, <br />
              একটিই প্রতিশ্রুতি — <br />
              <span className="text-mango-700">খাঁটি আম।</span>
            </h1>
            <p className="mt-6 text-ink/70 text-base sm:text-lg leading-relaxed max-w-xl">
              চাঁপাইনবাবগঞ্জ — বাংলাদেশের আমের রাজধানী। আমাদের পরিবার ১৯৮৫ সাল
              থেকে নিজামপুর, নাচোলে আম চাষ করে আসছে। আজ আমরা সেই ঐতিহ্যকে
              অনলাইনে নিয়ে এসেছি, যাতে আপনিও পেতে পারেন গাছপাকা, কেমিক্যাল-মুক্ত
              চাঁপাইনবাবগঞ্জের আম।
            </p>
          </div>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=1200"
              alt="চাঁপাইনবাবগঞ্জের আম বাগান"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent" />
            <div className="absolute bottom-5 left-5 right-5 glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-widest text-mango-700 font-semibold">
                বাগান
              </div>
              <div className="font-display-bn text-base sm:text-lg font-bold">
                নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-x py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-3xl p-6 text-center">
              <div className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-mango-gradient mb-3">
                <s.icon className="h-6 w-6 text-ink" />
              </div>
              <div className="font-display-bn text-2xl sm:text-3xl font-bold text-mango-700">
                {s.value}
              </div>
              <div className="text-sm text-ink/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="container-x py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-mango-600 mb-2">━ যাত্রা</p>
          <h2 className="section-title">
            আমাদের <span className="shimmer-text">পথচলা</span>
          </h2>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-mango-300" />
          <div className="space-y-10 md:space-y-16">
            {TIMELINE.map((t, i) => (
              <div
                key={t.year}
                className={`md:grid md:grid-cols-2 md:gap-10 items-center ${
                  i % 2 === 0 ? "" : "md:[direction:rtl]"
                }`}
              >
                <div className="md:[direction:ltr]">
                  <div className="glass rounded-3xl p-6 md:p-8 relative">
                    <div className="font-display-bn text-2xl sm:text-3xl font-bold text-mango-600 mb-1">
                      {t.year}
                    </div>
                    <h3 className="font-display-bn text-lg sm:text-xl font-bold mb-2">
                      {t.title}
                    </h3>
                    <p className="text-ink/70">{t.desc}</p>
                  </div>
                </div>
                <div className="hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="container-x pb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-mango-gradient p-10 sm:p-14 text-center">
          <div className="absolute -top-10 -left-10 text-9xl opacity-15">🥭</div>
          <div className="absolute -bottom-10 -right-10 text-9xl opacity-15">
            🌿
          </div>
          <h2 className="relative font-display-bn text-2xl sm:text-3xl md:text-4xl font-bold text-ink max-w-2xl mx-auto leading-tight">
            আমাদের প্রতিশ্রুতি — আপনার পরিবারের জন্য খাঁটি চাঁপাইয়ের আম, প্রথম
            দিন থেকে শেষ দিন পর্যন্ত।
          </h2>
          <Link
            href="/products"
            className="relative mt-6 inline-flex btn-ghost bg-white/40"
          >
            শপ দেখুন
          </Link>
        </div>
      </section>
    </>
  );
}
