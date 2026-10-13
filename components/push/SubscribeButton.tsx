"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  deletePushSubscriptionAction,
  savePushSubscriptionAction
} from "@/app/actions/push";

type State = "loading" | "unsupported" | "denied" | "off" | "on";

/**
 * "মৌসুম এলেই জানিয়ে দিন" subscribe pill.
 *
 * Renders nothing if Web Push isn't supported (iOS < 16.4, in-app
 * browsers, no NEXT_PUBLIC_VAPID_PUBLIC_KEY, etc.) — the absence is
 * intentional rather than a broken button.
 *
 * State machine:
 *   loading      — checking SW + subscription status
 *   unsupported  — bail, render nothing
 *   denied       — user blocked notifications, render disabled hint
 *   off          — supported & allowed, not subscribed -> CTA
 *   on           — already subscribed -> "subscribed" + unsubscribe action
 */
export default function SubscribeButton({
  className
}: {
  className?: string;
}) {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    let cancelled = false;
    let idleId: number | null = null;
    let timeoutId: number | null = null;

    const init = async () => {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !vapidKey
      ) {
        if (!cancelled) setState("unsupported");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const existing = await reg.pushManager.getSubscription();
        if (cancelled) return;
        if (existing) {
          setState("on");
          return;
        }
        if (Notification.permission === "denied") {
          setState("denied");
        } else {
          setState("off");
        }
      } catch (err) {
        console.error("[push] init failed:", err);
        if (!cancelled) setState("unsupported");
      }
    };

    // Defer service-worker registration until the browser is idle so
    // it doesn't compete with the rest of the home page for the main
    // thread during initial load. This was costing ~10 PageSpeed
    // points on mobile previously.
    const ric =
      typeof window !== "undefined" &&
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : null;
    if (ric) {
      idleId = ric.call(window, init, { timeout: 2500 });
    } else if (typeof window !== "undefined") {
      timeoutId = window.setTimeout(init, 1200);
    }

    return () => {
      cancelled = true;
      if (idleId !== null && typeof window !== "undefined") {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleId);
        }
      }
      if (timeoutId !== null && typeof window !== "undefined") {
        window.clearTimeout(timeoutId);
      }
    };
  }, [vapidKey]);

  const subscribe = async () => {
    if (!vapidKey) return;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // The DOM lib's BufferSource union narrowed in newer TS — Uint8Array
        // is still the correct runtime value, just nudge the type.
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource
      });
      const json = sub.toJSON();
      const res = await savePushSubscriptionAction({
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh || "",
        auth: json.keys?.auth || "",
        user_agent: navigator.userAgent
      });
      if ("error" in res) {
        toast.error(res.error);
        await sub.unsubscribe().catch(() => {});
        return;
      }
      setState("on");
      toast.success("সাবস্ক্রাইব হয়েছে! মৌসুম এলেই জানাব।");
    } catch (err) {
      console.error("[push] subscribe failed:", err);
      const denied = Notification.permission === "denied";
      if (denied) {
        setState("denied");
        toast.error("নোটিফিকেশন অনুমতি ব্রাউজার সেটিংস থেকে দিন");
      } else {
        toast.error("সাবস্ক্রাইব করা যায়নি");
      }
    } finally {
      setBusy(false);
    }
  };

  const unsubscribe = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await deletePushSubscriptionAction(endpoint);
      }
      setState("off");
      toast.success("সাবস্ক্রিপশন বাতিল হয়েছে");
    } catch (err) {
      console.error("[push] unsubscribe failed:", err);
      toast.error("কিছু ভুল হয়েছে");
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading" || state === "unsupported") return null;

  const base =
    "inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50";

  if (state === "denied") {
    return (
      <span
        className={
          className ??
          base +
            " border-mango-200 bg-white text-ink/50 cursor-not-allowed"
        }
      >
        <BellOff className="h-4 w-4" />
        নোটিফিকেশন ব্লক করা
      </span>
    );
  }

  if (state === "on") {
    return (
      <button
        type="button"
        onClick={unsubscribe}
        disabled={busy}
        className={
          className ??
          base +
            " border-leaf-500 bg-leaf-500/10 text-leaf-700 hover:bg-leaf-500/20"
        }
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        সাবস্ক্রাইব্ড · বাতিল করুন
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={subscribe}
      disabled={busy}
      className={
        className ?? base + " border-mango-300 bg-white text-mango-700 hover:bg-mango-100"
      }
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      মৌসুম এলেই জানিয়ে দিন
    </button>
  );
}

/** Convert a URL-safe base64 VAPID key to the Uint8Array Push API expects. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}
