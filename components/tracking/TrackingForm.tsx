"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  PackageCheck,
  Search,
  Truck,
  XCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { trackOrderAction } from "@/app/actions/tracking";
import { formatBDT } from "@/lib/utils";
import type { TrackedOrder } from "@/types";
import { cn } from "@/lib/utils";

const STEPS: {
  key: TrackedOrder["status"];
  label: string;
  icon: typeof Clock;
}[] = [
  { key: "pending", label: "অর্ডার গৃহীত", icon: Clock },
  { key: "confirmed", label: "কনফার্ম", icon: CheckCircle2 },
  { key: "shipped", label: "ডেলিভারিতে", icon: Truck },
  { key: "delivered", label: "ডেলিভার্ড", icon: PackageCheck }
];

/**
 * Wrapper that satisfies Next.js's requirement that any client component
 * using useSearchParams() be rendered inside a Suspense boundary on a
 * statically-generated page (which /track is).
 */
export default function TrackingForm() {
  return (
    <Suspense fallback={<div className="glass rounded-3xl p-6 h-32 animate-pulse" />}>
      <TrackingFormInner />
    </Suspense>
  );
}

function TrackingFormInner() {
  const search = useSearchParams();
  // Pre-fill from /orders -> "Track" link, so the customer never has to
  // hand-copy a UUID. Both id and phone are optional.
  const [orderId, setOrderId] = useState(() => search.get("id") || "");
  const [phone, setPhone] = useState(() => search.get("phone") || "");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runLookup = (id: string, ph: string) => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await trackOrderAction(id, ph);
      if ("error" in res) {
        setError(res.error);
        toast.error(res.error);
      } else {
        setResult(res.order);
      }
    });
  };

  // If both query params are present, auto-run the lookup so deep-links
  // from /orders show the timeline immediately.
  useEffect(() => {
    if (orderId && phone) runLookup(orderId, phone);
    // We intentionally only auto-run on first mount, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runLookup(orderId, phone);
  };

  const currentStep =
    result?.status === "cancelled"
      ? -1
      : STEPS.findIndex((s) => s.key === result?.status);

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="glass rounded-3xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1.5">
              অর্ডার আইডি *
            </label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="input-field font-mono"
              placeholder="00000000-0000-0000-0000-000000000000"
            />
            <p className="text-[11px] text-ink/40 mt-1">
              অর্ডার কনফার্মেশনে পাওয়া পুরো UUID পেস্ট করুন (৩৬ অক্ষর)।
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1.5">
              ফোন নম্বর *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> খুঁজছি...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" /> ট্র্যাক করুন
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-mango-600 font-semibold">
                অর্ডার আইডি
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs sm:text-sm break-all">
                  {result.id}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(result.id);
                    toast.success("আইডি কপি হয়েছে");
                  }}
                  className="grid place-items-center h-7 w-7 rounded-full bg-white border border-mango-200 hover:bg-mango-100 shrink-0"
                  aria-label="কপি করুন"
                >
                  <Copy className="h-3.5 w-3.5 text-mango-700" />
                </button>
              </div>
              <div className="text-xs text-ink/50 mt-1">
                {new Date(result.created_at).toLocaleString("en-BD", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display-bn text-2xl font-bold text-mango-700">
                {formatBDT(result.total)}
              </div>
              <div className="text-xs text-ink/50 uppercase">
                {result.payment_method}
              </div>
            </div>
          </div>

          <div className="text-sm text-ink/70 mb-5">
            <span className="font-semibold text-ink">{result.customer_name}</span>
            {" · "}
            {result.district}
          </div>

          {result.status === "cancelled" ? (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <XCircle className="h-5 w-5" />
              <div>
                <div className="font-semibold">অর্ডার বাতিল করা হয়েছে</div>
                <div className="text-xs opacity-80">
                  বিস্তারিত জানতে কাস্টমার কেয়ার-এ যোগাযোগ করুন।
                </div>
              </div>
            </div>
          ) : (
            <Timeline activeIndex={currentStep} />
          )}
        </div>
      )}
    </div>
  );
}

function Timeline({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="relative ml-3 border-l-2 border-mango-200 pl-6 space-y-5">
      {STEPS.map((s, idx) => {
        const reached = idx <= activeIndex;
        const Icon = s.icon;
        return (
          <li key={s.key} className="relative">
            <span
              className={cn(
                "absolute -left-[34px] top-0 grid place-items-center h-7 w-7 rounded-full border-2",
                reached
                  ? "bg-mango-gradient border-mango-500 text-ink shadow-glow"
                  : "bg-white border-mango-200 text-ink/40"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div
              className={cn(
                "font-semibold",
                reached ? "text-ink" : "text-ink/50"
              )}
            >
              {s.label}
            </div>
            {idx === activeIndex && (
              <div className="text-xs text-mango-700 font-semibold">
                বর্তমান অবস্থা
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
