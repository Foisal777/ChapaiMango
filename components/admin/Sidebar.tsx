"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  MessageSquare,
  Star,
  Bell,
  Megaphone,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  ExternalLink
} from "lucide-react";
import { signOutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

// Note: there's no /admin/payment-methods entry — payment config
// (numbers, advance amounts, on/off toggles) is operator-managed via
// Railway env vars now (see lib/config.ts and .env.local.example).
const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/marquees", label: "Marquees", icon: Megaphone },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/refund-policy", label: "Refund Policy", icon: FileText },
  { href: "/admin/notifications", label: "Notifications", icon: Bell }
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-cream/90 backdrop-blur-xl border-b border-mango-200/50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl">🥭</span>
            <span className="font-display font-bold">Admin</span>
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-white/70 p-2 border border-mango-200"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-ink/40 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 bg-white/80 backdrop-blur-xl border-r border-mango-200/60 flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-mango-200/60">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl">🥭</span>
            <span className="font-display text-lg font-bold">
              Chapai <span className="shimmer-text">Admin</span>
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden rounded-full p-1.5 hover:bg-mango-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-mango-gradient text-ink shadow-soft"
                    : "text-ink/70 hover:bg-mango-100 hover:text-mango-700"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-mango-200/60 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-ink/60 hover:bg-mango-100"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View live site
          </Link>

          <div className="rounded-xl bg-mango-50 px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-mango-600 font-semibold">
              Logged in as
            </div>
            <div className="text-xs text-ink/80 truncate">{email}</div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
