import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  StickyNote,
  Calendar,
  CreditCard,
  User
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import OrderActions from "./OrderActions";
import { fetchAdminOrder } from "@/lib/admin/data";
import { formatBDT } from "@/lib/utils";
import type { CartItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params
}: {
  params: { id: string };
}) {
  const order = await fetchAdminOrder(params.id);
  if (!order) notFound();

  const items = (Array.isArray(order.items) ? order.items : []) as CartItem[];

  return (
    <>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-mango-700 hover:gap-2 transition-all mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Order{" "}
            <span className="font-mono text-mango-700 text-xl">
              #{order.id.slice(0, 8)}
            </span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={order.status || "pending"} />
            <span className="text-xs text-ink/50 inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(order.created_at).toLocaleString("en-BD", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: customer + items + payment */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Customer" icon={<User className="h-4 w-4" />}>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Info label="Name" value={order.customer_name} />
              <Info
                label="Phone"
                value={order.phone}
                href={`tel:${order.phone}`}
              />
              {order.email && (
                <Info
                  label="Email"
                  value={order.email}
                  href={`mailto:${order.email}`}
                />
              )}
              <Info label="District" value={order.district} />
              <div className="sm:col-span-2">
                <Info label="Address" value={order.address} />
              </div>
              {order.notes && (
                <div className="sm:col-span-2">
                  <Info
                    label="Notes"
                    value={order.notes}
                    icon={<StickyNote className="h-3.5 w-3.5" />}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card title="Items">
            <ul className="divide-y divide-mango-200/40">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="h-12 w-12 rounded-xl bg-mango-100 overflow-hidden shrink-0">
                    {it.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image}
                        alt={it.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-ink truncate">
                      {it.name}
                    </div>
                    <div className="text-xs text-ink/50">
                      {it.variety} · {formatBDT(it.price_per_kg)}/kg ×{" "}
                      {it.quantity_kg}kg
                    </div>
                  </div>
                  <div className="font-display font-bold text-mango-700">
                    {formatBDT(it.price_per_kg * it.quantity_kg)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-mango-200/60 space-y-1">
              <Row label="Subtotal" value={formatBDT(Number(order.subtotal))} />
              <Row
                label="Delivery"
                value={
                  Number(order.delivery_fee) === 0
                    ? "Free"
                    : formatBDT(Number(order.delivery_fee))
                }
              />
              <div className="flex justify-between font-display text-xl font-bold text-mango-700 pt-2">
                <span>Total</span>
                <span>{formatBDT(Number(order.total))}</span>
              </div>
            </div>
          </Card>

          <Card title="Payment" icon={<CreditCard className="h-4 w-4" />}>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Info
                label="Method"
                value={order.payment_method.toUpperCase()}
              />
              {order.payment_txn_id && (
                <Info
                  label="Transaction ID"
                  value={order.payment_txn_id}
                  mono
                />
              )}
              {order.payment_sender_number && (
                <Info
                  label="Sender Number"
                  value={order.payment_sender_number}
                  href={`tel:${order.payment_sender_number}`}
                />
              )}
              <Info
                label="Amount to verify"
                value={formatBDT(Number(order.total))}
              />
            </div>
            {order.payment_method !== "cod" && (
              <p className="mt-4 text-xs text-ink/60 leading-relaxed bg-mango-50 rounded-xl p-3">
                💡 Verify the TrxID in your{" "}
                <strong className="uppercase">{order.payment_method}</strong>{" "}
                app, then move status to{" "}
                <strong>Confirmed</strong>.
              </p>
            )}
          </Card>
        </div>

        {/* Right column: status + actions */}
        <aside className="lg:sticky lg:top-6 self-start">
          <OrderActions
            id={order.id}
            currentStatus={(order.status as never) || "pending"}
          />
        </aside>
      </div>
    </>
  );
}

function Card({
  title,
  icon,
  children
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="flex items-center gap-2 font-display text-base font-bold mb-4 text-ink">
        {icon && <span className="text-mango-600">{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Info({
  label,
  value,
  href,
  icon,
  mono
}: {
  label: string;
  value: string;
  href?: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-ink/50 inline-flex items-center gap-1">
        {icon}
        {label}
      </div>
      {href ? (
        <a
          href={href}
          className={`mt-0.5 text-ink hover:text-mango-700 break-all ${
            mono ? "font-mono text-sm" : ""
          }`}
        >
          {value}
        </a>
      ) : (
        <div
          className={`mt-0.5 text-ink break-words ${mono ? "font-mono text-sm" : ""}`}
        >
          {value}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink/60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
