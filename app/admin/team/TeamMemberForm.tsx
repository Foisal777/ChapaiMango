"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import {
  upsertTeamMemberAction,
  type TeamMemberInput
} from "@/app/admin/actions";
import type { AdminTeamMember } from "@/lib/admin/data";

// Zod mirrors the server-side validation in `sanitiseTeamMember` so
// the user gets immediate inline feedback. URLs are optional but if
// present must start with http(s).
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^https?:\/\//i.test(v), {
    message: "Must start with http:// or https://"
  });

const schema = z.object({
  name: z.string().min(2, "Name dorkar").max(120, "Onek boro"),
  role: z.enum(["founder", "supplier", "member"]),
  title: z.string().max(200, "Onek boro").optional().default(""),
  bio: z.string().max(2000, "Onek boro (max 2000)").optional().default(""),
  photo_url: optionalUrl,
  phone: z.string().max(40).optional().default(""),
  email: z
    .string()
    .max(120)
    .optional()
    .default("")
    .refine((v) => !v || /.+@.+\..+/.test(v), {
      message: "Email valid noy"
    }),
  facebook_url: optionalUrl,
  sort_order: z.coerce.number().int().min(0).max(9999),
  is_active: z.boolean()
});

type FormValues = z.infer<typeof schema>;

/**
 * Inline create / edit form for a Team Member entry. Mirrors the
 * UX of /admin/marquees so the operator gets the same workflow.
 *
 * Photo handling: we accept a public image URL (paste from
 * Supabase Storage, Unsplash, FB CDN — anything). Keeps the form
 * simple and stays consistent with how /admin/products handles
 * images today.
 */
export default function TeamMemberForm({
  member,
  onDone
}: {
  member?: AdminTeamMember;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: member?.name ?? "",
      role: member?.role ?? "member",
      title: member?.title ?? "",
      bio: member?.bio ?? "",
      photo_url: member?.photo_url ?? "",
      phone: member?.phone ?? "",
      email: member?.email ?? "",
      facebook_url: member?.facebook_url ?? "",
      sort_order: member?.sort_order ?? 100,
      is_active: member?.is_active ?? true
    }
  });

  const photoPreview = watch("photo_url");

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const payload: TeamMemberInput = {
        name: values.name,
        role: values.role,
        title: values.title || "",
        bio: values.bio || "",
        photo_url: values.photo_url || "",
        phone: values.phone || null,
        email: values.email || null,
        facebook_url: values.facebook_url || null,
        sort_order: values.sort_order,
        is_active: values.is_active
      };
      const res = await upsertTeamMemberAction(payload, member?.id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(member ? "Team member updated" : "Team member added");
      if (!member) {
        reset({
          name: "",
          role: "member",
          title: "",
          bio: "",
          photo_url: "",
          phone: "",
          email: "",
          facebook_url: "",
          sort_order: 100,
          is_active: true
        });
      }
      onDone?.();
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="glass rounded-2xl p-5 space-y-4"
    >
      <h3 className="font-display text-base font-bold">
        {member ? "Edit team member" : "Add new team member"}
      </h3>

      <div className="grid grid-cols-12 gap-3">
        {/* Photo preview + URL */}
        <div className="col-span-12 sm:col-span-3">
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Photo
          </label>
          <div className="aspect-square rounded-2xl overflow-hidden bg-mango-50 border border-mango-200">
            {photoPreview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photoPreview}
                alt="preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-mango-400 text-3xl">
                🥭
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 sm:col-span-9 space-y-3">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 sm:col-span-7">
              <label className="block text-xs font-semibold text-ink/70 mb-1.5">
                Name *
              </label>
              <input
                {...register("name")}
                className="input-field"
                placeholder="যেমন: MD FOISAL IQBAL"
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="col-span-7 sm:col-span-3">
              <label className="block text-xs font-semibold text-ink/70 mb-1.5">
                Role *
              </label>
              <select {...register("role")} className="input-field">
                <option value="founder">Founder</option>
                <option value="supplier">Supplier</option>
                <option value="member">Team Member</option>
              </select>
            </div>

            <div className="col-span-5 sm:col-span-2">
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
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1.5">
              Photo URL
            </label>
            <input
              {...register("photo_url")}
              className="input-field"
              placeholder="https://… (Supabase storage / Unsplash / FB CDN)"
            />
            {errors.photo_url && (
              <p className="text-xs text-red-600 mt-1">
                {errors.photo_url.message}
              </p>
            )}
            <p className="text-[10px] text-ink/40 mt-1">
              Public-e access kora jay emon ekta image link paste koren.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1.5">
              Title / Designation
            </label>
            <input
              {...register("title")}
              className="input-field"
              placeholder="যেমন: প্রতিষ্ঠাতা ও পরিচালক"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1.5">
              Bio
            </label>
            <textarea
              {...register("bio")}
              rows={3}
              className="input-field resize-y"
              placeholder="Short paragraph about this person…"
            />
            {errors.bio && (
              <p className="text-xs text-red-600 mt-1">{errors.bio.message}</p>
            )}
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 sm:col-span-4">
              <label className="block text-xs font-semibold text-ink/70 mb-1.5">
                Phone (optional)
              </label>
              <input
                {...register("phone")}
                className="input-field"
                placeholder="+8801XXXXXXXXX"
              />
            </div>
            <div className="col-span-12 sm:col-span-4">
              <label className="block text-xs font-semibold text-ink/70 mb-1.5">
                Email (optional)
              </label>
              <input
                {...register("email")}
                className="input-field"
                placeholder="someone@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="col-span-12 sm:col-span-4">
              <label className="block text-xs font-semibold text-ink/70 mb-1.5">
                Facebook URL (optional)
              </label>
              <input
                {...register("facebook_url")}
                className="input-field"
                placeholder="https://facebook.com/…"
              />
              {errors.facebook_url && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.facebook_url.message}
                </p>
              )}
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("is_active")}
              className="h-4 w-4 accent-mango-500"
            />
            <span className="text-xs font-semibold text-ink/70">
              Active (public /team page-e show korbe)
            </span>
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
              {member ? "Save changes" : "Add member"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
