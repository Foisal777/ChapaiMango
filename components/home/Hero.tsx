"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Award, Sparkles } from "lucide-react";
import HeroSlider from "./HeroSlider";

// Three.js + react-three-fiber + drei together are ~150KB of JS to parse,
// plus a continuous animation loop. On low-end Android phones this is the
// single largest contributor to Total Blocking Time. We:
//   1) Only mount the Scene on desktop (>=1024px) AND
//   2) Defer the mount until the page is idle / hydrated, so the initial
//      paint is not blocked even on desktop.
const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => <FallbackMango />
});

export default function Hero({ heroImages = [] }: { heroImages?: string[] }) {
  const [showScene, setShowScene] = useState(false);
  const hasImages = heroImages.length > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Skip 3D scene entirely when we have real product images
    if (hasImages) return;

    // Only render the heavy 3D canvas on real desktops. Tablets and phones
    // get a lightweight CSS-animated mango — visually playful, near-zero
    // CPU cost.
    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) return;

    // Respect users who explicitly turn off animations.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Wait until the browser is idle so we don't compete with the rest of
    // the page for the main thread during initial load. Fall back to a
    // generous setTimeout for browsers without requestIdleCallback (Safari).
    const ric =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : null;
    const cic =
      typeof window.cancelIdleCallback === "function"
        ? window.cancelIdleCallback
        : null;

    let idleId: number | null = null;
    let timeoutId: number | null = null;
    if (ric) {
      idleId = ric.call(window, () => setShowScene(true), { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(() => setShowScene(true), 600);
    }

    return () => {
      if (idleId !== null && cic) cic.call(window, idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [hasImages]);

  return (
    <section className="relative overflow-hidden bg-hero-radial">
      {/* decorative blobs */}
      <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-mango-300/40 blur-3xl" />
      <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-leaf-400/30 blur-3xl" />

      <div className="container-x relative grid lg:grid-cols-2 gap-10 items-center py-16 lg:py-24">
        {/*
         * Hero copy — intentionally NOT animated.
         *
         * The H1 here is the LCP element on mobile. We previously had
         * `animate-fade-up` on this wrapper, which fades opacity 0 -> 1
         * over 700 ms. That alone added ~700 ms of LCP delay because
         * Lighthouse waits for the largest element to be VISIBLE
         * (not just laid out) before it stops the LCP timer.
         *
         * The illustration column on the right keeps a translate-only
         * entry animation since it isn't the LCP candidate.
         */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold text-mango-700 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            GI-ট্যাগ পাওয়া ক্ষীরসাপাত পাওয়া যাচ্ছে
          </span>

          <h1 className="font-display-bn text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] text-ink">
            <span className="shimmer-text">চাঁপাইনবাবগঞ্জের</span> বাগান থেকে{" "}
            <br className="hidden sm:block" />
            সরাসরি আপনার দরজায়
          </h1>

          <p className="mt-6 text-base sm:text-lg text-ink/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            গাছপাকা, কেমিক্যাল-মুক্ত, হাতে বাছাই করা আম — হিমসাগর, ল্যাংড়া,
            ক্ষীরসাপাত, ফজলি, আম্রপালি, গোপালভোগ। ঐতিহ্যবাহী জাত থেকে হাইব্রিড,
            সবকিছু এক জায়গায়।
          </p>

          <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
            <Link href="/products" className="btn-primary">
              এখনই অর্ডার করুন <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="btn-ghost">
              আমাদের গল্প
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
            <Stat
              icon={<Award className="h-5 w-5" />}
              value="৬+"
              label="আমের জাত"
            />
            <Stat value="১০০%" label="কেমিক্যাল-মুক্ত" />
            <Stat value="৬৪" label="জেলায় ডেলিভারি" />
          </div>
        </div>

        <div
          className="relative h-[400px] sm:h-[500px] lg:h-[560px] animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          {hasImages ? (
            /* Real product images — auto-sliding carousel */
            <HeroSlider images={heroImages} />
          ) : (
            <>
              {/*
               * Glow ring. Was `animate-pulse`, which continuously
               * re-rasterises a `blur-3xl` layer behind the hero — that
               * single rule pushed Speed Index up because the compositor
               * has to repaint the blur every frame while the page is
               * still laying out. A static glow is visually almost
               * identical and keeps the main thread idle.
               */}
              <div className="absolute inset-10 rounded-full bg-mango-gradient blur-3xl opacity-40" />
              <div className="relative h-full">
                {showScene ? <Scene /> : <FallbackMango />}
              </div>
            </>
          )}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 glass rounded-full px-5 py-2 text-xs font-medium text-ink/80 whitespace-nowrap z-10">
            ১০০% গাছপাকা · কেমিক্যাল-মুক্ত
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Lightweight stand-in for the 3D Scene. Used on mobile/tablet and as the
 * SSR / pre-idle placeholder on desktop. Pure CSS animation, ~0 CPU cost.
 */
function FallbackMango() {
  return (
    <div className="grid place-items-center h-full select-none">
      <div
        aria-hidden="true"
        className="text-[10rem] sm:text-[13rem] lg:text-[15rem] animate-float drop-shadow-2xl"
      >
        🥭
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label
}: {
  icon?: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="glass rounded-2xl p-3 sm:p-4 text-center">
      {icon && <div className="mx-auto mb-1 text-mango-600">{icon}</div>}
      <div className="font-display-bn text-xl sm:text-2xl font-bold text-mango-700">
        {value}
      </div>
      <div className="text-[11px] sm:text-xs text-ink/60">{label}</div>
    </div>
  );
}
