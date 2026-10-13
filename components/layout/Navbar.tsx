"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, LogOut, Menu, Package, Shield, ShoppingBag, UserPlus, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useCart } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import UserMenu from "./UserMenu";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { signOutCustomerAction } from "@/app/actions/auth";

const NAV = [
  { href: "/", label: "হোম" },
  { href: "/products", label: "শপ" },
  { href: "/about", label: "আমাদের সম্পর্কে" },
  { href: "/team", label: "আমাদের টিম" },
  { href: "/contact", label: "যোগাযোগ" }
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity_kg, 0);

  // Track signed-in state so the mobile hamburger panel can show the
  // right auth options. We deliberately duplicate this logic from
  // UserMenu (instead of lifting state up) because the desktop
  // UserMenu lives in its own dropdown — keeping each component
  // self-contained is cheaper than a context provider.
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const checkAdmin = async (u: User | null) => {
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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cream/80 backdrop-blur-xl border-b border-mango-200/50 shadow-soft"
          : "bg-transparent"
      )}
    >
      <div className="container-x flex h-16 sm:h-20 items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 group min-w-0">
          <span className="text-2xl sm:text-3xl group-hover:animate-float">
            🥭
          </span>
          <span className="font-display text-sm sm:text-xl font-bold text-ink leading-tight truncate">
            Chapai <span className="shimmer-text">Mango</span> House
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 lg:gap-8">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-colors",
                  active ? "text-mango-700" : "text-ink/70 hover:text-mango-600"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-mango-gradient" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <UserMenu />

          <Link
            href="/cart"
            className="relative rounded-full bg-white/70 p-2.5 border border-mango-200 hover:bg-mango-100 transition"
            aria-label="কার্ট"
          >
            <ShoppingBag className="h-5 w-5 text-mango-700" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-mango-gradient text-[11px] font-bold text-ink grid place-items-center shadow-glow">
                {count}
              </span>
            )}
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-full bg-white/70 p-2.5 border border-mango-200"
            aria-label="মেনু"
          >
            {open ? (
              <X className="h-5 w-5 text-mango-700" />
            ) : (
              <Menu className="h-5 w-5 text-mango-700" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-mango-200/50 bg-cream/95 backdrop-blur-xl">
          <nav className="container-x flex flex-col py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium text-ink/80 hover:text-mango-700"
              >
                {item.label}
              </Link>
            ))}

            {/* Auth section. Shown inside the hamburger so users who
                miss the icon-only buttons next to the cart icon still
                have a clear path to sign in / sign up / open profile. */}
            <div className="border-t border-mango-200/60 mt-2 pt-2">
              {!user ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="py-3 text-base font-medium text-mango-700 inline-flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    সাইন ইন
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="py-3 text-base font-medium text-mango-700 inline-flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    সাইন আপ
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setOpen(false)}
                    className="py-3 text-base font-medium text-ink/80 inline-flex items-center gap-2 hover:text-mango-700"
                  >
                    <Package className="h-4 w-4" />
                    আমার অর্ডার
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="py-3 text-base font-medium text-ink/80 inline-flex items-center gap-2 hover:text-mango-700"
                    >
                      <Shield className="h-4 w-4" />
                      অ্যাডমিন প্যানেল
                    </Link>
                  )}
                  <form action={signOutCustomerAction}>
                    <button
                      type="submit"
                      onClick={() => setOpen(false)}
                      className="py-3 text-base font-medium text-red-600 inline-flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      সাইন আউট
                    </button>
                  </form>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
