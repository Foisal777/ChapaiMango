import { Sparkles } from "lucide-react";
import { getActiveMarquees } from "@/lib/data";
import type { MarqueeItem } from "@/types";

/**
 * Single-line scrolling promo strip that sits ABOVE the navbar on
 * every public page.
 *
 * Server component — pulls active items from Supabase via
 * `getActiveMarquees()` so the operator can change the strip from
 * /admin/marquees without a code deploy. Falls back to a built-in
 * list when Supabase is unreachable so the strip never goes blank.
 *
 * The animation is pure CSS (defined in globals.css). Hover or
 * tap-and-hold pauses the scroll so customers can read a specific
 * message.
 */
export default async function TopMarquee() {
  const items = await getActiveMarquees();
  if (items.length === 0) return null;

  // Duplicate the list so the CSS keyframe (translateX 0 → -50%)
  // produces a seamless loop without a visible reset.
  const looped: MarqueeItem[] = [...items, ...items];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-mango-700 via-mango-500 to-mango-700 text-cream border-b border-mango-800/30 shadow-soft">
      <Sparkles
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mango-200 z-10 hidden sm:block animate-pulse"
        aria-hidden
      />
      <div
        className="marquee-track flex whitespace-nowrap py-3 sm:py-3.5 hover:[animation-play-state:paused]"
        aria-label="বিশেষ বার্তা"
      >
        {looped.map((item, i) => (
          <span
            key={`${item.id}-${i}`}
            className="inline-flex items-center gap-2.5 px-6 sm:px-8 text-sm sm:text-base font-semibold tracking-wide"
          >
            <span aria-hidden className="text-lg sm:text-xl">
              {item.emoji}
            </span>
            <span>{item.text}</span>
            <span className="text-mango-300/70 font-bold ml-3 text-base">
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
