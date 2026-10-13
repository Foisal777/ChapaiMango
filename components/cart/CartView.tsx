"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { formatBDT } from "@/lib/utils";
import { calcDeliveryFee, config, totalCartKg } from "@/lib/config";

export default function CartView() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <div className="glass rounded-3xl p-14 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-mango-400" />
        <h2 className="font-display-bn text-2xl font-bold mt-4">কার্ট ফাঁকা</h2>
        <p className="mt-2 text-ink/60">
          আপনার পছন্দের আম বেছে কার্টে যোগ করুন।
        </p>
        <Link href="/products" className="btn-primary mt-6 inline-flex">
          শপ দেখুন
        </Link>
      </div>
    );
  }

  const deliveryFee = calcDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;
  const totalKg = totalCartKg(items);
  const meetsMinimum = totalKg >= config.minOrderKg;
  const kgShort = Math.max(0, config.minOrderKg - totalKg);

  // Show the "buy ৳X more for free delivery" hint only when there's a
  // chargeable fee that would still flip to free above some threshold.
  const showFreeDeliveryHint =
    config.deliveryFee > 0 &&
    config.freeDeliveryOver > 0 &&
    subtotal < config.freeDeliveryOver;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((it) => (
          <div
            key={it.id}
            className="glass rounded-3xl p-4 flex gap-4 items-center"
          >
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-mango-100 shrink-0">
              {it.image && (
                <Image
                  src={it.image}
                  alt={it.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${it.slug}`}
                className="font-display-bn text-base sm:text-lg font-bold hover:text-mango-700 line-clamp-1"
              >
                {it.name}
              </Link>
              <div className="text-xs text-mango-600 font-semibold mt-0.5">
                {it.variety}
              </div>
              <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-mango-300 bg-white p-1">
                  <button
                    onClick={() => setQty(it.id, it.quantity_kg - 1)}
                    className="grid place-items-center h-8 w-8 rounded-full hover:bg-mango-100"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[3ch] text-center text-sm font-semibold">
                    {it.quantity_kg} কেজি
                  </span>
                  <button
                    onClick={() => setQty(it.id, it.quantity_kg + 1)}
                    className="grid place-items-center h-8 w-8 rounded-full hover:bg-mango-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="font-display-bn text-base sm:text-lg font-bold text-mango-700">
                  {formatBDT(it.price_per_kg * it.quantity_kg)}
                </div>
              </div>
            </div>
            <button
              onClick={() => remove(it.id)}
              className="grid place-items-center h-9 w-9 rounded-full text-red-500 hover:bg-red-50 shrink-0"
              aria-label="সরান"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <aside className="lg:sticky lg:top-24 self-start glass rounded-3xl p-6">
        <h3 className="font-display-bn text-xl font-bold mb-4">অর্ডার সারমর্ম</h3>
        <Row label="সাবটোটাল" value={formatBDT(subtotal)} />
        <Row
          label="ডেলিভারি"
          value={deliveryFee === 0 ? "ফ্রি" : formatBDT(deliveryFee)}
        />
        {showFreeDeliveryHint && (
          <p className="text-[11px] text-mango-700 mt-1">
            ৳{config.freeDeliveryOver - subtotal} আরও কিনলেই → ফ্রি ডেলিভারি!
          </p>
        )}
        <div className="my-4 border-t border-mango-200/60" />
        <Row label="মোট" value={formatBDT(total)} bold />

        {!meetsMinimum && config.minOrderKg > 0 && (
          <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              ন্যূনতম অর্ডার {config.minOrderKg} কেজি — কার্টে আরও{" "}
              <strong>{kgShort} কেজি</strong> যোগ করুন।
            </p>
          </div>
        )}

        {meetsMinimum ? (
          <Link href="/checkout" className="btn-primary w-full mt-6">
            চেকআউট
          </Link>
        ) : (
          <button
            disabled
            className="btn-primary w-full mt-6 cursor-not-allowed"
            aria-disabled="true"
          >
            চেকআউট ({totalKg}/{config.minOrderKg} কেজি)
          </button>
        )}
        <Link
          href="/products"
          className="block text-center mt-3 text-xs text-ink/60 hover:text-mango-700"
        >
          ← আরও কিনতে যান
        </Link>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  bold
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-baseline py-1 ${
        bold ? "font-display-bn text-xl font-bold text-mango-700" : "text-sm"
      }`}
    >
      <span className={bold ? "" : "text-ink/70"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
