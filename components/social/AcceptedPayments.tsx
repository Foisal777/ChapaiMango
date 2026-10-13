import PaymentBrandLogo from "@/components/payment/PaymentBrandLogo";
import { config } from "@/lib/config";
import type { PaymentMethod } from "@/types";

/**
 * "We Accept" payment-method strip in the footer.
 *
 * Renders the operator-enabled methods (NEXT_PUBLIC_PAYMENT_METHODS)
 * in the order requested:
 *
 *   bKash → Nagad → Rocket → Upay → Bank
 *
 * COD is intentionally NOT shown in this strip because it isn't
 * a third-party brand the customer needs to "recognise" before
 * trusting the checkout — they already know cash on delivery is an
 * option from the product card. The brand pills here are the
 * trust-builders for online-payment customers who need to see "this
 * shop accepts the payment rail I use".
 *
 * Server component, zero JS shipped.
 */

// Hard-coded display order, independent of config.paymentMethods (which
// is what the user can hide entries from but doesn't control display
// order). Filtering against config.paymentMethods means turning off,
// say, "rocket" via env hides the Rocket pill but leaves the order
// intact for the rest.
const DISPLAY_ORDER: PaymentMethod[] = [
  "bkash",
  "nagad",
  "rocket",
  "upay",
  "bank"
];

export default function AcceptedPayments() {
  const enabled = new Set(config.paymentMethods);
  const visible = DISPLAY_ORDER.filter((m) => enabled.has(m));

  if (visible.length === 0) return null;

  return (
    <div className="border-t border-mango-200/50">
      <div className="container-x py-7 flex flex-col items-center gap-4">
        <p className="text-xs uppercase tracking-wider text-ink/55 font-bold">
          We Accept
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {visible.map((code) => (
            <PaymentBrandLogo key={code} code={code} size="md" />
          ))}
        </div>
      </div>
    </div>
  );
}
