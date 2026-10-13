"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteReviewAction,
  setReviewApprovalAction
} from "@/app/admin/actions";

export default function ReviewModerationActions({
  id,
  isApproved
}: {
  id: string;
  isApproved: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      const res = await setReviewApprovalAction(id, !isApproved);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(isApproved ? "Review hidden" : "Review approved");
        router.refresh();
      }
    });
  };

  const onDelete = () => {
    if (!confirm("Ei review delete korbo? Eta permanent.")) return;
    startTransition(async () => {
      const res = await deleteReviewAction(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Review deleted");
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={toggle}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-xl border border-mango-200 bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-mango-50 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isApproved ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
        {isApproved ? "Hide" : "Approve"}
      </button>
      <button
        onClick={onDelete}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}
