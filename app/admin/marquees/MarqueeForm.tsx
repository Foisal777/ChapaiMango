"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import {
  upsertMarqueeAction,
  type MarqueeInput
} from "@/app/admin/actions";
import type { AdminMarquee } from "@/lib/admin/data";

const schema = z.object({
  emoji: z.string().max(8, "Onek boro emoji"),
  text: z
    .string()
    .min(2, "Text dorkar")
    .max(200, "Onek boro (max 200 chars)"),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999)
});

type FormValues = z.infer<typeof schema>;

/**
 * Inline create / edit form for a single marquee strip item.
 * `marquee` undefined => create mode, otherwise edit mode.
 */
export default function MarqueeForm({
  marquee,
  onDone
}: {
  marquee?: AdminMarquee;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      emoji: marquee?.emoji ?? "✨",
      text: marquee?.text ?? "",
      is_active: marquee?.is_active ?? true,
      sort_order: marquee?.sort_order ?? 0
    }
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const payload: MarqueeInput = {
        emoji: values.emoji,
        text: values.text,
        is_active: values.is_active,
        sort_order: values.sort_order
      };
      const res = await upsertMarqueeAction(payload, marquee?.id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(marquee ? "Marquee updated" : "Marquee added");
      if (!marquee) reset({ emoji: "✨", text: "", is_active: true, sort_order: 0 });
      onDone?.();
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-2xl p-5 space-y-4">
      <h3 className="font-display text-base font-bold">
        {marquee ? "Edit message" : "Add new message"}
      </h3>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3 sm:col-span-2">
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Emoji
          </label>
          <input
            {...register("emoji")}
            className="input-field text-center text-xl"
            placeholder="🥭"
          />
          {errors.emoji && (
            <p className="text-xs text-red-600 mt-1">{errors.emoji.message}</p>
          )}
        </div>
        <div className="col-span-9 sm:col-span-7">
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Text *
          </label>
          <input
            {...register("text")}
            className="input-field"
            placeholder="যেমন: সারাদেশে ফ্রী ডেলিভারি"
          />
          {errors.text && (
            <p className="text-xs text-red-600 mt-1">{errors.text.message}</p>
          )}
        </div>
        <div className="col-span-6 sm:col-span-2">
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Order
          </label>
          <input
            type="number"
            min={0}
            step={10}
            {...register("sort_order", { valueAsNumber: true })}
            className="input-field"
          />
          <p className="text-[10px] text-ink/40 mt-1">
            Lower = earlier
          </p>
        </div>
        <div className="col-span-6 sm:col-span-1 flex items-end">
          <label className="flex items-center gap-2 cursor-pointer pb-2">
            <input
              type="checkbox"
              {...register("is_active")}
              className="h-4 w-4 accent-mango-500"
            />
            <span className="text-xs font-semibold text-ink/70">Active</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-full border border-mango-200 bg-white px-4 py-2 text-xs font-semibold text-ink/70 hover:bg-mango-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="btn-primary text-sm py-2"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {marquee ? "Save changes" : "Add message"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
