"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, Save, ChevronLeft } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import Link from "next/link";
import { upsertProductAction, type ProductInput } from "@/app/admin/actions";
import { slugify } from "@/lib/utils";
import type { Mango } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nam dorkar"),
  slug: z
    .string()
    .min(2, "Slug dorkar")
    .regex(/^[a-z0-9-]+$/, "Only lowercase, numbers, hyphens"),
  variety: z.string().min(2, "Variety dorkar"),
  price_per_kg: z.coerce.number().min(0, "Price negative hote pare na"),
  stock_kg: z.coerce.number().min(0, "Stock negative hote pare na"),
  short_description: z.string().min(5, "Choto bornona din"),
  description: z.string().min(10, "Bornona din"),
  rating: z.coerce.number().min(0).max(5),
  is_featured: z.boolean(),
  origin: z.string().min(2),
  season: z.string().min(2)
});

type FormValues = z.infer<typeof schema>;

export default function ProductForm({
  product
}: {
  product?: Mango | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [images, setImages] = useState<string[]>(product?.images || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      variety: product?.variety || "",
      price_per_kg: product?.price_per_kg || 0,
      stock_kg: product?.stock_kg || 0,
      short_description: product?.short_description || "",
      description: product?.description || "",
      rating: product?.rating ?? 5,
      is_featured: product?.is_featured ?? false,
      origin: product?.origin || "Chapainawabganj, Bangladesh",
      season: product?.season || "May - August"
    }
  });

  const currentName = watch("name");
  const currentSlug = watch("slug");

  const autoSlug = () => {
    if (currentName) setValue("slug", slugify(currentName));
  };

  const onSubmit = (values: FormValues) => {
    if (images.length === 0) {
      toast.error("Onnoto 1 ta product image lagbe");
      return;
    }
    const payload: ProductInput = {
      ...values,
      images
    };
    startTransition(async () => {
      const res = await upsertProductAction(payload, product?.id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(product ? "Product updated" : "Product created");
        router.push("/admin/products");
        router.refresh();
      }
    });
  };

  return (
    <>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-mango-700 hover:gap-2 transition-all mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> All products
      </Link>

      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-6">
        {product ? "Edit product" : "Add new product"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic */}
          <Card title="Basic info">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Product name *" error={errors.name?.message}>
                <input
                  {...register("name")}
                  className="input-field"
                  placeholder="Premium Himsagar"
                  onBlur={() => !currentSlug && autoSlug()}
                />
              </Field>
              <Field label="Slug *" error={errors.slug?.message}>
                <div className="flex gap-2">
                  <input
                    {...register("slug")}
                    className="input-field font-mono text-sm"
                    placeholder="himsagar"
                  />
                  <button
                    type="button"
                    onClick={autoSlug}
                    className="rounded-xl border border-mango-300 px-3 text-xs font-semibold text-mango-700 hover:bg-mango-100 whitespace-nowrap"
                  >
                    Auto
                  </button>
                </div>
              </Field>
              <Field label="Variety *" error={errors.variety?.message}>
                <input
                  {...register("variety")}
                  className="input-field"
                  placeholder="Himsagar"
                />
              </Field>
              <Field label="Rating (0-5)" error={errors.rating?.message}>
                <input
                  type="number"
                  step="0.1"
                  {...register("rating")}
                  className="input-field"
                />
              </Field>
            </div>
          </Card>

          {/* Pricing & inventory */}
          <Card title="Pricing & Inventory">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Price per kg (BDT) *"
                error={errors.price_per_kg?.message}
              >
                <input
                  type="number"
                  step="0.01"
                  {...register("price_per_kg")}
                  className="input-field"
                  placeholder="180"
                />
              </Field>
              <Field
                label="Stock (kg) *"
                error={errors.stock_kg?.message}
              >
                <input
                  type="number"
                  step="0.01"
                  {...register("stock_kg")}
                  className="input-field"
                  placeholder="500"
                />
              </Field>
              <Field label="Origin">
                <input
                  {...register("origin")}
                  className="input-field"
                />
              </Field>
              <Field label="Season">
                <input
                  {...register("season")}
                  className="input-field"
                  placeholder="May - August"
                />
              </Field>
            </div>
          </Card>

          {/* Description */}
          <Card title="Description">
            <Field
              label="Short description *"
              error={errors.short_description?.message}
            >
              <input
                {...register("short_description")}
                className="input-field"
                placeholder="Bangla aam-er raja — mishti, rosalo, sugondhi."
              />
            </Field>
            <Field
              label="Full description *"
              error={errors.description?.message}
            >
              <textarea
                {...register("description")}
                rows={5}
                className="input-field"
                placeholder="Sompurno bornona — taste, texture, history, etc."
              />
            </Field>
          </Card>

          {/* Images — gallery-first picker */}
          <Card title="Product ছবি">
            <p className="text-xs text-ink/50 mb-3">
              নতুন প্রোডাক্টের ছবি এখন সরাসরি ফোন/কম্পিউটারের গ্যালারি থেকে
              সিলেক্ট করা যাবে — URL খোঁজা লাগবে না। অন্তত ১টা ছবি লাগবে,
              প্রথম ছবিটাই কভার হিসেবে দেখাবে।
            </p>
            <ImageUploadField images={images} onChange={setImages} folder="products" max={8} label="প্রোডাক্টের ছবি" />
          </Card>
        </div>

        {/* Right rail */}
        <aside className="lg:sticky lg:top-6 self-start space-y-4">
          <Card title="Visibility">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_featured")}
                className="mt-1 h-4 w-4 accent-mango-500 cursor-pointer"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">
                  Featured product
                </span>
                <span className="block text-xs text-ink/50">
                  Homepage-er top section-e show korbe.
                </span>
              </span>
            </label>
          </Card>

          <button
            type="submit"
            disabled={pending}
            className="btn-primary w-full"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {product ? "Save changes" : "Create product"}
              </>
            )}
          </button>

          <Link
            href="/admin/products"
            className="block text-center text-xs text-ink/50 hover:text-mango-700"
          >
            Cancel
          </Link>
        </aside>
      </form>
    </>
  );
}

function Card({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="font-display text-base font-bold mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink/70 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
