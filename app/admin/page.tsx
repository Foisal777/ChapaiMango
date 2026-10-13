import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  Banknote,
  Package,
  MessageSquare,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { fetchAdminStats } from "@/lib/admin/data";
import { formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await fetchAdminStats();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Apnar dokan ekjhalake — orders, revenue, ar inventory."
      />

      {!stats.configured && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-6 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            Supabase ekhono configure hoyni — stats sob 0 dekhabe. README
            follow korun.
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats.totalOrders}
          accent="mango"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pendingOrders}
          hint="Need confirmation"
          accent="amber"
        />
        <StatCard
          icon={Banknote}
          label="Revenue"
          value={formatBDT(stats.revenue)}
          hint="Confirmed + shipped + delivered"
          accent="leaf"
        />
        <StatCard
          icon={Package}
          label="Products"
          value={stats.totalProducts}
          accent="blue"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Recent orders */}
        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-mango-200/60">
            <h2 className="font-display text-lg font-bold">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-mango-700 hover:gap-2 inline-flex items-center gap-1 transition-all"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/50">
              Akhono kono order ase ni.
            </div>
          ) : (
            <ul className="divide-y divide-mango-200/40">
              {stats.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-mango-50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-ink truncate">
                        {o.customer_name}
                      </div>
                      <div className="text-xs text-ink/50">
                        {o.phone} · {o.district} ·{" "}
                        {new Date(o.created_at).toLocaleString("en-BD", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold text-mango-700">
                        {formatBDT(Number(o.total))}
                      </div>
                      <StatusBadge status={o.status || "pending"} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold">Messages</h3>
              <MessageSquare className="h-4 w-4 text-mango-600" />
            </div>
            <div className="font-display text-3xl font-bold text-mango-700">
              {stats.totalMessages}
            </div>
            <Link
              href="/admin/messages"
              className="text-xs font-semibold text-mango-700 hover:gap-2 inline-flex items-center gap-1 mt-3 transition-all"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-display font-bold mb-3">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Link href="/admin/products/new" className="btn-primary text-xs py-2">
                <Package className="h-4 w-4" /> Add new product
              </Link>
              <Link href="/admin/orders?status=pending" className="btn-ghost text-xs py-2">
                <Clock className="h-4 w-4" /> Review pending orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
