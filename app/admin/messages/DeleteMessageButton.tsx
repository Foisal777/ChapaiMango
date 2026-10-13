"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteMessageAction } from "@/app/admin/actions";

export default function DeleteMessageButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (!confirm("Ei message delete korte chan?")) return;
    startTransition(async () => {
      const res = await deleteMessageAction(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Message deleted");
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="grid place-items-center h-8 w-8 rounded-full text-red-500 hover:bg-red-50 transition shrink-0"
      aria-label="Delete message"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
