import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/types";

/**
 * Customer testimonials strip.
 *
 * Server component on purpose: previously this was a "use client"
 * island just for framer-motion's whileInView fade. That dragged
 * ~50 KB of JS onto the home page for a single scroll animation.
 * The CSS-only `animate-fade-up` (defined in tailwind.config) plays
 * once on mount with a per-card delay and looks indistinguishable
 * from the JS version on a normal-speed connection.
 */
export default function Testimonials({
  testimonials
}: {
  testimonials: Testimonial[];
}) {
  return (
    <section className="container-x py-20 sm:py-24">
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <p className="text-sm font-semibold text-mango-600 mb-2">
          ━ গ্রাহকের মতামত
        </p>
        <h2 className="section-title">
          মানুষ কী <span className="shimmer-text">বলছে</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.slice(0, 3).map((t, i) => (
          <div
            key={t.id}
            className="relative glass rounded-3xl p-7 overflow-hidden animate-fade-up opacity-0"
            style={{
              animationDelay: `${i * 100}ms`,
              animationFillMode: "forwards"
            }}
          >
            <Quote className="absolute -top-2 -right-2 h-20 w-20 text-mango-200/60" />
            <div className="relative">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="h-4 w-4 fill-mango-500 text-mango-500"
                  />
                ))}
              </div>
              <p className="text-ink/80 leading-relaxed">
                &ldquo;{t.message}&rdquo;
              </p>
              <div className="mt-5 pt-4 border-t border-mango-200/60">
                <div className="font-display-bn text-base font-semibold text-ink">
                  {t.name}
                </div>
                <div className="text-xs text-ink/50">{t.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
