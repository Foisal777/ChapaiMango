"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

// FloatingWhatsApp is below-the-fold decoration — lazy-load it so its
// JS doesn't compete with the hero's first paint.
const FloatingWhatsApp = dynamic(
  () => import("@/components/whatsapp/FloatingWhatsApp"),
  { ssr: false }
);

/**
 * Wraps the app with public Navbar + Footer, except on /admin routes
 * which use their own admin layout.
 *
 * `topMarquee` and `footer` are passed as slot props so the parent
 * layout can render async server components inside them (TopMarquee
 * + Footer's AcceptedPayments fetch from Supabase). This client
 * component can't import the server-only data layer itself.
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
      {topMarquee}
      <Navbar />
      <main className="page-enter">{children}</main>
      {footer}
      <FloatingWhatsApp />
    </>
  );
}
