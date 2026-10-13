"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteProductAction } from "@/app/admin/actions";

export default function DeleteProductButton({
  id,
  name
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (!confirm(`"${name}" delete korte chan? Eta undo kora jabe na.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteProductAction(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`${name} deleted`);
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      Delete
    </button>
  );
}
