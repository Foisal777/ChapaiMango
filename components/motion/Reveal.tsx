"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades + lifts a section into view the first time it scrolls into the
 * viewport. Implemented with IntersectionObserver + a CSS transition
 * (see `.reveal` in globals.css), so it adds ZERO JavaScript libraries
 * to the page — framer-motion here added ~36 kB to the homepage.
 *
 * - Runs once per page load (scrolling back up doesn't re-animate).
 * - Honours `prefers-reduced-motion` (handled in CSS).
 * - Content is visible if the observer never fires, so nothing gets stuck.
 *
 * Only wrap below-the-fold content with this — never the LCP element.
 */
export default function Reveal({
  children,
  delay = 0,
  className = ""
}: {
  children: React.ReactNode;
  /** Extra delay in ms before the transition starts. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
