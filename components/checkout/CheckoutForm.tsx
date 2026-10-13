"use client";

/**
 * Checkout form — deliberately dependency-light.
 *
 * Previously this shipped react-hook-form + zod + @hookform/resolvers
 * + the full Supabase browser client in the /checkout first-load
 * bundle (~207 kB). Now:
 *  - validation is a small hand-written validator (same rules),
 *  - the Supabase client is `import()`-ed lazily on mount/submit, so
 *    it lands in a separate chunk that loads after first paint.
 * Result: /checkout first-load JS drops dramatically (see build log).
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle2, Copy, Loader2, PackageCheck } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { formatBDT } from "@/lib/utils";
import { generateTrackingId } from "@/lib/tracking-id";
import {
  amountToSendNow,
  calcDeliveryFee,
  defaultPaymentMethod,
  getEnabledPaymentMethodsInfo,
  paymentMethodInfo,
  type BankAccountInfo,
  type PaymentSettings
} from "@/lib/config";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Dictionary, Locale } from "@/lib/i18n";
import PaymentBrandLogo from "@/components/payment/PaymentBrandLogo";

const DISTRICTS = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet", "Barishal", "Rangpur", "Mymensingh", "Chapainawabganj", "Other"];

const supabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR-PROJECT"));

type MiniUser = { id: string; email?: string | null; phone?: string | null; user_metadata?: Record<string, unknown> };

type Values = {
  customer_name: string; phone: string; email: string; district: string;
  address: string; notes: string; payment_method: string;
  payment_txn_id: string; payment_sender_number: string;
};
const EMPTY: Values = { customer_name: "", phone: "", email: "", district: "", address: "", notes: "", payment_method: "", payment_txn_id: "", payment_sender_number: "" };

function validate(v: Values, payments: PaymentSettings, E: Dictionary["checkout"]["errors"], locale: Locale): Partial<Record<keyof Values, string>> {
  const e: Partial<Record<keyof Values, string>> = {};
  if (v.customer_name.trim().length < 2) e.customer_name = E.name;
  const digits = v.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) e.phone = E.phone;
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) e.email = E.email;
  if (!v.district) e.district = E.district;
  if (v.address.trim().length < 8) e.address = E.address;
  const info = paymentMethodInfo(payments, v.payment_method);
  const enabled = getEnabledPaymentMethodsInfo(payments).some((m) => m.code === v.payment_method);
  if (!enabled) e.payment_method = E.methodOff;
  else if (info.advance > 0 || v.payment_method !== "cod") {
    if (!v.payment_txn_id.trim()) e.payment_txn_id = E.txn;
    if (!v.payment_sender_number.trim()) e.payment_sender_number = E.sender;
  }
  void locale;
  return e;
}

export default function CheckoutForm() {
  const { locale, t: d } = useLocale();
  const router = useRouter();
  const { commerce, payments } = useSettings();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id?: string; trackingId?: string; methodLabel?: string } | null>(null);
  const [user, setUser] = useState<MiniUser | null>(null);
  const [values, setValues] = useState<Values>(() => ({ ...EMPTY, payment_method: defaultPaymentMethod(payments) }));
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});

  const deliveryFee = calcDeliveryFee(subtotal, commerce);
  const total = subtotal + deliveryFee;
  const methods = useMemo(() => getEnabledPaymentMethodsInfo(payments), [payments]);
  const selectedInfo = useMemo(() => methods.find((m) => m.code === values.payment_method) ?? methods[0], [methods, values.payment_method]);
  const sendNow = selectedInfo ? amountToSendNow(selectedInfo, total) : 0;
  const receivingNumber = selectedInfo?.accountNumber || "";

  const set = (k: keyof Values, val: string) => {
    setValues((p) => ({ ...p, [k]: val }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  useEffect(() => {
    if (!supabaseConfigured()) return;
    let alive = true;
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getUser().then(({ data }) => {
        if (!alive || !data.user) return;
        const u = data.user as unknown as MiniUser;
        setUser(u);
        setValues((prev) => ({
          ...prev,
          customer_name: (u.user_metadata?.full_name as string) || prev.customer_name,
          phone: (u.user_metadata?.phone as string) || u.phone || prev.phone,
          email: (u.user_metadata?.email as string) || u.email || prev.email
        }));
      });
    });
    return () => { alive = false; };
  }, []);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (items.length === 0) { toast.error(d.checkout.errors.cartEmpty); router.push("/products"); return; }
    const totalKg = items.reduce((s, i) => s + (i.quantity_kg || 0), 0);
    if (commerce.minOrderKg > 0 && totalKg < commerce.minOrderKg) {
      toast.error(d.checkout.errors.minOrder(commerce.minOrderKg, totalKg, locale));
      router.push("/cart"); return;
    }
    const errs = validate(values, payments, d.checkout.errors, locale);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) { toast.error(d.checkout.errors.form); return; }
    if (supabaseConfigured() && !user) { toast.error(d.checkout.errors.signIn); router.push("/login?next=/checkout"); return; }

    setSubmitting(true);
    try {
      const trackingId = generateTrackingId();
      const basePayload = {
        user_id: user?.id ?? null,
        customer_name: values.customer_name.trim(),
        phone: values.phone.trim(),
        email: values.email || user?.email || (user?.user_metadata?.email as string) || null,
        address: values.address.trim(),
        district: values.district,
        items, subtotal, delivery_fee: deliveryFee, total,
        payment_method: values.payment_method,
        payment_txn_id: values.payment_txn_id || null,
        payment_sender_number: values.payment_sender_number || null,
        notes: values.notes || null,
        status: "pending"
      };
      let id: string | undefined;
      let savedTrackingId: string | undefined = trackingId;
      if (supabaseConfigured()) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        // Prefer the short CMH tracking id; if the DB hasn't run the
        // tracking migration yet (column missing), retry without it
        // so checkout never breaks during rollout.
        let res = await supabase.from("orders").insert({ ...basePayload, tracking_id: trackingId }).select("id,tracking_id").single();
        if (res.error && /tracking_id|column/i.test(res.error.message)) {
          savedTrackingId = undefined;
          res = await supabase.from("orders").insert(basePayload).select("id").single() as typeof res;
        }
        if (res.error) throw res.error;
        id = (res.data as { id?: string } | null)?.id;
        savedTrackingId = (res.data as { tracking_id?: string } | null)?.tracking_id ?? savedTrackingId;
      } else {
        id = "demo-" + Date.now();
      }
      clear();
      setDone({ id, trackingId: savedTrackingId, methodLabel: selectedInfo?.label });
      toast.success(d.checkout.errors.success);
    } catch (err) {
      console.error("[checkout] order insert failed:", err);
      const msg = err instanceof Error ? err.message : typeof err === "object" && err !== null && "message" in err ? String((err as { message?: unknown }).message) : "Unknown error";
      toast.error(d.checkout.errors.failed(msg), { duration: 8000 });
    } finally { setSubmitting(false); }
  };

  const copy = (text: string) => { if (!text) return; navigator.clipboard.writeText(text); toast.success(d.checkout.errors.copied(text)); };

  if (done) {
    const trackRef = done.trackingId || done.id;
    return (
      <div className="glass rounded-3xl p-10 text-center hover-lift">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-leaf-500/15"><PackageCheck className="h-11 w-11 text-leaf-600" /></span>
        <h2 className="font-display-bn text-2xl sm:text-3xl font-bold mt-4">{d.checkout.doneTitle}</h2>
        <p className="mt-2 text-ink/70 max-w-md mx-auto">{d.checkout.doneDesc(done.methodLabel ?? "")}</p>
        {done.trackingId ? (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border-2 border-dashed border-mango-400 bg-mango-50 px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-mango-700">{d.checkout.yourTrackingId}</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-black tracking-widest text-ink">{done.trackingId}</span>
              <button type="button" onClick={() => copy(done.trackingId!)} className="grid h-9 w-9 place-items-center rounded-full bg-white border border-mango-300 hover:bg-mango-100 transition" aria-label="Copy tracking ID"><Copy className="h-4 w-4 text-mango-700" /></button>
            </div>
            <p className="mt-1 text-xs text-ink/55">{d.checkout.trackingKeep}</p>
          </div>
        ) : done.id ? (
          <p className="mt-3 text-sm text-ink/60">ID: <span className="font-mono font-semibold break-all">{done.id}</span></p>
        ) : null}
        <div className="flex gap-3 justify-center mt-6 flex-wrap">
          <Link href="/" className="btn-ghost">{d.checkout.backHome}</Link>
          {trackRef && <Link href={`/track?id=${encodeURIComponent(trackRef)}`} className="btn-ghost">{d.checkout.trackBtn}</Link>}
          <Link href="/products" className="btn-primary">{d.checkout.buyMore}</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) return (
    <div className="glass rounded-3xl p-14 text-center">
      <p className="text-ink/60">{d.checkout.emptyCart}</p>
      <Link href="/products" className="btn-primary mt-5 inline-flex">{d.checkout.backToShopBtn}</Link>
    </div>
  );
  if (methods.length === 0) return (
    <div className="glass rounded-3xl p-14 text-center"><p className="text-ink/60">{d.checkout.noMethod}</p></div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card title={d.checkout.contactInfo}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={d.checkout.name} error={errors.customer_name}><input value={values.customer_name} onChange={(e) => set("customer_name", e.target.value)} className="input-field" placeholder="মোঃ রহিম উদ্দিন" /></Field>
            <Field label={d.checkout.phone} error={errors.phone}><input value={values.phone} onChange={(e) => set("phone", e.target.value)} className="input-field" placeholder="01XXXXXXXXX" inputMode="tel" /></Field>
            <Field label={d.checkout.email} error={errors.email}><input value={values.email} onChange={(e) => set("email", e.target.value)} className="input-field" placeholder="you@email.com" /></Field>
            <Field label={d.checkout.district} error={errors.district}>
              <select value={values.district} onChange={(e) => set("district", e.target.value)} className="input-field">
                <option value="">{d.checkout.selectDistrict}</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>
        </Card>

        <Card title={d.checkout.addressTitle}>
          <Field label={d.checkout.address} error={errors.address}><textarea value={values.address} onChange={(e) => set("address", e.target.value)} rows={3} className="input-field" placeholder={d.checkout.addressPh} /></Field>
          <Field label={d.checkout.notes}><textarea value={values.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="input-field" placeholder={d.checkout.notesPh} /></Field>
        </Card>

        <Card title={d.checkout.paymentTitle}>
          {errors.payment_method && <p className="text-xs text-red-600 -mt-2">{errors.payment_method}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {methods.map((m) => {
              const active = values.payment_method === m.code;
              return (
                <label key={m.code} className={`payment-card relative cursor-pointer rounded-2xl border-2 p-3 sm:p-4 text-center transition ${active ? "border-mango-500 bg-mango-50 shadow-glow" : "border-mango-200 bg-white hover:border-mango-400"}`}>
                  <input type="radio" name="payment_method" value={m.code} checked={active} className="sr-only"
                    onChange={() => { set("payment_method", m.code); set("payment_txn_id", ""); set("payment_sender_number", ""); }} />
                  <div className="flex justify-center mb-2"><PaymentBrandLogo code={m.code} label={m.label} logoUrl={m.logoUrl} size="md" /></div>
                  <div className="font-semibold text-xs sm:text-sm leading-tight text-ink/80">{m.label}</div>
                  {m.advance > 0 && <div className="text-[10px] text-mango-700 font-bold mt-1">{d.checkout.advance} {formatBDT(m.advance)}</div>}
                  {active && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-mango-600" />}
                </label>
              );
            })}
          </div>

          {selectedInfo && (
            <div className="mt-5 rounded-2xl border-2 border-dashed border-mango-300 bg-mango-50 p-5">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <PaymentBrandLogo code={selectedInfo.code} label={selectedInfo.label} logoUrl={selectedInfo.logoUrl} size="sm" />
                <span className="text-sm font-semibold text-ink">{selectedInfo.label}</span>
              </div>
              {sendNow > 0 ? (
                <>
                  <p className="text-sm text-ink/80">
                    {selectedInfo.code === "bank"
                      ? <><strong>{formatBDT(sendNow)}</strong> {d.checkout.transferTo}</>
                      : <><strong>{formatBDT(sendNow)}</strong> {d.checkout.sendMoneyTo}</>}
                  </p>
                  {selectedInfo.bankDetails ? (
                    <BankInfoBlock info={selectedInfo.bankDetails} onCopyAccount={() => copy(selectedInfo.bankDetails?.accountNumber || "")} />
                  ) : (
                    <div className="flex items-center gap-2 mt-2 mb-3 flex-wrap">
                      <span className="font-display-bn text-xl sm:text-2xl font-bold text-mango-700 tracking-wider break-all">
                        {receivingNumber || <span className="text-orange-700/70 italic text-sm">{d.checkout.numberNotSet}</span>}
                      </span>
                      {receivingNumber && (
                        <button type="button" onClick={() => copy(receivingNumber)} className="grid place-items-center h-9 w-9 rounded-full bg-white border border-mango-300 hover:bg-mango-100" aria-label="কপি করুন"><Copy className="h-4 w-4 text-mango-700" /></button>
                      )}
                    </div>
                  )}
                  {selectedInfo.advance > 0 && selectedInfo.advance < total && (
                    <p className="text-xs text-ink/60 mb-3">{d.checkout.restOnDelivery(formatBDT(total - selectedInfo.advance))}</p>
                  )}
                  <p className="text-xs text-ink/60 mb-4">{selectedInfo.instructions}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={d.checkout.txnId} error={errors.payment_txn_id}><input value={values.payment_txn_id} onChange={(e) => set("payment_txn_id", e.target.value)} className="input-field" placeholder="যেমন: 9A1B2C3D4E" /></Field>
                    <Field label={d.checkout.sender} error={errors.payment_sender_number}><input value={values.payment_sender_number} onChange={(e) => set("payment_sender_number", e.target.value)} className="input-field" placeholder="01XXXXXXXXX" /></Field>
                  </div>
                </>
              ) : (
                <p className="text-sm text-ink/70">{selectedInfo.instructions}</p>
              )}
            </div>
          )}
        </Card>
      </div>

      <aside className="lg:sticky lg:top-24 self-start glass rounded-3xl p-6 hover-lift">
        <h3 className="font-display-bn text-xl font-bold mb-4">{d.checkout.summary}</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span className="text-ink/70 line-clamp-1">{it.name} × {it.quantity_kg} {d.common.kg}</span>
              <span className="font-semibold">{formatBDT(it.price_per_kg * it.quantity_kg)}</span>
            </div>
          ))}
        </div>
        <div className="my-4 border-t border-mango-200/60" />
        <div className="flex justify-between text-sm py-1"><span className="text-ink/70">{d.common.subtotal}</span><span>{formatBDT(subtotal)}</span></div>
        <div className="flex justify-between text-sm py-1"><span className="text-ink/70">{d.common.delivery}</span><span>{deliveryFee === 0 ? d.common.free : formatBDT(deliveryFee)}</span></div>
        <div className="my-3 border-t border-mango-200/60" />
        <div className="flex justify-between font-display-bn text-xl font-bold text-mango-700"><span>{d.common.total}</span><span>{formatBDT(total)}</span></div>
        {sendNow > 0 && sendNow < total && (
          <div className="mt-3 rounded-xl bg-white/60 px-3 py-2 text-xs text-ink/70 leading-relaxed">{d.checkout.payNow} <strong className="text-mango-700">{formatBDT(sendNow)}</strong><br />{d.checkout.onDelivery} {formatBDT(total - sendNow)}</div>
        )}
        <button type="submit" disabled={submitting} className="btn-primary w-full mt-6">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> {d.checkout.submitting}</> : <>{d.checkout.confirm(formatBDT(total))}</>}
        </button>
        <p className="text-[11px] text-ink/50 text-center mt-3">{d.checkout.trackingNote}</p>
      </aside>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl p-6 hover-lift">
      <h3 className="font-display-bn text-lg font-bold mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink/70 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function BankInfoBlock({ info, onCopyAccount }: { info: BankAccountInfo; onCopyAccount: () => void }) {
  const acctNum = info.accountNumber.trim();
  return (
    <div className="rounded-xl bg-white/70 border border-mango-200 p-4 space-y-2 mt-3 mb-3">
      <BankRow label="Bank Account Holder" value={info.holder} />
      <BankRow label="Bank Name" value={info.bankName} />
      <BankRow label="Branch" value={info.branch} />
      <div className="grid grid-cols-[7.5rem_1fr_auto] sm:grid-cols-[9rem_1fr_auto] items-center gap-2 sm:gap-3">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-ink/55">Account Number</span>
        <span className="font-display-bn text-base sm:text-lg font-bold text-mango-700 tracking-wider break-all">{acctNum || <span className="text-orange-700/70 italic text-xs font-normal">সেট নেই</span>}</span>
        {acctNum ? (
          <button type="button" onClick={onCopyAccount} className="grid place-items-center h-9 w-9 rounded-full bg-white border border-mango-300 hover:bg-mango-100 shrink-0" aria-label="অ্যাকাউন্ট নম্বর কপি করুন"><Copy className="h-4 w-4 text-mango-700" /></button>
        ) : <span aria-hidden className="w-9" />}
      </div>
    </div>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[9rem_1fr] items-baseline gap-2 sm:gap-3">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-ink/55">{label}</span>
      <span className="text-sm sm:text-base font-semibold text-ink break-words">{value || <span className="text-ink/40 italic font-normal">—</span>}</span>
    </div>
  );
}
