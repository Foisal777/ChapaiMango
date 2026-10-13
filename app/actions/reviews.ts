"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type ReviewInput = {
  product_id: string;
  product_slug: string;
  rating: number;
  title?: string;
  body: string;
};

export type ReviewActionResult =
  | { ok: true; id: string }
  | { error: string };

/**
 * Submit a new review for a product. The DB trigger
 * `recompute_product_rating` will refresh products.rating /
 * products.review_count atomically — no application-level math here.
 *
 * Auth-required. Anonymous reviews are intentionally not allowed; we
 * use the signed-in user's full_name (or email local-part) as
 * `author_name`, and store user_id so they can edit/delete their own.
 *
 * The (product_id, user_id) unique index in the migration prevents
 * double-submissions; we surface that as a friendly Bangla error
 * instead of leaking the Postgres message.
 */
export async function submitReviewAction(
  input: ReviewInput
): Promise<ReviewActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase কনফিগার হয়নি" };
  }

  // Light validation here too (the form already validates via zod).
  if (
    !input.product_id ||
    !input.body ||
    input.body.trim().length < 5 ||
    input.body.length > 2000 ||
    !Number.isFinite(input.rating) ||
    input.rating < 1 ||
    input.rating > 5
  ) {
    return { error: "রিভিউ ফর্মে ভুল ডেটা" };
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "রিভিউ দিতে সাইন ইন করুন" };
  }

  const author_name =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    (user.email ? user.email.split("@")[0] : "") ||
    "Customer";

  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: input.product_id,
      user_id: user.id,
      author_name,
      rating: Math.round(input.rating),
      title: input.title?.trim() || null,
      body: input.body.trim(),
      is_approved: true
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "আপনি এই আমের জন্য আগেই একটা রিভিউ দিয়েছেন" };
    }
    return { error: error.message };
  }

  revalidatePath(`/products/${input.product_slug}`);
  revalidatePath("/products");
  revalidatePath("/");
  return { ok: true, id: data!.id };
}

/** Customer-side delete of their own review. Admin uses a separate action. */
export async function deleteOwnReviewAction(
  reviewId: string,
  productSlug: string
): Promise<ReviewActionResult> {
  if (!isSupabaseConfigured()) return { error: "Supabase কনফিগার হয়নি" };
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "সাইন ইন করুন" };

  // RLS already enforces ownership, but double-check for a friendly error.
  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath(`/products/${productSlug}`);
  return { ok: true, id: reviewId };
}
