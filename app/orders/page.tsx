import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, Package, ShoppingBag } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatBDT } from "@/lib/utils";
import { formatBdPhone } from "@/lib/phone";
import StatusBadge from "@/components/admin/StatusBadge";
import OrderCardActions from "./OrderCardActions";
import type { CartItem } from "@/types";

export const metadata = {
  title: "আমার অর্ডার — Chapai Mango House",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  customer_name: string;
  phone: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: "cod" | "bkash" | "nagad" | "rocket";
  payment_txn_id: string | null;
  status: string;
  created_at: string;
};

export default async function CustomerOrdersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="container-x py-20 text-center">
        <p className="text-ink/60">Supabase কনফিগার হয়নি।</p>
      </section>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");

  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,customer_name,phone,items,subtotal,delivery_fee,total,payment_method,payment_txn_id,status,created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const orders = ((data as OrderRow[] | null) || []).filter(Boolean);

  return (
    <section className="container-x pt-10 pb-20">
      <div className="mb-8">
        <p className="text-sm font-semibold text-mango-600 mb-2">━ আমার অর্ডার</p>
        <h1 className="section-title">
          অর্ডার <span className="shimmer-text">হিস্টরি</span>
        </h1>
        <p className="mt-3 text-sm text-ink/60">
          সাইন ইন: {user.email || formatBdPhone(user.phone) || user.id}
        </p>
      </div>

      {error && (
        <div className="glass rounded-2xl p-5 mb-6 text-sm text-red-700">
          অর্ডার লোড করতে পারিনি: {error.message}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass rounded-3xl p-14 text-center">
          <Inbox className="h-16 w-16 mx-auto text-mango-400" />
          <h2 className="font-display-bn text-2xl font-bold mt-4">
            এখনো কোনো অর্ডার নেই
          </h2>
          <p className="mt-2 text-ink/60">
            আপনার প্রথম অর্ডার দিতে শপ থেকে আম বেছে নিন।
          </p>
          <Link href="/products" className="btn-primary mt-6 inline-flex">
            <ShoppingBag className="h-4 w-4" />
            শপ দেখুন
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => {
            const items = Array.isArray(o.items) ? o.items : [];
            const itemCount = items.length;
            return (
              <div key={o.id} className="glass rounded-3xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wider text-mango-600 font-semibold">
                      অর্ডার আইডি
                    </div>
                    {/*
                     * Show the FULL UUID, not just the first 8 chars.
                     * The tracking RPC requires the full id, so customers
                     * were copying #cfc037af and confused why it didn't
                     * work. break-all keeps it inside the card on mobile.
                     */}
                    <div className="font-mono text-[11px] sm:text-xs text-ink mt-0.5 break-all leading-snug">
                      {o.id}
                    </div>
                    <div className="text-xs text-ink/50 mt-1">
                      {new Date(o.created_at).toLocaleString("en-BD", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                    <OrderCardActions orderId={o.id} phone={o.phone} />
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={o.status || "pending"} />
                    <div className="font-display-bn text-2xl font-bold text-mango-700">
                      {formatBDT(Number(o.total))}
                    </div>
                  </div>
                </div>

                <ul className="divide-y divide-mango-200/40 mb-4">
                  {items.map((it, idx) => (
                    <li
                      key={`${it.id}-${idx}`}
                      className="flex items-center gap-3 py-2.5"
                    >
                      <Package className="h-4 w-4 text-mango-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ink truncate">
                          {it.name}
                        </div>
                        <div className="text-xs text-ink/50">
                          {formatBDT(it.price_per_kg)}/কেজি ×{" "}
                          {it.quantity_kg} কেজি
                        </div>
                      </div>
                      <div className="font-semibold text-sm">
                        {formatBDT(it.price_per_kg * it.quantity_kg)}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-mango-200/40 text-xs">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-ink/60">
                    <span>
                      <span className="font-semibold text-ink/80">
                        পেমেন্ট:
                      </span>{" "}
                      <span className="uppercase">{o.payment_method}</span>
                    </span>
                    {o.payment_txn_id && (
                      <span>
                        <span className="font-semibold text-ink/80">
                          TrxID:
                        </span>{" "}
                        <span className="font-mono">{o.payment_txn_id}</span>
                      </span>
                    )}
                    <span>{itemCount}টি পণ্য</span>
                    <span>
                      <span className="font-semibold text-ink/80">ফোন:</span>{" "}
                      {o.phone}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
