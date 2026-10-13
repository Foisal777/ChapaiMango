import ProductsExplorer from "@/components/product/ProductsExplorer";
import { getProducts } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata = {
  title: "শপ — Chapai Mango House",
  description:
    "চাঁপাইনবাবগঞ্জের সেরা আম অনলাইনে অর্ডার করুন — হিমসাগর, ল্যাংড়া, ক্ষীরসাপাত, ফজলি, আম্রপালি, গোপালভোগ।"
};

export const revalidate = 1800;

export default async function ProductsPage() {
  const d = getDictionary(getLocale());
  const products = await getProducts();
  return (
    <section className="container-x pt-10 pb-20">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <p className="text-sm font-semibold text-mango-600 mb-2">{d.shop.kicker}</p>
        <h1 className="section-title">
          {d.shop.titleA} <span className="shimmer-text">{d.shop.titleB}</span>
        </h1>
        <p className="mt-3 text-ink/60">
          {d.shop.subtitle}
        </p>
      </div>
      <ProductsExplorer products={products} />
    </section>
  );
}
