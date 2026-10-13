import { Shield } from "lucide-react";
import { getRefundPolicy } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";

export const metadata = {
  title: "রিফান্ড পলিসি — Chapai Mango House",
  description:
    "Chapai Mango House-এর রিফান্ড ও রিটার্ন নীতি — কখন রিফান্ড পাবেন, কীভাবে অভিযোগ করবেন, কতদিনে সমাধান হবে।"
};

/**
 * Public refund policy page. Source of truth is the
 * single-row `refund_policy` table — admin edits content from
 * /admin/refund-policy. We revalidate hourly so a freshly
 * saved policy goes live within minutes, but `updateRefundPolicyAction`
 * also calls `revalidatePath("/refund")` for instant refresh.
 */
export const revalidate = 3600;

export default async function RefundPolicyPage() {
  const policy = await getRefundPolicy();
  const html = renderMarkdown(policy.body_md);
  const updated = policy.updated_at
    ? new Date(policy.updated_at).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : null;

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-radial">
        <div className="container-x py-16 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-mango-600 mb-2">
            ━ আইনি ডকুমেন্ট
          </p>
          <h1 className="font-display-bn text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            <span className="shimmer-text">রিফান্ড</span> পলিসি
          </h1>
          <p className="mt-5 text-ink/70 text-base sm:text-lg">
            অর্ডার পেয়ে কোনো সমস্যা হলে কীভাবে রিফান্ড / রিপ্লেসমেন্ট পাবেন
            — তার সম্পূর্ণ নির্দেশিকা।
          </p>
          {updated && (
            <p className="mt-3 text-xs text-ink/50">
              সর্বশেষ হালনাগাদ: {updated}
            </p>
          )}
        </div>
      </section>

      {/* Policy body */}
      <section className="container-x py-14 max-w-4xl mx-auto">
        <article className="glass rounded-3xl p-6 sm:p-10">
          <header className="flex items-center gap-3 mb-6 pb-5 border-b border-mango-200/60">
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-mango-gradient shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display-bn text-lg sm:text-xl font-bold text-ink">
                Chapai Mango House
              </h2>
              <p className="text-xs text-ink/55">
                গ্রাহক সন্তুষ্টি — আমাদের সর্বোচ্চ অগ্রাধিকার
              </p>
            </div>
          </header>

          {/* Rendered markdown body. The renderMarkdown() helper
              escapes input first and only re-introduces a closed
              set of safe tags, so dangerouslySetInnerHTML is OK
              here even though body_md comes from operator input. */}
          <div
            className="refund-prose text-ink/80 text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </section>
    </>
  );
}
