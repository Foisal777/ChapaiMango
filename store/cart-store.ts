"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity_kg: i.quantity_kg + item.quantity_kg }
                  : i
              )
            };
          }
          return { items: [...s.items, item] };
        }),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, quantity_kg: Math.max(1, qty) } : i
          )
        })),
      clear: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + i.price_per_kg * i.quantity_kg,
          0
        )
    }),
    { name: "chapai-cart" }
  )
);
