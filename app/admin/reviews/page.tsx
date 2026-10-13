import Link from "next/link";
import { MessageCircle, Star } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { fetchAdminReviews } from "@/lib/admin/data";
import ReviewModerationActions from "./ReviewModerationActions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await fetchAdminReviews();
  const pending = reviews.filter((r) => !r.is_approved).length;

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle={`${reviews.length} review${
          reviews.length === 1 ? "" : "s"
        } total · ${pending} hidden`}
      />

      {reviews.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center">
          <MessageCircle className="h-14 w-14 mx-auto text-mango-400" />
          <p className="mt-3 font-display text-lg">Akhono kono review nei</p>
          <p className="text-sm text-ink/50 mt-1">
            Customer review dile ekhane dekha jabe.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Stars value={r.rating} />
                    <span className="text-xs font-semibold text-ink/60">
                      {r.author_name}
                    </span>
                    {!r.is_approved && (
                      <span className="rounded-full bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                        Hidden
                      </span>
                    )}
                  </div>
                  {r.product_slug ? (
                    <Link
                      href={`/products/${r.product_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-mango-700 hover:underline"
                    >
                      {r.product_name || r.product_slug} →
                    </Link>
                  ) : (
                    <span className="text-xs text-ink/40">
                      (deleted product)
                    </span>
                  )}
                  {r.title && (
                    <h3 className="font-display-bn text-sm font-bold mt-2">
                      {r.title}
                    </h3>
                  )}
                  <p className="mt-1 text-sm text-ink/80 leading-relaxed whitespace-pre-line">
                    {r.body}
                  </p>
                  <div className="mt-2 text-[11px] text-ink/40">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <ReviewModerationActions
                  id={r.id}
                  isApproved={r.is_approved}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= value
              ? "h-3.5 w-3.5 fill-mango-500 text-mango-500"
              : "h-3.5 w-3.5 text-mango-200"
          }
        />
      ))}
    </span>
  );
}
