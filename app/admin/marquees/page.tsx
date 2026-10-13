import { Megaphone } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { fetchAdminMarquees } from "@/lib/admin/data";
import MarqueeForm from "./MarqueeForm";
import MarqueeRowActions from "./MarqueeRowActions";

export const dynamic = "force-dynamic";

/**
 * Manage the scrolling promo strip that sits above the navbar on
 * every public page. Operator can add / edit / hide / delete /
 * reorder messages without a code deploy. The TopMarquee server
 * component reads from the same table on every render, so changes
 * here go live within seconds (revalidatePath buys instant refresh).
 */
export default async function AdminMarqueesPage() {
  const marquees = await fetchAdminMarquees();
  const activeCount = marquees.filter((m) => m.is_active).length;

  return (
    <>
      <PageHeader
        title="Marquees"
        subtitle={`${marquees.length} message${
          marquees.length === 1 ? "" : "s"
        } · ${activeCount} live`}
      />

      <div className="mb-6">
        <MarqueeForm />
      </div>

      {marquees.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center">
          <Megaphone className="h-14 w-14 mx-auto text-mango-400" />
          <p className="mt-3 font-display text-lg">Akhono kichu nei</p>
          <p className="text-sm text-ink/50 mt-1">
            Upore form-e ekta message likhe Add koren.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {marquees.map((m) => (
            <div
              key={m.id}
              className="glass rounded-2xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="text-2xl shrink-0" aria-hidden>
                  {m.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-semibold leading-snug break-words ${
                      m.is_active ? "text-ink" : "text-ink/40 line-through"
                    }`}
                  >
                    {m.text}
                  </div>
                  <div className="text-[10px] text-ink/40 mt-0.5">
                    Order {m.sort_order} ·{" "}
                    {m.is_active ? (
                      <span className="text-leaf-600 font-semibold">live</span>
                    ) : (
                      <span className="text-red-500 font-semibold">hidden</span>
                    )}{" "}
                    · {new Date(m.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <MarqueeRowActions marquee={m} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
