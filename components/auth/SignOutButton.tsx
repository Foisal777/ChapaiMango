"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { signOutClient } from "@/lib/auth-client";
import { signOutCustomerAction } from "@/app/actions/auth";

type Props = {
  /** Where to land after signing out (default: the home page). */
  next?: string;
  /** Button classes — the wrapper form is `display: contents`. */
  className?: string;
  /** Button label. */
  children: React.ReactNode;
  /** Icon shown while idle (defaults to the logout glyph). */
  icon?: React.ReactNode;
  /** Runs first — e.g. close the dropdown / hamburger panel. */
  onSignedOut?: () => void;
};

/**
 * Sign-out button used by the user menu, the mobile nav and the admin
 * sidebar.
 *
 * Why it's a client button instead of a plain `<form action={serverAction}>`:
 * a server action signs out on the server, but the browser's Supabase
 * client keeps its session in memory and nothing tells the UI to update —
 * so the avatar stayed visible until the next full page load ("logout only
 * works after a reload"). Here sign-out happens in the browser
 * (`signOutClient()`), which fires `SIGNED_OUT` immediately, and only then
 * do we refresh the router cache and navigate.
 *
 * The `<form action={...}>` is kept purely as a no-JS fallback; the click
 * handler preventDefaults so the two paths never both run.
 */
export default function SignOutButton({
  next = "/",
  className,
  children,
  icon,
  onSignedOut
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    onSignedOut?.();

    await signOutClient();

    const target = next || "/";
    if (pathname === target) {
      router.refresh();
    } else {
      router.replace(target);
      // Refetch in place as soon as the navigation lands, so RSC payloads
      // rendered while signed in (orders, admin dashboard, …) can't be
      // served again from the client-side router cache.
      requestAnimationFrame(() => router.refresh());
    }
  };

  return (
    <form action={signOutCustomerAction} className="contents">
      <button
        type="submit"
        onClick={handleClick}
        disabled={busy}
        aria-busy={busy}
        className={className}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          icon ?? <LogOut className="h-4 w-4" aria-hidden />
        )}
        {children}
      </button>
    </form>
  );
}
