import { cn } from "@/lib/utils";

type Status = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const STYLES: Record<Status, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  shipped: "bg-purple-100 text-purple-800 border-purple-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300"
};

export default function StatusBadge({
  status,
  className
}: {
  status: Status | string;
  className?: string;
}) {
  const key = (status as Status) in STYLES ? (status as Status) : "pending";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border capitalize",
        STYLES[key],
        className
      )}
    >
      {status}
    </span>
  );
}
