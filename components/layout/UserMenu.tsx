"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogIn, LogOut, Package, Shield, UserPlus } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { signOutCustomerAction } from "@/app/actions/auth";
import { formatBdPhone } from "@/lib/phone";

/**
 * User menu in the navbar.
 *
 * Logged out:
 *   - Desktop:  text pills "সাইন ইন" + "সাইন আপ"
 *   - Mobile:   compact icon-only buttons (sign-in + sign-up) so
 *               the user never has to dig into the hamburger menu
 *               to find auth.
 *
 * Logged in:
 *   - Avatar circle (initial) opens a dropdown with profile,
 *     orders, admin (if applicable), sign out.
 */
export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    const checkAdmin = async (u: User | null) => {
      // Phone-only customers don't have an email, so they can't be admin.
      if (!u?.email) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("admin_emails")
        .select("email")
        .ilike("email", u.email)
        .maybeSingle();
      setIsAdmin(!!data);
    };

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      checkAdmin(data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user ?? null;
      setUser(u);
      checkAdmin(u);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // ----- Logged out -----
  if (!user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Sign in: icon-only on mobile, text pill on sm+. Always
            visible so the customer never has to open the hamburger
            menu to find the auth entry point. */}
        <Link
          href="/login"
          aria-label="সাইন ইন"
          className="inline-flex items-center justify-center sm:gap-1.5 rounded-full bg-white/70 border border-mango-200 h-9 w-9 sm:w-auto sm:px-3.5 sm:py-2 text-xs font-semibold text-mango-700 hover:bg-mango-100 transition"
        >
          <LogIn className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">সাইন ইন</span>
        </Link>
        {/* Sign up: visible on sm+ only — keeps the mobile navbar
            tight (sign-up is also reachable from the sign-in page). */}
        <Link
          href="/signup"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-mango-gradient px-3.5 py-2 text-xs font-semibold text-ink shadow-soft hover:scale-105 transition"
        >
          <UserPlus className="h-3.5 w-3.5" />
          সাইন আপ
        </Link>
      </div>
    );
  }

  // ----- Logged in -----
  const initial = (
    (user.user_metadata?.full_name as string | undefined)?.[0] ||
    user.email?.[0] ||
    user.phone?.[2] || // skip the '+8' prefix when we only have a phone
    "?"
  ).toUpperCase();

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    formatBdPhone(user.phone) ||
    "";

  const subline = user.email
    ? user.email
    : user.phone
      ? formatBdPhone(user.phone)
      : "";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid place-items-center h-9 w-9 rounded-full bg-mango-gradient text-ink font-display-bn font-bold shadow-glow hover:scale-105 transition"
        aria-label="ইউজার মেনু"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl glass shadow-soft p-2 origin-top-right animate-fade-up">
          <div className="px-3 py-2 border-b border-mango-200/60 mb-1">
            <div className="text-[10px] uppercase tracking-wider text-mango-600 font-semibold">
              সাইন ইন
            </div>
            <div className="text-sm font-semibold text-ink truncate">
              {fullName}
            </div>
            {subline && fullName !== subline && (
              <div className="text-[11px] text-ink/50 truncate">{subline}</div>
            )}
          </div>

          <Link
            href="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink/80 hover:bg-mango-100 hover:text-mango-700 transition"
          >
            <Package className="h-4 w-4" />
            আমার অর্ডার
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink/80 hover:bg-mango-100 hover:text-mango-700 transition"
            >
              <Shield className="h-4 w-4" />
              অ্যাডমিন প্যানেল
            </Link>
          )}

          <form action={signOutCustomerAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-4 w-4" />
              সাইন আউট
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
