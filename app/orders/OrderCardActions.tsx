"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Small client component bolted onto each row in /orders. Two actions:
 *   - Copy the full UUID to clipboard (because the tracking page needs
 *     the entire 36-character id, not the truncated #abcd1234 we used
 *     to show).
 *   - Deep-link to /track with the id + phone pre-filled, which makes
 *     the tracking flow one tap from /orders.
 */
export default function OrderCardActions({
  orderId,
  phone
}: {
  orderId: string;
  phone: string;
}) {
  const trackHref = `/track?id=${encodeURIComponent(
    orderId
  )}&phone=${encodeURIComponent(phone)}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      toast.success("আইডি কপি হয়েছে");
    } catch {
      toast.error("কপি করতে পারিনি — manually select করুন");
    }
  };

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-mango-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-mango-50 transition"
      >
        <Copy className="h-3 w-3" />
        আইডি কপি
      </button>
      <Link
        href={trackHref}
        className="inline-flex items-center gap-1.5 rounded-full bg-mango-gradient px-3 py-1.5 text-[11px] font-semibold text-ink shadow-soft hover:scale-105 transition"
      >
        <ExternalLink className="h-3 w-3" />
        ট্র্যাক করুন
      </Link>
    </div>
  );
}
