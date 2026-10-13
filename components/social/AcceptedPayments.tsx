import PaymentBrandLogo from "@/components/payment/PaymentBrandLogo";
import { paymentMethodInfo } from "@/lib/config";
import { getSiteSettings } from "@/lib/settings";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import type { PaymentMethod } from "@/types";

/**
 * "We Accept" strip in the footer. Shows built-in methods the admin
 * enabled (in brand order) followed by admin-created custom methods
 * whose "footer-এ দেখান" toggle is on. Any logo uploaded in
 * Settings → Payments (গ্যালারি থেকে) replaces the default pill.
 * COD is intentionally excluded — it isn't a brand trust signal.
 * Server component, zero JS shipped.
 */
const DISPLAY_ORDER: PaymentMethod[] = ["bkash", "nagad", "rocket", "upay", "bank"];

export default async function AcceptedPayments() {
  const { payments } = await getSiteSettings();
  const d = getDictionary(getLocale());
  const builtins = DISPLAY_ORDER.filter((m) => payments.methods[m]?.enabled).map((code) => {
    const info = paymentMethodInfo(payments, code);
    return { code, label: info.label, logoUrl: info.logoUrl };
  });
  const customs = (payments.customMethods ?? [])
    .filter((m) => m.enabled && m.showInFooter)
    .map((m) => ({ code: m.code, label: m.label, logoUrl: m.logoUrl || undefined }));
  const visible = [...builtins, ...customs];
  if (visible.length === 0) return null;

  return (
    <div className="border-t border-mango-200/50">
      <div className="container-x py-7 flex flex-col items-center gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/55 font-bold">{d.footer.weAccept}</p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {visible.map((m) => (
            <PaymentBrandLogo key={m.code} code={m.code} label={m.label} logoUrl={m.logoUrl} size="md" />
          ))}
        </div>
        <p className="text-[11px] text-ink/45">{d.footer.secureNote}</p>
      </div>
    </div>
  );
}
