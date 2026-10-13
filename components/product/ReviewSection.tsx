import Link from "next/link";
import { MessageCircle, Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getProductReviews, getProductRatingStats } from "@/lib/data";
import ReviewForm from "./ReviewForm";

/**
 * Server component that renders:
 *   - aggregate rating header
 *   - the existing review list (newest first)
 *   - either the review form (if signed in) or a sign-in prompt
 *
 * Embedded in the product detail page below the gallery + buy block.
 * The server fetches reviews + rating in parallel with the product
 * itself so this section adds zero waterfall to the page.
 */
export default async function ReviewSection({
  productId,
  productSlug
}: {
  productId: string;
  productSlug: string;
}) {
  const [user, reviews, stats] = await Promise.all([
    getCurrentUser(),
    getProductReviews(productId),
    getProductRatingStats(productId)
  ]);

  // Have they already reviewed this product? (RLS plus the unique index
  // already prevent it server-side, but hiding the form is friendlier.)
  const ownReview = user
    ? reviews.find((r) => r.user_id === user.id)
    : undefined;

  return (
    <section className="container-x pb-20 pt-2" id="reviews">
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-mango-600 mb-1">━ রিভিউ</p>
          <h2 className="section-title">
            ক্রেতাদের <span className="shimmer-text">মতামত</span>
          </h2>
        </div>
        <RatingSummary average={stats.average} count={stats.count} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Reviews list (left two columns) */}
        <div className="lg:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-mango-400" />
              <p className="mt-3 font-display-bn text-lg font-bold">
                এখনো কোনো রিভিউ নেই
              </p>
              <p className="text-sm text-ink/60 mt-1">
                প্রথম রিভিউটা আপনিই দিন!
              </p>
            </div>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-display-bn text-base font-bold text-ink">
                      {r.author_name}
                    </div>
                    <div className="text-[11px] text-ink/50 mt-0.5">
                      {new Date(r.created_at).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </div>
                  </div>
                  <Stars value={r.rating} />
                </div>
                {r.title && (
                  <h4 className="font-display-bn text-sm font-bold mt-3">
                    {r.title}
                  </h4>
                )}
                <p className="mt-1.5 text-sm text-ink/80 leading-relaxed whitespace-pre-line">
                  {r.body}
                </p>
              </article>
            ))
          )}
        </div>

        {/* Form / sign-in prompt (right column) */}
        <aside className="lg:sticky lg:top-24 self-start">
          {!user ? (
            <div className="glass rounded-3xl p-6 text-center">
              <h3 className="font-display-bn text-lg font-bold">
                রিভিউ দিতে সাইন ইন করুন
              </h3>
              <p className="text-sm text-ink/60 mt-2">
                আপনার অভিজ্ঞতা অন্যদের সাহায্য করবে। ফোন/ইমেইল বা Google
                দিয়ে সাইন ইন করুন।
              </p>
              <Link
                href={`/login?next=/products/${productSlug}%23reviews`}
                className="btn-primary mt-4 inline-flex"
              >
                সাইন ইন
              </Link>
            </div>
          ) : ownReview ? (
            <div className="glass rounded-3xl p-6 text-center">
              <h3 className="font-display-bn text-lg font-bold">
                ধন্যবাদ!
              </h3>
              <p className="text-sm text-ink/60 mt-2">
                আপনি ইতিমধ্যে এই আমের জন্য রিভিউ দিয়েছেন।
              </p>
            </div>
          ) : (
            <ReviewForm productId={productId} productSlug={productSlug} />
          )}
        </aside>
      </div>
    </section>
  );
}

function RatingSummary({
  average,
  count
}: {
  average: number;
  count: number;
}) {
  return (
    <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3">
      <Star className="h-6 w-6 fill-mango-500 text-mango-500" />
      <div>
        <div className="font-display-bn text-2xl font-bold text-mango-700 leading-none">
          {average.toFixed(1)}
        </div>
        <div className="text-[11px] text-ink/60">
          {count > 0 ? `${count}টি রিভিউ` : "এখনো রেটিং সেট"}
        </div>
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= value
              ? "h-4 w-4 fill-mango-500 text-mango-500"
              : "h-4 w-4 text-mango-200"
          }
        />
      ))}
    </div>
  );
}
