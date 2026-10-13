"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const schema = z.object({
  name: z.string().min(2, "আপনার নাম লিখুন"),
  email: z
    .string()
    .email("সঠিক ইমেইল দিন")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(10, "সঠিক ফোন নম্বর দিন")
    .optional()
    .or(z.literal("")),
  message: z.string().min(10, "অন্তত ১০ অক্ষর লিখুন")
});

type FormValues = z.infer<typeof schema>;

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error } = await supabase.from("contact_messages").insert({
          name: values.name,
          email: values.email || null,
          phone: values.phone || null,
          message: values.message
        });
        if (error) throw error;
      }
      toast.success("মেসেজ পাঠিয়েছি! শীঘ্রই যোগাযোগ করব। ধন্যবাদ।");
      reset();
    } catch (err) {
      console.error(err);
      toast.error("কিছু ভুল হয়েছে। আবার চেষ্টা করুন বা ফোন করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          নাম *
        </label>
        <input
          {...register("name")}
          className="input-field"
          placeholder="আপনার নাম"
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            ইমেইল
          </label>
          <input
            {...register("email")}
            className="input-field"
            placeholder="you@email.com"
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            ফোন
          </label>
          <input
            {...register("phone")}
            className="input-field"
            placeholder="01XXXXXXXXX"
          />
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          মেসেজ *
        </label>
        <textarea
          {...register("message")}
          rows={5}
          className="input-field"
          placeholder="আপনার মেসেজ এখানে লিখুন..."
        />
        {errors.message && (
          <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full sm:w-auto"
      >
        <Send className="h-4 w-4" />
        {loading ? "পাঠাচ্ছি..." : "মেসেজ পাঠান"}
      </button>
    </form>
  );
}
