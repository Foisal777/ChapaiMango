import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatBDT } from "@/lib/utils";
import type { Mango } from "@/types";

/**
 * Product card used on the home page and the /products grid.
 *
 * Server component — the previous version wrapped this in a
 * `motion.div` with `whileHover={{ y: -6 }}` purely so the card
 * lifted on hover. That single visual flourish forced the entire
 * /products page (and every home-page card) to ship framer-motion.
 * Pure CSS hover-translate gives the same effect for free.
 */
export default function ProductCard({ product }: { product: Mango }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl glass hover:shadow-glow hover:-translate-y-1.5 transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-mango-100">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {product.is_featured && (
            <span className="absolute top-3 left-3 rounded-full bg-mango-gradient px-3 py-1 text-[11px] font-semibold text-ink shadow-glow">
              বিশেষ
            </span>
          )}
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-mango-700">
            <Star className="h-3 w-3 fill-mango-500 text-mango-500" />
            {product.rating.toFixed(1)}
          </span>
        </div>
        <div className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-mango-600 font-semibold">
            {product.variety}
          </div>
          <h3 className="font-display-bn text-base sm:text-lg font-bold mt-1 text-ink group-hover:text-mango-700 transition leading-tight">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-ink/60 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="font-display-bn text-xl sm:text-2xl font-bold text-mango-700">
                {formatBDT(product.price_per_kg)}
              </div>
              <div className="text-[11px] text-ink/50">প্রতি কেজি</div>
            </div>
            <span className="rounded-full bg-mango-gradient px-4 py-2 text-xs font-semibold text-ink shadow-soft group-hover:scale-105 transition">
              দেখুন
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
