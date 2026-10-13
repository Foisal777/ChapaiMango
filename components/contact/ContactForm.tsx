"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useMemo } from "react";
import type { Dictionary } from "@/lib/i18n";

function buildSchema(d: Dictionary) {
  return z.object({
    name: z.string().min(2, d.checkout.errors.name),
    email: z.string().email(d.checkout.errors.email).optional().or(z.literal("")),
    phone: z.string().min(10, d.checkout.errors.phone).optional().or(z.literal("")),
    message: z.string().min(10, d.contact.messagePh)
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function ContactForm() {
  const { t: d } = useLocale();
  const schema = useMemo(() => buildSchema(d), [d]);
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
      toast.success(d.contact.sent);
      reset();
    } catch (err) {
      console.error(err);
      toast.error(d.contact.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          {d.contact.name}
        </label>
        <input
          {...register("name")}
          className="input-field"
          placeholder={d.contact.namePh}
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            {d.contact.email}
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
            {d.contact.phone}
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
          {d.contact.message}
        </label>
        <textarea
          {...register("message")}
          rows={5}
          className="input-field"
          placeholder={d.contact.messagePh}
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
        {loading ? d.contact.sending : d.contact.send}
      </button>
    </form>
  );
}
