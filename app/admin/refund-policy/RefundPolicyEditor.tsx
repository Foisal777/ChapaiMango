"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Save, Eye, Edit3 } from "lucide-react";
import { updateRefundPolicyAction } from "@/app/admin/actions";
import { renderMarkdown } from "@/lib/markdown";

/**
 * Markdown editor with a Write/Preview toggle so the operator
 * can see exactly how the /refund page will render before saving.
 *
 * We deliberately keep this a simple textarea — no fancy WYSIWYG.
 * Markdown is enough for a legal-text page (headings + lists +
 * paragraphs) and stays human-readable in the DB.
 */
export default function RefundPolicyEditor({
  initialBody,
  updatedAt
}: {
  initialBody: string;
  updatedAt: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [pending, startTransition] = useTransition();

  const onSave = () => {
    if (!body.trim()) {
      toast.error("Policy text cannot be empty");
      return;
    }
    startTransition(async () => {
      const res = await updateRefundPolicyAction(body);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Refund policy saved");
        router.refresh();
      }
    });
  };

  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString()
    : "never";

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex rounded-full border border-mango-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              tab === "write"
                ? "bg-mango-gradient text-ink shadow-soft"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              tab === "preview"
                ? "bg-mango-gradient text-ink shadow-soft"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>
        <div className="text-[11px] text-ink/50">
          Last updated: {updatedLabel} · {body.length} chars
        </div>
      </div>

      {tab === "write" ? (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={22}
          className="input-field font-mono text-sm resize-y leading-relaxed"
          placeholder="## রিফান্ড পলিসি&#10;&#10;এখানে আপনার নীতিমালা লিখুন..."
        />
      ) : (
        <article
          className="prose-mango max-w-none rounded-2xl border border-mango-200 bg-white px-5 py-4"
          // Rendered server-helper output is sanitised against XSS.
          dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-[11px] text-ink/50">
          Markdown supported: <code>## heading</code>, <code>**bold**</code>,
          <code>- list</code>, blank line for paragraph.
        </p>
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="btn-primary text-sm py-2"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save policy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
