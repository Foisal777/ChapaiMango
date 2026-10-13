"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/store/cart-store";
import { formatBDT } from "@/lib/utils";
import { config } from "@/lib/config";
import type { Mango } from "@/types";

export default function AddToCartControl({ product }: { product: Mango }) {
  // Default to the configured minimum order so a one-product purchase
  // already satisfies the cart-level requirement.
  const initial = Math.max(1, config.minOrderKg || 1);
  const [qty, setQty] = useState(initial);
  const add = useCart((s) => s.add);
  const router = useRouter();

  const buildCartItem = () => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    variety: product.variety,
    price_per_kg: product.price_per_kg,
    image: product.images[0] || "",
    quantity_kg: qty
  });

  const handleAdd = () => {
    add(buildCartItem());
    toast.success(`${qty} কেজি ${product.name} কার্টে যোগ হয়েছে`);
  };

  /** "Buy Now" — add to cart and go straight to checkout. */
  const handleBuyNow = () => {
    add(buildCartItem());
    router.push("/checkout");
  };

  const total = product.price_per_kg * qty;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wider">
          পরিমাণ (কেজি)
        </label>
        <div className="inline-flex items-center gap-3 rounded-full border-2 border-mango-300 bg-white p-1.5">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid place-items-center h-10 w-10 rounded-full hover:bg-mango-100 transition"
            aria-label="কমান"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            value={qty}
            min={1}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 bg-transparent text-center font-display-bn text-xl font-bold focus:outline-none"
          />
          <button
            onClick={() => setQty((q) => q + 1)}
            className="grid place-items-center h-10 w-10 rounded-full hover:bg-mango-100 transition"
            aria-label="বাড়ান"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {config.minOrderKg > 0 && (
          <p className="mt-2 text-[11px] text-ink/55 inline-flex items-center gap-1">
            <Info className="h-3 w-3" />
            ন্যূনতম অর্ডার (কার্টে মোট) {config.minOrderKg} কেজি।
          </p>
        )}
      </div>

      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <span className="text-sm text-ink/70">মোট</span>
        <span className="font-display-bn text-2xl font-bold text-mango-700">
          {formatBDT(total)}
        </span>
      </div>

      <button onClick={handleAdd} className="btn-primary w-full text-base py-4">
        <ShoppingBag className="h-5 w-5" />
        কার্টে যোগ করুন
      </button>

      <button
        onClick={handleBuyNow}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-mango-500 bg-mango-50 px-6 py-4 text-base font-semibold text-mango-700 shadow-soft transition-all hover:bg-mango-100 hover:scale-[1.02] active:scale-95"
      >
        <Zap className="h-5 w-5" />
        এখনই কিনুন
      </button>
    </div>
  );
}
