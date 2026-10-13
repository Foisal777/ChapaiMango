import { redirect } from "next/navigation";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata = { title: "চেকআউট — Chapai Mango House" };

export default async function CheckoutPage() {
  const d = getDictionary(getLocale());
  // Force login for checkout. Without an account we can't attach
  // the order to a user_id which the new RLS policy requires.
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) redirect("/login?next=/checkout");
  }

  return (
    <section className="container-x pt-10 pb-20">
      <div className="mb-8">
        <p className="text-sm font-semibold text-mango-600 mb-2">{d.checkout.kicker}</p>
        <h1 className="section-title">
          {d.checkout.titleA} <span className="shimmer-text">{d.checkout.titleB}</span>
        </h1>
      </div>
      <CheckoutForm />
    </section>
  );
}
