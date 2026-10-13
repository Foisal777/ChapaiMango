"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Plus, Trash2, Loader2, Save, ImagePlus, ChevronLeft } from "lucide-react";
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
  const [imageInput, setImageInput] = useState("");

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

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Valid URL din (https://...)");
      return;
    }
    setImages((prev) => [...prev, url]);
    setImageInput("");
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
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

          {/* Images */}
          <Card title="Images">
            <p className="text-xs text-ink/50 mb-3">
              Image URL paste korun (Unsplash, Supabase Storage, ba ono kothao
              hosted). Onnoto 1 ta lagbe.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
                className="input-field flex-1"
                placeholder="https://images.unsplash.com/..."
              />
              <button
                type="button"
                onClick={addImage}
                className="rounded-xl bg-mango-gradient px-4 text-sm font-semibold text-ink hover:scale-105 transition shrink-0 inline-flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {images.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-mango-300 p-8 text-center text-sm text-ink/50">
                <ImagePlus className="h-10 w-10 mx-auto text-mango-400 mb-2" />
                Akhono kono image add hoy ni
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((src, i) => (
                  <div
                    key={src + i}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-mango-100 border border-mango-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.3";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 grid place-items-center h-7 w-7 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded-full bg-mango-gradient px-2 py-0.5 text-[10px] font-bold text-ink shadow-glow">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
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
