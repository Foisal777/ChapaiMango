import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { fetchAdminOrders } from "@/lib/admin/data";
import { formatBDT, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" }
];

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status || "all";
  const orders = await fetchAdminOrders(status);

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"} ${
          status === "all" ? "total" : `with status "${status}"`
        }`}
      />

      {/* Filter tabs */}
      <div className="glass rounded-2xl p-1.5 mb-6 inline-flex flex-wrap gap-1 max-w-full overflow-x-auto">
        {TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={
                tab.value === "all"
                  ? "/admin/orders"
                  : `/admin/orders?status=${tab.value}`
              }
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition",
                active
                  ? "bg-mango-gradient text-ink shadow-soft"
                  : "text-ink/60 hover:bg-mango-100"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Table / empty state */}
      {orders.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center">
          <Inbox className="h-14 w-14 mx-auto text-mango-400" />
          <p className="mt-3 font-display text-lg">Kono order pawa jay ni</p>
          <p className="text-sm text-ink/50 mt-1">
            {status === "all"
              ? "Akhono kono order ase ni."
              : `"${status}" status-e kono order nei.`}
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="bg-mango-50 text-left text-xs uppercase tracking-wider text-ink/60">
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Items</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mango-200/40">
              {orders.map((o) => {
                const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
                return (
                  <tr key={o.id} className="hover:bg-mango-50/50 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-ink">
                        {o.customer_name}
                      </div>
                      <div className="text-xs text-ink/50">
                        {o.phone} · {o.district}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink/70">
                      {itemsCount} item{itemsCount === 1 ? "" : "s"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs uppercase font-semibold text-mango-700">
                        {o.payment_method}
                      </div>
                      {o.payment_txn_id && (
                        <div className="text-[11px] text-ink/50 font-mono">
                          {o.payment_txn_id}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-display font-bold text-mango-700">
                      {formatBDT(Number(o.total))}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={o.status || "pending"} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink/60">
                      {new Date(o.created_at).toLocaleString("en-BD", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="grid place-items-center h-8 w-8 rounded-full hover:bg-mango-200 text-mango-700"
                        aria-label="View"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-mango-200/40">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="block px-4 py-3.5 hover:bg-mango-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink truncate">
                        {o.customer_name}
                      </div>
                      <div className="text-xs text-ink/50">
                        {o.phone} · {o.district}
                      </div>
                      <div className="text-[11px] text-ink/40 mt-1">
                        {new Date(o.created_at).toLocaleString("en-BD", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                        {" · "}
                        <span className="uppercase font-semibold">
                          {o.payment_method}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold text-mango-700">
                        {formatBDT(Number(o.total))}
                      </div>
                      <StatusBadge status={o.status || "pending"} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
