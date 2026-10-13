import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, MapPin, Calendar, Star, Leaf } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartControl from "@/components/product/AddToCartControl";
import JsonLd from "@/components/seo/JsonLd";
import ReviewSection from "@/components/product/ReviewSection";
import {
  getProductBySlug,
  getProductRatingStats,
  getProducts
} from "@/lib/data";
import { formatBDT } from "@/lib/utils";
import { getSiteUrl, SITE } from "@/lib/site";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "পাওয়া যায়নি" };

  const url = `${getSiteUrl()}/products/${product.slug}`;
  const title = `${product.name} (${product.variety}) — ${SITE.name}`;
  const description = `${product.short_description} প্রতি কেজি ৳${product.price_per_kg}। ${product.season} মৌসুম। সরাসরি ${product.origin} থেকে।`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: SITE.name,
      locale: SITE.defaultLocale,
      images: product.images.length
        ? [
            {
              url: product.images[0],
              width: 1200,
              height: 1200,
              alt: product.name
            }
          ]
        : undefined
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images.slice(0, 1)
    }
  };
}

export default async function ProductDetailPage({
  params
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  // Pull live rating stats so JSON-LD reflects real reviews. The DB
  // trigger keeps `products.rating` and `products.review_count` in
  // sync, so this is just a single-row read.
  const ratingStats = await getProductRatingStats(product.id);

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/products/${product.slug}`;

  // Schema.org Product markup so Google can render rich results
  // (price, stock status, rating stars) in search.
  // Only attach AggregateRating if we have at least one real review —
  // Google's rich-result validator rejects reviewCount=0.
  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: SITE.name
    },
    category: "Mango / Fruit",
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "BDT",
      price: product.price_per_kg,
      priceValidUntil: priceValidUntilEndOfYear(),
      availability:
        product.stock_kg > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE.name,
        url: siteUrl
      }
    }
  };

  if (ratingStats.count > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingStats.average,
      bestRating: 5,
      worstRating: 1,
      reviewCount: ratingStats.count
    };
  }

  // BreadcrumbList helps Google build the breadcrumb shown above the
  // result snippet (Home > Shop > Product Name).
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "হোম", item: `${siteUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "শপ",
        item: `${siteUrl}/products`
      },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl }
    ]
  };

  return (
    <>
    <section className="container-x pt-8 pb-20">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-mango-700 hover:gap-2 transition-all mb-6"
      >
        <ChevronLeft className="h-4 w-4" /> শপে ফিরে যান
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <div className="text-xs uppercase tracking-widest text-mango-600 font-semibold">
            {product.variety}
          </div>
          <h1 className="font-display-bn text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 leading-tight">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-4 text-sm flex-wrap">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-mango-500 text-mango-500" />
              <span className="font-semibold">
                {ratingStats.average.toFixed(1)}
              </span>
              <span className="text-ink/50">/ ৫</span>
              {ratingStats.count > 0 && (
                <a
                  href="#reviews"
                  className="ml-1 text-ink/50 hover:text-mango-700 underline-offset-2 hover:underline"
                >
                  ({ratingStats.count}টি রিভিউ)
                </a>
              )}
            </span>
            <span className="text-ink/40">·</span>
            <span className="text-ink/60">
              স্টক: {product.stock_kg} কেজি
            </span>
          </div>

          <div className="mt-6 flex items-end gap-2">
            <span className="font-display-bn text-3xl sm:text-4xl lg:text-5xl font-bold text-mango-700">
              {formatBDT(product.price_per_kg)}
            </span>
            <span className="text-ink/50 mb-2">/ কেজি</span>
          </div>

          <p className="mt-5 text-ink/75 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Info
              icon={<MapPin className="h-4 w-4" />}
              label="উৎপত্তি"
              value={product.origin}
            />
            <Info
              icon={<Calendar className="h-4 w-4" />}
              label="মৌসুম"
              value={product.season}
            />
            <Info
              icon={<Leaf className="h-4 w-4" />}
              label="মান"
              value="কেমিক্যাল-মুক্ত"
            />
          </div>

          <div className="mt-8">
            <AddToCartControl product={product} />
          </div>

          <div className="mt-6 glass rounded-2xl p-4 text-xs text-ink/70 leading-relaxed">
            <strong className="text-ink">ডেলিভারি:</strong> ঢাকার ভেতরে ২৪
            ঘণ্টা · বাংলাদেশের সব জেলায় ৪৮–৭২ ঘণ্টা · অর্ডার কনফার্মেশনের পর
            SMS / কল পাবেন।
          </div>
        </div>
      </div>
    </section>
    <ReviewSection productId={product.id} productSlug={product.slug} />
    </>
  );
}

function Info({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-2xl p-3">
      <div className="flex items-center gap-1.5 text-mango-600 text-xs font-semibold">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

/** ISO date for end-of-year — required by schema.org Offer. */
function priceValidUntilEndOfYear(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), 11, 31)).toISOString().split("T")[0];
}
