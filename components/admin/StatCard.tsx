import { type LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "mango"
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: "mango" | "leaf" | "blue" | "amber" | "red";
}) {
  const accents: Record<string, string> = {
    mango: "from-mango-400 to-mango-600",
    leaf: "from-leaf-400 to-leaf-600",
    blue: "from-blue-400 to-blue-600",
    amber: "from-amber-400 to-amber-600",
    red: "from-red-400 to-red-600"
  };
  return (
    <div className="glass rounded-2xl p-5 hover:shadow-glow transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-ink/50">
            {label}
          </div>
          <div className="font-display text-3xl font-bold text-ink mt-1">
            {value}
          </div>
          {hint && (
            <div className="text-xs text-ink/50 mt-1">{hint}</div>
          )}
        </div>
        <div
          className={`grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br ${accents[accent]} shadow-soft`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
