"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { formatBDT } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  amountToSendNow,
  calcDeliveryFee,
  config as siteConfig,
  defaultPaymentMethod,
  getEnabledPaymentMethodsInfo,
  paymentMethodInfo
} from "@/lib/config";
import PaymentBrandLogo from "@/components/payment/PaymentBrandLogo";
import type { PaymentMethod } from "@/types";
import type { BankAccountInfo } from "@/lib/config";
import type { User } from "@supabase/supabase-js";

const DISTRICTS = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Chapainawabganj",
  "Other"
];

const PAYMENT_METHOD_VALUES = [
  "cod",
  "bkash",
  "nagad",
  "rocket",
  "upay",
  "bank"
] as const;

const schema = z
  .object({
    customer_name: z.string().min(2, "আপনার নাম লিখুন"),
    phone: z.string().min(10, "সঠিক ফোন নম্বর দিন").max(15),
    email: z.string().email().optional().or(z.literal("")),
    district: z.string().min(2, "জেলা নির্বাচন করুন"),
    address: z.string().min(8, "সম্পূর্ণ ঠিকানা লিখুন"),
    notes: z.string().optional(),
    payment_method: z.enum(PAYMENT_METHOD_VALUES),
    payment_txn_id: z.string().optional(),
    payment_sender_number: z.string().optional()
  })
  .refine(
    (data) => siteConfig.paymentMethods.includes(data.payment_method),
    {
      message: "এই পেমেন্ট পদ্ধতি বর্তমানে চালু নেই",
      path: ["payment_method"]
    }
  )
  .superRefine((data, ctx) => {
    // If the chosen method needs an up-front payment, both TrxID and
    // sender-number must be present. We can't know `total` here so we
    // approximate with "anything that isn't COD-with-zero-advance" —
    // for COD with advance>0 the customer sent money via some other
    // rail, so they have a TrxID to enter.
    const info = paymentMethodInfo(data.payment_method);
    const needsProof =
      info.advance > 0 || (data.payment_method !== "cod");
    if (!needsProof) return;
    if (!data.payment_txn_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payment_txn_id"],
        message: "Transaction ID দিন"
      });
    }
    if (!data.payment_sender_number?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payment_sender_number"],
        message: "যে নম্বর/অ্যাকাউন্ট থেকে পাঠিয়েছেন সেটা দিন"
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export default function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id?: string; methodLabel?: string } | null>(
    null
  );
  const [user, setUser] = useState<User | null>(null);

  const deliveryFee = calcDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;

  // The full list of methods the operator has enabled, with their
  // configured number + advance + label. Render order is the order
  // returned by `getEnabledPaymentMethodsInfo()`, which mirrors the
  // operator's NEXT_PUBLIC_PAYMENT_METHODS env var (or the built-in
  // default `cod, bkash, nagad, rocket, upay, bank`).
  const methods = useMemo(() => getEnabledPaymentMethodsInfo(), []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { payment_method: defaultPaymentMethod() }
  });

  // Pull the signed-in user (server already redirected unauthed visitors
  // to /login). Pre-fill name/phone from sign-up metadata.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u);
      if (u) {
        const metaPhone =
          (u.user_metadata?.phone as string | undefined) || u.phone || "";
        const metaEmail =
          (u.user_metadata?.email as string | undefined) || u.email || "";
        reset((prev) => ({
          ...prev,
          customer_name:
            (u.user_metadata?.full_name as string | undefined) ||
            prev.customer_name ||
            "",
          phone: metaPhone || prev.phone || "",
          email: metaEmail || prev.email || ""
        }));
      }
    });
  }, [reset]);

  const selectedCode = watch("payment_method") as PaymentMethod;
  const selectedInfo = useMemo(
    () => methods.find((m) => m.code === selectedCode) ?? methods[0],
    [methods, selectedCode]
  );

  // What the customer actually has to send up front for the chosen
  // method. 0 = classic COD (pay full on delivery, no TrxID needed).
  const sendNow = selectedInfo ? amountToSendNow(selectedInfo, total) : 0;
  const receivingNumber = selectedInfo?.accountNumber || "";

  const onSubmit = async (values: FormValues) => {
    if (items.length === 0) {
      toast.error("কার্ট ফাঁকা — কিছু যোগ করুন");
      router.push("/products");
      return;
    }
    const totalKg = items.reduce((s, i) => s + (i.quantity_kg || 0), 0);
    if (siteConfig.minOrderKg > 0 && totalKg < siteConfig.minOrderKg) {
      toast.error(
        `ন্যূনতম অর্ডার ${siteConfig.minOrderKg} কেজি — কার্টে এখন ${totalKg} কেজি`
      );
      router.push("/cart");
      return;
    }
    if (isSupabaseConfigured() && !user) {
      toast.error("অর্ডার করতে সাইন ইন করুন");
      router.push("/login?next=/checkout");
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        user_id: user?.id ?? null,
        customer_name: values.customer_name,
        phone: values.phone,
        email:
          values.email ||
          user?.email ||
          (user?.user_metadata?.email as string | undefined) ||
          null,
        address: values.address,
        district: values.district,
        items,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: values.payment_method,
        payment_txn_id: values.payment_txn_id || null,
        payment_sender_number: values.payment_sender_number || null,
        notes: values.notes || null,
        status: "pending"
      };

      let id: string | undefined;
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .insert(orderPayload)
          .select("id")
          .single();
        if (error) throw error;
        id = data?.id;
      } else {
        console.warn("Supabase not configured; order shown but not persisted.");
        id = "demo-" + Date.now();
      }

      clear();
      setDone({ id, methodLabel: selectedInfo?.label });
      toast.success("অর্ডার কনফার্ম! ধন্যবাদ।");
    } catch (err) {
      console.error("[checkout] order insert failed:", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message?: unknown }).message)
            : "Unknown error";
      toast.error(`অর্ডার দেওয়া যায়নি: ${msg}`, { duration: 8000 });
    } finally {
      setSubmitting(false);
    }
  };

  const copy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("কপি হয়েছে: " + text);
  };

  if (done) {
    return (
      <div className="glass rounded-3xl p-10 text-center">
        <CheckCircle2 className="h-20 w-20 mx-auto text-leaf-500" />
        <h2 className="font-display-bn text-2xl sm:text-3xl font-bold mt-4">
          অর্ডার কনফার্ম!
        </h2>
        <p className="mt-2 text-ink/70 max-w-md mx-auto">
          ধন্যবাদ! আমরা আপনার {done.methodLabel ?? ""} অর্ডার পেয়েছি। অর্ডার ID:{" "}
          <span className="font-mono font-semibold break-all">{done.id}</span>।
          আমাদের টিম শীঘ্রই ফোন করে কনফার্ম করবে।
        </p>
        <div className="flex gap-3 justify-center mt-6 flex-wrap">
          <Link href="/" className="btn-ghost">
            হোমে ফিরুন
          </Link>
          {done.id && (
            <Link
              href={`/track?id=${encodeURIComponent(done.id)}`}
              className="btn-ghost"
            >
              ট্র্যাক করুন
            </Link>
          )}
          <Link href="/products" className="btn-primary">
            আরও কিনুন
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass rounded-3xl p-14 text-center">
        <p className="text-ink/60">কার্ট ফাঁকা — চেকআউট করার মতো কিছু নেই।</p>
        <Link href="/products" className="btn-primary mt-5 inline-flex">
          শপে ফিরুন
        </Link>
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="glass rounded-3xl p-14 text-center">
        <p className="text-ink/60">
          এখন কোনো পেমেন্ট পদ্ধতি চালু নেই — অ্যাডমিনকে জানান।
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2 space-y-6">
        {/* Contact */}
        <Card title="যোগাযোগের তথ্য">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="নাম *" error={errors.customer_name?.message}>
              <input
                {...register("customer_name")}
                className="input-field"
                placeholder="মোঃ রহিম উদ্দিন"
              />
            </Field>
            <Field label="ফোন *" error={errors.phone?.message}>
              <input
                {...register("phone")}
                className="input-field"
                placeholder="01XXXXXXXXX"
              />
            </Field>
            <Field label="ইমেইল (ঐচ্ছিক)" error={errors.email?.message}>
              <input
                {...register("email")}
                className="input-field"
                placeholder="you@email.com"
              />
            </Field>
            <Field label="জেলা *" error={errors.district?.message}>
              <select {...register("district")} className="input-field">
                <option value="">জেলা নির্বাচন করুন</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        {/* Address */}
        <Card title="ডেলিভারি ঠিকানা">
          <Field label="সম্পূর্ণ ঠিকানা *" error={errors.address?.message}>
            <textarea
              {...register("address")}
              rows={3}
              className="input-field"
              placeholder="বাড়ি, রোড, এরিয়া, থানা, পোস্ট কোড"
            />
          </Field>
          <Field label="বিশেষ নির্দেশনা (ঐচ্ছিক)">
            <textarea
              {...register("notes")}
              rows={2}
              className="input-field"
              placeholder="যেমন: গেটে আসার আগে ফোন দিন"
            />
          </Field>
        </Card>

        {/* Payment */}
        <Card title="পেমেন্ট পদ্ধতি">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {methods.map((m) => {
              const active = selectedCode === m.code;
              return (
                <label
                  key={m.code}
                  className={`relative cursor-pointer rounded-2xl border-2 p-3 sm:p-4 text-center transition ${
                    active
                      ? "border-mango-500 bg-mango-50 shadow-glow"
                      : "border-mango-200 bg-white hover:border-mango-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={m.code}
                    {...register("payment_method")}
                    onChange={(e) => {
                      setValue(
                        "payment_method",
                        e.target.value as PaymentMethod,
                        { shouldValidate: true }
                      );
                      // Clear stale TrxID/sender when switching methods so a
                      // hidden value can't leak into the next submit.
                      setValue("payment_txn_id", "");
                      setValue("payment_sender_number", "");
                    }}
                    className="sr-only"
                  />
                  <div className="flex justify-center mb-2">
                    <PaymentBrandLogo code={m.code} size="md" />
                  </div>
                  <div className="font-semibold text-xs sm:text-sm leading-tight text-ink/80">
                    {m.label}
                  </div>
                  {m.advance > 0 && (
                    <div className="text-[10px] text-mango-700 font-bold mt-1">
                      Advance {formatBDT(m.advance)}
                    </div>
                  )}
                </label>
              );
            })}
          </div>

          {selectedInfo && (
            <div className="mt-5 rounded-2xl border-2 border-dashed border-mango-300 bg-mango-50 p-5">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <PaymentBrandLogo code={selectedInfo.code} size="sm" />
                <span className="text-sm font-semibold text-ink">
                  {selectedInfo.label}
                </span>
              </div>

              {sendNow > 0 ? (
                <>
                  <p className="text-sm text-ink/80">
                    {selectedInfo.code === "bank" ? (
                      <>
                        <strong>{formatBDT(sendNow)}</strong> এই অ্যাকাউন্টে
                        ট্রান্সফার করুন:
                      </>
                    ) : (
                      <>
                        <strong>{formatBDT(sendNow)}</strong> &ldquo;Send
                        Money&rdquo; / &ldquo;Personal&rdquo; করুন এই নম্বরে:
                      </>
                    )}
                  </p>
                  {selectedInfo.bankDetails ? (
                    /*
                     * Structured bank block. The four env-driven fields
                     * (holder / bank / branch / account number) render
                     * as a properly-labelled rows table so the customer
                     * can read each one without parsing a long string.
                     * Copy button is bound to the account number only —
                     * that's the field the customer pastes into their
                     * banking app.
                     */
                    <BankInfoBlock
                      info={selectedInfo.bankDetails}
                      onCopyAccount={() =>
                        copy(selectedInfo.bankDetails?.accountNumber || "")
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-2 mb-3 flex-wrap">
                      <span className="font-display-bn text-xl sm:text-2xl font-bold text-mango-700 tracking-wider break-all">
                        {receivingNumber || (
                          <span className="text-orange-700/70 italic text-sm">
                            নম্বর/অ্যাকাউন্ট সেট নেই — env-এ যোগ করুন
                          </span>
                        )}
                      </span>
                      {receivingNumber && (
                        <button
                          type="button"
                          onClick={() => copy(receivingNumber)}
                          className="grid place-items-center h-9 w-9 rounded-full bg-white border border-mango-300 hover:bg-mango-100"
                          aria-label="কপি করুন"
                        >
                          <Copy className="h-4 w-4 text-mango-700" />
                        </button>
                      )}
                    </div>
                  )}

                  {selectedInfo.advance > 0 && selectedInfo.advance < total && (
                    <p className="text-xs text-ink/60 mb-3">
                      বাকি{" "}
                      <strong>
                        {formatBDT(total - selectedInfo.advance)}
                      </strong>{" "}
                      পণ্য পেয়ে দিন।
                    </p>
                  )}

                  <p className="text-xs text-ink/60 mb-4">
                    {selectedInfo.instructions}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      label="Transaction ID *"
                      error={errors.payment_txn_id?.message}
                    >
                      <input
                        {...register("payment_txn_id")}
                        className="input-field"
                        placeholder="যেমন: 9A1B2C3D4E"
                      />
                    </Field>
                    <Field
                      label="যে নম্বর/অ্যাকাউন্ট থেকে পাঠিয়েছেন *"
                      error={errors.payment_sender_number?.message}
                    >
                      <input
                        {...register("payment_sender_number")}
                        className="input-field"
                        placeholder="01XXXXXXXXX"
                      />
                    </Field>
                  </div>
                </>
              ) : (
                // COD with no advance — nothing to send up front.
                <p className="text-sm text-ink/70">
                  {selectedInfo.instructions}
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 self-start glass rounded-3xl p-6">
        <h3 className="font-display-bn text-xl font-bold mb-4">
          অর্ডার সারমর্ম
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span className="text-ink/70 line-clamp-1">
                {it.name} × {it.quantity_kg} কেজি
              </span>
              <span className="font-semibold">
                {formatBDT(it.price_per_kg * it.quantity_kg)}
              </span>
            </div>
          ))}
        </div>
        <div className="my-4 border-t border-mango-200/60" />
        <div className="flex justify-between text-sm py-1">
          <span className="text-ink/70">সাবটোটাল</span>
          <span>{formatBDT(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-ink/70">ডেলিভারি</span>
          <span>{deliveryFee === 0 ? "ফ্রি" : formatBDT(deliveryFee)}</span>
        </div>
        <div className="my-3 border-t border-mango-200/60" />
        <div className="flex justify-between font-display-bn text-xl font-bold text-mango-700">
          <span>মোট</span>
          <span>{formatBDT(total)}</span>
        </div>

        {sendNow > 0 && sendNow < total && (
          <div className="mt-3 rounded-xl bg-white/60 px-3 py-2 text-xs text-ink/70 leading-relaxed">
            এখন পরিশোধ:{" "}
            <strong className="text-mango-700">{formatBDT(sendNow)}</strong>
            <br />
            ডেলিভারিতে: {formatBDT(total - sendNow)}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full mt-6"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> পাঠাচ্ছি...
            </>
          ) : (
            <>অর্ডার কনফার্ম — {formatBDT(total)}</>
          )}
        </button>
        <p className="text-[11px] text-ink/50 text-center mt-3">
          অর্ডার দিলে আপনি আমাদের শর্তাবলিতে সম্মতি দিচ্ছেন।
        </p>
      </aside>
    </form>
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
    <div className="glass rounded-3xl p-6">
      <h3 className="font-display-bn text-lg font-bold mb-4">{title}</h3>
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

/**
 * Structured display of bank-transfer details — Holder / Bank /
 * Branch / Account Number rendered as labelled rows. Each field is
 * driven by its own env var so the operator can swap accounts
 * (different bank, different branch) without re-keying the others.
 *
 * The Account Number row gets a Copy button because that's the only
 * field a customer pastes into their banking app — the rest are
 * informational.
 */
function BankInfoBlock({
  info,
  onCopyAccount
}: {
  info: BankAccountInfo;
  onCopyAccount: () => void;
}) {
  const acctNum = info.accountNumber.trim();
  return (
    <div className="rounded-xl bg-white/70 border border-mango-200 p-4 space-y-2 mt-3 mb-3">
      <BankRow label="Bank Account Holder" value={info.holder} />
      <BankRow label="Bank Name" value={info.bankName} />
      <BankRow label="Branch" value={info.branch} />
      <div className="grid grid-cols-[7.5rem_1fr_auto] sm:grid-cols-[9rem_1fr_auto] items-center gap-2 sm:gap-3">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-ink/55">
          Account Number
        </span>
        <span className="font-display-bn text-base sm:text-lg font-bold text-mango-700 tracking-wider break-all">
          {acctNum || (
            <span className="text-orange-700/70 italic text-xs font-normal">
              সেট নেই — NEXT_PUBLIC_BANK_ACCOUNT_NUMBER add করুন
            </span>
          )}
        </span>
        {acctNum ? (
          <button
            type="button"
            onClick={onCopyAccount}
            className="grid place-items-center h-9 w-9 rounded-full bg-white border border-mango-300 hover:bg-mango-100 shrink-0"
            aria-label="অ্যাকাউন্ট নম্বর কপি করুন"
          >
            <Copy className="h-4 w-4 text-mango-700" />
          </button>
        ) : (
          <span aria-hidden className="w-9" />
        )}
      </div>
    </div>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[9rem_1fr] items-baseline gap-2 sm:gap-3">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-ink/55">
        {label}
      </span>
      <span className="text-sm sm:text-base font-semibold text-ink break-words">
        {value || <span className="text-ink/40 italic font-normal">—</span>}
      </span>
    </div>
  );
}
