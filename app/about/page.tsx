import Image from "next/image";
import Link from "next/link";
import { Award, Leaf, Users, TreePine } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata = {
  title: "আমাদের সম্পর্কে — Chapai Mango House",
  description:
    "চাঁপাইনবাবগঞ্জের আমের ঐতিহ্য, আমাদের বাগান, ও আমাদের গল্প।"
};


const STAT_ICONS = [TreePine, Leaf, Users, Award];

export default function AboutPage() {
  const d = getDictionary(getLocale());
  const TIMELINE = d.about.timeline;
  const STATS = d.about.stats.map((s, i) => ({ icon: STAT_ICONS[i], ...s }));
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-radial">
        <div className="container-x py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-mango-600 mb-2">
              {d.about.kicker}
            </p>
            <h1 className="font-display-bn text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {d.about.titleA} <span className="shimmer-text">{d.about.titleB}</span> {d.about.titleC} <br />
              <span className="text-mango-700">{d.about.titleD}</span>
            </h1>
            <p className="mt-6 text-ink/70 text-base sm:text-lg leading-relaxed max-w-xl">
{d.about.intro}
            </p>
          </div>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=1200"
              alt={d.about.orchard}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent" />
            <div className="absolute bottom-5 left-5 right-5 glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-widest text-mango-700 font-semibold">
                {d.about.orchard}
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
          <p className="text-sm font-semibold text-mango-600 mb-2">━ {d.aboutExtra.journey}</p>
          <h2 className="section-title">
            {d.aboutExtra.journeyTitleA} <span className="shimmer-text">{d.aboutExtra.journeyTitleB}</span>
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
{d.aboutExtra.promise}
          </h2>
          <Link
            href="/products"
            className="relative mt-6 inline-flex btn-ghost bg-white/40"
          >
            {d.aboutExtra.browseShop}
          </Link>
        </div>
      </section>
    </>
  );
}
