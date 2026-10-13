"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";
import { sendBroadcastPushAction } from "@/app/admin/actions";

export default function SendPushForm({
  subscriberCount
}: {
  subscriberCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/products");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscriberCount === 0) {
      toast.error("Akhono kono subscriber nei.");
      return;
    }
    if (
      !confirm(
        `Send to ${subscriberCount} subscriber${
          subscriberCount === 1 ? "" : "s"
        }?`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await sendBroadcastPushAction({ title, body, url });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success(
        `Sent: ${res.sent} · Cleaned dead: ${res.removed}`,
        { duration: 6000 }
      );
      setTitle("");
      setBody("");
      setUrl("/products");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="glass rounded-3xl p-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          Title *
        </label>
        <input
          required
          maxLength={80}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="হিমসাগরের সিজন শুরু! 🥭"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          Message *
        </label>
        <textarea
          required
          rows={3}
          maxLength={300}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="input-field"
          placeholder="চাঁপাইয়ের গাছপাকা হিমসাগর এখন স্টকে — অর্ডার করুন।"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          On click — open URL
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input-field"
          placeholder="/products"
        />
        <p className="text-[11px] text-ink/40 mt-1">
          Same-origin path (e.g. /products/himsagar). Defaults to /products.
        </p>
      </div>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Send to {subscriberCount} subscriber
            {subscriberCount === 1 ? "" : "s"}
          </>
        )}
      </button>
    </form>
  );
}
