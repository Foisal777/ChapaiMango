import { Leaf, PackageCheck, Sprout, ShieldCheck, Truck, Heart } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

const ICONS = [Leaf, Sprout, PackageCheck, Truck, ShieldCheck, Heart];

/** "Why choose us" feature grid — server component, CSS-only animation. */
export default function WhyChooseUs() {
  const d = getDictionary(getLocale());
  const features = d.home.whyItems.map((item, i) => ({ icon: ICONS[i], ...item }));
  return (
    <section className="bg-gradient-to-b from-cream via-mango-50 to-cream py-20 sm:py-24">
      <div className="container-x">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-mango-600 mb-2">{d.home.whyKicker}</p>
          <h2 className="section-title">
            {d.home.whyTitleA} <span className="shimmer-text">{d.home.whyTitleB}</span> {d.home.whyTitleC}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass rounded-3xl p-6 hover:shadow-glow transition-shadow group animate-fade-up opacity-0"
              style={{ animationDelay: `${i * 70}ms`, animationFillMode: "forwards" }}
            >
              <div className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-mango-gradient text-ink shadow-glow group-hover:scale-110 transition">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display-bn text-xl font-bold mt-4">{f.title}</h3>
              <p className="mt-2 text-sm text-ink/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
