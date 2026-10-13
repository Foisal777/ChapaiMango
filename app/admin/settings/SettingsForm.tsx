"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { LogoUploadField } from "@/components/admin/ImageUploadField";
import PaymentBrandLogo from "@/components/payment/PaymentBrandLogo";
import { slugify } from "@/lib/utils";
import { saveSiteSettingsAction } from "@/app/admin/actions";
import {
  PAYMENT_METHOD_CODES,
  type SiteSettings
} from "@/lib/settings-schema";
import type { PaymentMethod } from "@/types";

const SECTIONS = [
  { id: "brand", label: "Brand & SEO text" },
  { id: "contact", label: "Contact & Map" },
  { id: "social", label: "Social links" },
  { id: "commerce", label: "Delivery & Orders" },
  { id: "payments", label: "Payments" },
  { id: "home", label: "Homepage" },
  { id: "seo", label: "SEO & Verification" }
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

const METHOD_LABEL: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  upay: "Upay",
  bank: "Bank transfer"
};

/**
 * Full site-settings editor. One form, seven sections. Saving writes the
 * whole document in one go (server validates with zod) and the storefront
 * picks it up immediately via cache-tag revalidation.
 */
export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [s, setS] = useState<SiteSettings>(initial);
  const [section, setSection] = useState<SectionId>("brand");
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  /** Typed patch for one field inside one section. */
  function patch<K extends keyof SiteSettings>(
    sec: K,
    field: keyof SiteSettings[K],
    value: unknown
  ) {
    setDirty(true);
    setS(
      (prev) =>
        ({
          ...prev,
          [sec]: { ...(prev[sec] as object), [field]: value }
        }) as SiteSettings
    );
  }

  function patchMethod(
    code: PaymentMethod,
    field: keyof SiteSettings["payments"]["methods"][PaymentMethod],
    value: unknown
  ) {
    setDirty(true);
    setS((prev) => ({
      ...prev,
      payments: {
        ...prev.payments,
        methods: {
          ...prev.payments.methods,
          [code]: { ...prev.payments.methods[code], [field]: value }
        }
      }
    }));
  }

  function patchCustom(index: number, field: string, value: unknown) {
    setDirty(true);
    setS((prev) => ({
      ...prev,
      payments: {
        ...prev.payments,
        customMethods: (prev.payments.customMethods ?? []).map((m, i) =>
          i === index ? { ...m, [field]: value } : m
        )
      }
    }));
  }

  function addCustomMethod() {
    setDirty(true);
    setS((prev) => {
      const n = (prev.payments.customMethods ?? []).length + 1;
      return {
        ...prev,
        payments: {
          ...prev.payments,
          customMethods: [
            ...(prev.payments.customMethods ?? []),
            { code: `method-${n}`, label: "", enabled: true, number: "", advance: 0, instructions: "", logoUrl: "", showInFooter: true }
          ]
        }
      };
    });
  }

  function removeCustomMethod(index: number) {
    setDirty(true);
    setS((prev) => ({
      ...prev,
      payments: { ...prev.payments, customMethods: (prev.payments.customMethods ?? []).filter((_, i) => i !== index) }
    }));
  }

  function save() {
    startTransition(async () => {
      const res = await saveSiteSettingsAction(s);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setDirty(false);
      toast.success("Settings save hoyeche — website e live");
      router.refresh();
    });
  }

  return (
    <div className="grid lg:grid-cols-[220px_1fr] gap-6">
      {/* Section nav */}
      <nav className="glass rounded-2xl p-2 h-fit lg:sticky lg:top-6 flex lg:flex-col gap-1 overflow-x-auto">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setSection(sec.id)}
            className={`whitespace-nowrap text-left rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              section === sec.id
                ? "bg-mango-gradient text-ink shadow-soft"
                : "text-ink/70 hover:bg-mango-100"
            }`}
          >
            {sec.label}
          </button>
        ))}
      </nav>

      <div className="space-y-6 min-w-0">
        <div className="glass rounded-2xl p-5 sm:p-6 space-y-5">
          {section === "brand" && (
            <Panel title="Brand & SEO text" hint="Website er naam, description — Google search result e ei text dekhabe.">
              <Grid>
                <Field label="Brand name (English)" required>
                  <input className="input-field" value={s.brand.name} onChange={(e) => patch("brand", "name", e.target.value)} />
                </Field>
                <Field label="Brand name (বাংলা)">
                  <input className="input-field" value={s.brand.nameBn} onChange={(e) => patch("brand", "nameBn", e.target.value)} />
                </Field>
              </Grid>
              <Field label="Short description (search / social preview)">
                <textarea rows={2} className="input-field" value={s.brand.shortDescription} onChange={(e) => patch("brand", "shortDescription", e.target.value)} />
              </Field>
              <Field label="Long description (meta description, about schema)">
                <textarea rows={4} className="input-field" value={s.brand.longDescription} onChange={(e) => patch("brand", "longDescription", e.target.value)} />
              </Field>
            </Panel>
          )}

          {section === "contact" && (
            <Panel title="Contact & Map" hint="Footer, contact page, privacy policy ar WhatsApp button e ei info thakbe.">
              <Grid>
                <Field label="Phone">
                  <input className="input-field" value={s.contact.phone} onChange={(e) => patch("contact", "phone", e.target.value)} placeholder="+880 1XXX-XXXXXX" />
                </Field>
                <Field label="Email">
                  <input className="input-field" type="email" value={s.contact.email} onChange={(e) => patch("contact", "email", e.target.value)} />
                </Field>
                <Field label="WhatsApp (digits, country code)" hint="যেমন 8801712345678 — ফাঁকা রাখলে Phone ব্যবহার হবে">
                  <input className="input-field" value={s.contact.whatsapp} onChange={(e) => patch("contact", "whatsapp", e.target.value.replace(/[^\d]/g, ""))} />
                </Field>
                <Field label="Address (short)">
                  <input className="input-field" value={s.contact.address} onChange={(e) => patch("contact", "address", e.target.value)} />
                </Field>
                <Field label="Map label">
                  <input className="input-field" value={s.contact.mapLabel} onChange={(e) => patch("contact", "mapLabel", e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Latitude">
                    <input className="input-field" type="number" step="any" value={s.contact.mapLat} onChange={(e) => patch("contact", "mapLat", Number(e.target.value))} />
                  </Field>
                  <Field label="Longitude">
                    <input className="input-field" type="number" step="any" value={s.contact.mapLng} onChange={(e) => patch("contact", "mapLng", Number(e.target.value))} />
                  </Field>
                </div>
              </Grid>
            </Panel>
          )}

          {section === "social" && (
            <Panel title="Social links" hint="Blank rakhle oi platform er button dekhabe na.">
              <Grid>
                <Field label="Facebook URL"><input className="input-field" value={s.social.facebook} onChange={(e) => patch("social", "facebook", e.target.value)} placeholder="https://facebook.com/..." /></Field>
                <Field label="TikTok URL"><input className="input-field" value={s.social.tiktok} onChange={(e) => patch("social", "tiktok", e.target.value)} placeholder="https://tiktok.com/@..." /></Field>
                <Field label="Instagram URL"><input className="input-field" value={s.social.instagram} onChange={(e) => patch("social", "instagram", e.target.value)} placeholder="https://instagram.com/..." /></Field>
                <Field label="YouTube URL"><input className="input-field" value={s.social.youtube} onChange={(e) => patch("social", "youtube", e.target.value)} placeholder="https://youtube.com/..." /></Field>
              </Grid>
            </Panel>
          )}

          {section === "commerce" && (
            <Panel title="Delivery & Orders" hint="Cart, checkout ar product page e ei rule gulo apply hobe.">
              <Grid>
                <Field label="Delivery fee (৳)" hint="0 dile sob সময় free">
                  <input className="input-field" type="number" min={0} value={s.commerce.deliveryFee} onChange={(e) => patch("commerce", "deliveryFee", Number(e.target.value))} />
                </Field>
                <Field label="Free delivery over (৳)" hint="0 dile kokhono free hobe na">
                  <input className="input-field" type="number" min={0} value={s.commerce.freeDeliveryOver} onChange={(e) => patch("commerce", "freeDeliveryOver", Number(e.target.value))} />
                </Field>
                <Field label="Minimum order (kg)" hint="0 dile minimum nei">
                  <input className="input-field" type="number" min={0} step="0.5" value={s.commerce.minOrderKg} onChange={(e) => patch("commerce", "minOrderKg", Number(e.target.value))} />
                </Field>
              </Grid>
            </Panel>
          )}

          {section === "payments" && (
            <Panel title="Payments" hint="Kon method on thakbe, receiving number, advance amount ar customer er instruction.">
              <div className="space-y-4">
                {PAYMENT_METHOD_CODES.map((code) => {
                  const m = s.payments.methods[code];
                  return (
                    <div key={code} className={`rounded-2xl border p-4 space-y-3 transition ${m.enabled ? "border-mango-300 bg-white/60" : "border-ink/10 bg-ink/[0.02] opacity-70"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                          <input type="checkbox" className="h-4 w-4 accent-[#f59e0b]" checked={m.enabled} onChange={(e) => patchMethod(code, "enabled", e.target.checked)} />
                          {METHOD_LABEL[code]}
                        </label>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${m.enabled ? "text-leaf-600" : "text-ink/40"}`}>
                          {m.enabled ? "live" : "hidden"}
                        </span>
                      </div>
                      <Grid>
                        {code !== "bank" && (
                          <Field label="Receiving number">
                            <input className="input-field" value={m.number} onChange={(e) => patchMethod(code, "number", e.target.value)} placeholder="01XXXXXXXXX" />
                          </Field>
                        )}
                        <Field label="Advance due now (৳)" hint="0 = pura টাকা delivery te / ordinary">
                          <input className="input-field" type="number" min={0} value={m.advance} onChange={(e) => patchMethod(code, "advance", Number(e.target.value))} />
                        </Field>
                      </Grid>
                      <Field label="Custom instructions (blank = default text)">
                        <textarea rows={2} className="input-field" value={m.instructions} onChange={(e) => patchMethod(code, "instructions", e.target.value)} />
                      </Field>
                      <Field label="লোগো (footer 'We Accept' + checkout-এ দেখাবে)" hint="গ্যালারি থেকে লোগো বেছে নিন — না দিলে ডিফল্ট রঙিন pill দেখাবে">
                        <LogoUploadField value={m.logoUrl || ""} onChange={(u) => patchMethod(code, "logoUrl", u)} folder="payments" />
                      </Field>
                      <div className="flex items-center gap-2 text-xs text-ink/55">
                        <span>Preview:</span>
                        <PaymentBrandLogo code={code} label={METHOD_LABEL[code]} logoUrl={m.logoUrl || undefined} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Custom payment methods (admin-added, no deploy) ── */}
              <div className="rounded-2xl border-2 border-dashed border-mango-300 p-4 space-y-4 mt-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-display font-bold text-sm">নতুন Payment Method যোগ করুন</h3>
                    <p className="text-xs text-ink/55 mt-1">নতুন wallet/gateway এখান থেকে যোগ করলেই checkout-এ live হবে — কোড/deploy লাগবে না। লোগো গ্যালারি থেকে বেছে দিলে footer-এর &ldquo;We Accept&rdquo;-এও দেখাবে।</p>
                  </div>
                  <button type="button" onClick={addCustomMethod} className="btn-primary text-xs py-2 px-4 shrink-0">
                    <Plus className="h-4 w-4" /> নতুন Method
                  </button>
                </div>
                {(s.payments.customMethods ?? []).length === 0 ? (
                  <p className="text-xs text-ink/45 rounded-xl bg-mango-50 px-3 py-2.5">এখনো কোনো custom method নেই — উপরের বাটনে ক্লিক করে যোগ করুন।</p>
                ) : (
                  (s.payments.customMethods ?? []).map((m, i) => (
                    <div key={i} className={`rounded-2xl border p-4 space-y-3 ${m.enabled ? "border-mango-300 bg-white/60" : "border-ink/10 bg-ink/[0.02] opacity-70"}`}>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                          <input type="checkbox" className="h-4 w-4 accent-[#f59e0b]" checked={m.enabled} onChange={(e) => patchCustom(i, "enabled", e.target.checked)} />
                          {m.label || "নতুন Method"}
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                            <input type="checkbox" className="h-3.5 w-3.5 accent-[#f59e0b]" checked={m.showInFooter} onChange={(e) => patchCustom(i, "showInFooter", e.target.checked)} />
                            Footer &ldquo;We Accept&rdquo;-এ দেখান
                          </label>
                          <button type="button" onClick={() => removeCustomMethod(i)} className="grid h-8 w-8 place-items-center rounded-full border border-red-200 text-red-600 hover:bg-red-50" aria-label="Method মুছুন">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <Grid>
                        <Field label="Method-এর নাম *" hint="যেমন: SSLCommerz, Pathao Pay">
                          <input className="input-field" value={m.label} onChange={(e) => { patchCustom(i, "label", e.target.value); if (!m.code || m.code.startsWith("method-")) patchCustom(i, "code", slugify(e.target.value) || m.code); }} placeholder="SSLCommerz" />
                        </Field>
                        <Field label="Code (অর্ডারে সেভ হবে)" hint="ছোট হাতের, আলাদা হতে হবে">
                          <input className="input-field font-mono text-sm" value={m.code} onChange={(e) => patchCustom(i, "code", slugify(e.target.value))} placeholder="sslcommerz" />
                        </Field>
                        <Field label="Receiving number / account">
                          <input className="input-field" value={m.number} onChange={(e) => patchCustom(i, "number", e.target.value)} placeholder="01XXXXXXXXX" />
                        </Field>
                        <Field label="Advance due now (৳)" hint="0 = পুরো টাকা এখনই (COD ছাড়া)">
                          <input className="input-field" type="number" min={0} value={m.advance} onChange={(e) => patchCustom(i, "advance", Number(e.target.value))} />
                        </Field>
                      </Grid>
                      <Field label="Customer instructions">
                        <textarea rows={2} className="input-field" value={m.instructions} onChange={(e) => patchCustom(i, "instructions", e.target.value)} placeholder="কীভাবে পেমেন্ট করবে লিখুন…" />
                      </Field>
                      <Field label="লোগো (গ্যালারি থেকে)">
                        <LogoUploadField value={m.logoUrl || ""} onChange={(u) => patchCustom(i, "logoUrl", u)} folder="payments" />
                      </Field>
                      <div className="flex items-center gap-2 text-xs text-ink/55">
                        <span>Preview:</span>
                        <PaymentBrandLogo code={m.code} label={m.label || "Method"} logoUrl={m.logoUrl || undefined} size="sm" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-2xl border border-mango-200 p-4 space-y-3 mt-2">
                <h3 className="font-display font-bold text-sm">Bank account</h3>
                <Grid>
                  <Field label="Account holder"><input className="input-field" value={s.payments.bank.holder} onChange={(e) => patch("payments", "bank", { ...s.payments.bank, holder: e.target.value })} /></Field>
                  <Field label="Bank name"><input className="input-field" value={s.payments.bank.bankName} onChange={(e) => patch("payments", "bank", { ...s.payments.bank, bankName: e.target.value })} /></Field>
                  <Field label="Branch"><input className="input-field" value={s.payments.bank.branch} onChange={(e) => patch("payments", "bank", { ...s.payments.bank, branch: e.target.value })} /></Field>
                  <Field label="Account number"><input className="input-field" value={s.payments.bank.accountNumber} onChange={(e) => patch("payments", "bank", { ...s.payments.bank, accountNumber: e.target.value })} /></Field>
                </Grid>
              </div>
            </Panel>
          )}

          {section === "home" && (
            <Panel title="Homepage hero" hint="Homepage er top-er badge, heading ar subtitle.">
              <Field label="Badge text"><input className="input-field" value={s.home.heroBadge} onChange={(e) => patch("home", "heroBadge", e.target.value)} /></Field>
              <Field label="Heading" hint="প্রথম শব্দটা রঙিন (shimmer) হবে">
                <input className="input-field" value={s.home.heroTitle} onChange={(e) => patch("home", "heroTitle", e.target.value)} />
              </Field>
              <Field label="Subtitle">
                <textarea rows={3} className="input-field" value={s.home.heroSubtitle} onChange={(e) => patch("home", "heroSubtitle", e.target.value)} />
              </Field>
            </Panel>
          )}

          {section === "seo" && (
            <Panel title="SEO & Verification" hint="Google Search Console / Bing verification token ebong keywords.">
              <Field label="Keywords (comma separated)">
                <textarea rows={3} className="input-field" value={s.seo.keywords} onChange={(e) => patch("seo", "keywords", e.target.value)} />
              </Field>
              <Grid>
                <Field label="Google site verification token"><input className="input-field" value={s.seo.googleVerification} onChange={(e) => patch("seo", "googleVerification", e.target.value)} /></Field>
                <Field label="Bing site verification token"><input className="input-field" value={s.seo.bingVerification} onChange={(e) => patch("seo", "bingVerification", e.target.value)} /></Field>
              </Grid>
            </Panel>
          )}
        </div>

        {/* Sticky save bar */}
        <div className="sticky bottom-4 z-10">
          <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-soft">
            <p className="text-xs text-ink/60">
              {dirty ? "অসংরক্ষিত পরিবর্তন আছে" : "সব সেভ করা আছে"}
            </p>
            <button type="button" onClick={save} disabled={pending || !dirty} className="btn-primary text-sm py-2.5 disabled:opacity-50">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {hint && <p className="text-xs text-ink/55 mt-1">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label className="block text-xs font-semibold text-ink/70 mb-1.5">
        {label}
        {required && " *"}
      </label>
      {children}
      {hint && <p className="text-[10px] text-ink/40 mt-1">{hint}</p>}
    </div>
  );
}
