import { redirect } from "next/navigation";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "চেকআউট — Chapai Mango House" };

export default async function CheckoutPage() {
  // Force login for checkout. Without an account we can't attach
  // the order to a user_id which the new RLS policy requires.
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) redirect("/login?next=/checkout");
  }

  return (
    <section className="container-x pt-10 pb-20">
      <div className="mb-8">
        <p className="text-sm font-semibold text-mango-600 mb-2">━ চেকআউট</p>
        <h1 className="section-title">
          অর্ডার <span className="shimmer-text">কনফার্ম করুন</span>
        </h1>
      </div>
      <CheckoutForm />
    </section>
  );
}
