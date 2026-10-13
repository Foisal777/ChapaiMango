import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Mango } from "@/types";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export default function FeaturedMangoes({ products }: { products: Mango[] }) {
  const d = getDictionary(getLocale());
  return (
    <section className="container-x py-20 sm:py-24">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-sm font-semibold text-mango-600 mb-2">
            {d.home.featuredKicker}
          </p>
          <h2 className="section-title">
            {d.home.featuredTitleA} <span className="shimmer-text">{d.home.featuredTitleB}</span>
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-mango-700 hover:gap-3 transition-all"
        >
          {d.common.viewAll} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} locale={getLocale()} />
        ))}
      </div>
    </section>
  );
}
