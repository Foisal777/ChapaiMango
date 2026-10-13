import CartView from "@/components/cart/CartView";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata = { title: "কার্ট — Chapai Mango House" };

export default function CartPage() {
  const d = getDictionary(getLocale());
  return (
    <section className="container-x pt-10 pb-20">
      <div className="mb-8">
        <p className="text-sm font-semibold text-mango-600 mb-2">{d.cart.kicker}</p>
        <h1 className="section-title">
          {d.cart.titleA} <span className="shimmer-text">{d.cart.titleB}</span>
        </h1>
      </div>
      <CartView />
    </section>
  );
}
