import CartView from "@/components/cart/CartView";

export const metadata = { title: "কার্ট — Chapai Mango House" };

export default function CartPage() {
  return (
    <section className="container-x pt-10 pb-20">
      <div className="mb-8">
        <p className="text-sm font-semibold text-mango-600 mb-2">━ কার্ট</p>
        <h1 className="section-title">
          আপনার <span className="shimmer-text">কার্ট</span>
        </h1>
      </div>
      <CartView />
    </section>
  );
}
