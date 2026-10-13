"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Mango } from "@/types";

type Sort = "featured" | "price-asc" | "price-desc" | "rating";

export default function ProductsExplorer({ products }: { products: Mango[] }) {
  const [query, setQuery] = useState("");
  const [variety, setVariety] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("featured");

  const varieties = useMemo(
    () => ["all", ...Array.from(new Set(products.map((p) => p.variety)))],
    [products]
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchQ =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.variety.toLowerCase().includes(query.toLowerCase());
      const matchV = variety === "all" || p.variety === variety;
      return matchQ && matchV;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price_per_kg - b.price_per_kg;
        case "price-desc":
          return b.price_per_kg - a.price_per_kg;
        case "rating":
          return b.rating - a.rating;
        default:
          return Number(b.is_featured) - Number(a.is_featured);
      }
    });
    return list;
  }, [products, query, variety, sort]);

  return (
    <>
      <div className="glass rounded-3xl p-4 sm:p-5 mb-8 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mango-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="আম খুঁজুন (Himsagar, Langra...)"
            className="input-field pl-11"
          />
        </div>
        <select
          value={variety}
          onChange={(e) => setVariety(e.target.value)}
          className="input-field md:col-span-3"
        >
          {varieties.map((v) => (
            <option key={v} value={v}>
              {v === "all" ? "সব জাত" : v}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="input-field md:col-span-3"
        >
          <option value="featured">বিশেষ আগে</option>
          <option value="price-asc">দাম: কম → বেশি</option>
          <option value="price-desc">দাম: বেশি → কম</option>
          <option value="rating">টপ রেটেড</option>
        </select>
      </div>

      <div className="text-sm text-ink/60 mb-4">
        {filtered.length}টি পণ্য পাওয়া গেছে
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-3xl p-14 text-center">
          <div className="text-5xl mb-3">🥭</div>
          <p className="text-ink/60">
            কিছু পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
