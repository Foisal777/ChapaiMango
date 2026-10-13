"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

// FloatingWhatsApp is below-the-fold decoration — lazy-load it so its
// JS doesn't compete with the hero's first paint.
const FloatingWhatsApp = dynamic(
  () => import("@/components/whatsapp/FloatingWhatsApp"),
  { ssr: false }
);

/** Thin mango-gradient scroll-progress bar (transform-only, cheap). */
function ScrollProgress() {
  const [scale, setScale] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScale(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return <div aria-hidden className="scroll-progress" style={{ transform: `scaleX(${scale})` }} />;
}

/**
 * Wraps the app with public Navbar + Footer, except on /admin routes
 * which use their own admin layout. `main` is keyed by pathname so
 * every navigation replays the page-transition animation.
 */
export default function SiteShell({
  children,
  topMarquee,
  footer
}: {
  children: React.ReactNode;
  topMarquee?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <ScrollProgress />
      {topMarquee}
      <Navbar />
      <main key={pathname} className="page-enter">{children}</main>
      {footer}
      <FloatingWhatsApp />
    </>
  );
}
