"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, Send, Star } from "lucide-react";
import { submitReviewAction } from "@/app/actions/reviews";
import { cn } from "@/lib/utils";

const schema = z.object({
  rating: z.coerce
    .number()
    .min(1, "রেটিং দিন")
    .max(5, "রেটিং ১-৫ এর মধ্যে"),
  title: z
    .string()
    .max(120, "শিরোনাম ১২০ অক্ষরের বেশি না")
    .optional()
    .or(z.literal("")),
  body: z
    .string()
    .min(5, "অন্তত ৫ অক্ষর লিখুন")
    .max(2000, "২০০০ অক্ষরের বেশি না")
});

type FormValues = z.infer<typeof schema>;

export default function ReviewForm({
  productId,
  productSlug
}: {
  productId: string;
  productSlug: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [hover, setHover] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, title: "", body: "" }
  });
  const rating = watch("rating");

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = await submitReviewAction({
        product_id: productId,
        product_slug: productSlug,
        rating: values.rating,
        title: values.title || undefined,
        body: values.body
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("রিভিউ পোস্ট হয়েছে! ধন্যবাদ।");
      reset();
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-3xl p-6 space-y-4">
      <h3 className="font-display-bn text-xl font-bold">আপনার রিভিউ লিখুন</h3>

      {/* Hidden numeric input bound to react-hook-form, controlled via stars */}
      <input type="hidden" {...register("rating", { valueAsNumber: true })} />

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-2">
          রেটিং *
        </label>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHover(null)}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = (hover ?? rating) >= n;
            return (
              <button
                type="button"
                key={n}
                onMouseEnter={() => setHover(n)}
                onClick={() =>
                  setValue("rating", n, {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                }
                aria-label={`${n} স্টার`}
                className={cn(
                  "p-1 transition-transform active:scale-90",
                  filled ? "text-mango-500" : "text-mango-200"
                )}
              >
                <Star
                  className={cn("h-7 w-7", filled && "fill-mango-500")}
                />
              </button>
            );
          })}
          <span className="ml-3 text-sm font-semibold text-ink/70">
            {rating}/৫
          </span>
        </div>
        {errors.rating && (
          <p className="text-xs text-red-600 mt-1">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          শিরোনাম <span className="text-ink/40 font-normal">(ঐচ্ছিক)</span>
        </label>
        <input
          {...register("title")}
          className="input-field"
          placeholder="এক লাইনে সারমর্ম..."
        />
        {errors.title && (
          <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          আপনার মতামত *
        </label>
        <textarea
          {...register("body")}
          rows={4}
          className="input-field"
          placeholder="আমের স্বাদ, প্যাকেজিং, ডেলিভারি — যা মনে আসে লিখুন..."
        />
        {errors.body && (
          <p className="text-xs text-red-600 mt-1">{errors.body.message}</p>
        )}
      </div>

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> পোস্ট হচ্ছে...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> রিভিউ পোস্ট করুন
          </>
        )}
      </button>
    </form>
  );
}
