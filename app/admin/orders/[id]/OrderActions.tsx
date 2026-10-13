"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  Loader2,
  Trash2,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteOrderAction,
  updateOrderStatusAction,
  type OrderStatus
} from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const STATUSES: {
  value: OrderStatus;
  label: string;
  icon: typeof Clock;
  cls: string;
}[] = [
  { value: "pending", label: "Pending", icon: Clock, cls: "amber" },
  { value: "confirmed", label: "Confirm", icon: CheckCircle2, cls: "blue" },
  { value: "shipped", label: "Ship", icon: Truck, cls: "purple" },
  { value: "delivered", label: "Deliver", icon: PackageCheck, cls: "green" },
  { value: "cancelled", label: "Cancel", icon: XCircle, cls: "red" }
];

const ACCENT: Record<string, string> = {
  amber: "bg-amber-100 text-amber-800 border-amber-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  purple: "bg-purple-100 text-purple-800 border-purple-300",
  green: "bg-green-100 text-green-800 border-green-300",
  red: "bg-red-100 text-red-800 border-red-300"
};

export default function OrderActions({
  id,
  currentStatus
}: {
  id: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const setStatus = (next: OrderStatus) => {
    if (next === currentStatus) return;
    startTransition(async () => {
      const res = await updateOrderStatusAction(id, next);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Status: ${next}`);
        router.refresh();
      }
    });
  };

  const onDelete = () => {
    if (
      !confirm(
        "Ei order delete korte chan? Eta permanent — undo kora jabe na."
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deleteOrderAction(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Order deleted");
        router.push("/admin/orders");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5">
        <h3 className="font-display text-base font-bold mb-1">
          Update Status
        </h3>
        <p className="text-xs text-ink/50 mb-4">
          Customer-er order journey-er next step beche nin.
        </p>
        <div className="grid grid-cols-1 gap-2">
          {STATUSES.map((s) => {
            const active = s.value === currentStatus;
            return (
              <button
                key={s.value}
                disabled={pending || active}
                onClick={() => setStatus(s.value)}
                className={cn(
                  "flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition",
                  active
                    ? `${ACCENT[s.cls]} cursor-default`
                    : "bg-white border-mango-200 text-ink hover:bg-mango-50 hover:border-mango-300",
                  pending && !active && "opacity-50"
                )}
              >
                <span className="flex items-center gap-2">
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </span>
                {active && (
                  <span className="text-[10px] uppercase font-bold opacity-70">
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {pending && (
          <div className="mt-3 flex items-center gap-2 text-xs text-ink/60 justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating...
          </div>
        )}
      </div>

      <button
        disabled={pending}
        onClick={onDelete}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete order
      </button>
    </div>
  );
}
