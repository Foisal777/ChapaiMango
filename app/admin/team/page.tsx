import { Users } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { fetchAdminTeamMembers } from "@/lib/admin/data";
import TeamMemberForm from "./TeamMemberForm";
import TeamMemberRowActions from "./TeamMemberRowActions";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  founder: "Founder",
  supplier: "Supplier",
  member: "Team Member"
};

const ROLE_BADGE: Record<string, string> = {
  founder: "bg-mango-gradient text-ink",
  supplier: "bg-leaf-100 text-leaf-700 border border-leaf-300",
  member: "bg-mango-50 text-mango-700 border border-mango-300"
};

/**
 * Manage the Founder / Supplier / Team Member directory shown on the
 * public /team page. Operator can add / edit / hide / delete / reorder
 * people without a code deploy. Each row has its own inline edit form
 * so the workflow matches /admin/marquees.
 */
export default async function AdminTeamPage() {
  const members = await fetchAdminTeamMembers();
  const activeCount = members.filter((m) => m.is_active).length;

  return (
    <>
      <PageHeader
        title="Team & Suppliers"
        subtitle={`${members.length} entr${
          members.length === 1 ? "y" : "ies"
        } · ${activeCount} live`}
      />

      <div className="mb-6">
        <TeamMemberForm />
      </div>

      {members.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center">
          <Users className="h-14 w-14 mx-auto text-mango-400" />
          <p className="mt-3 font-display text-lg">Akhono kichu nei</p>
          <p className="text-sm text-ink/50 mt-1">
            Upore form-e ekta team member / supplier / founder add koren.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="glass rounded-2xl px-4 py-3 flex items-start justify-between gap-3 flex-wrap"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="h-14 w-14 rounded-2xl overflow-hidden bg-mango-100 shrink-0">
                  {m.photo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={m.photo_url}
                      alt={m.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-mango-400 text-xl">
                      🥭
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-bold leading-snug break-words ${
                        m.is_active
                          ? "text-ink"
                          : "text-ink/40 line-through"
                      }`}
                    >
                      {m.name}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-0.5 ${
                        ROLE_BADGE[m.role] || ROLE_BADGE.member
                      }`}
                    >
                      {ROLE_LABEL[m.role] || m.role}
                    </span>
                  </div>
                  {m.title && (
                    <div className="text-xs text-mango-700 mt-0.5">
                      {m.title}
                    </div>
                  )}
                  <div className="text-[10px] text-ink/40 mt-0.5">
                    Order {m.sort_order} ·{" "}
                    {m.is_active ? (
                      <span className="text-leaf-600 font-semibold">live</span>
                    ) : (
                      <span className="text-red-500 font-semibold">hidden</span>
                    )}
                  </div>
                </div>
              </div>
              <TeamMemberRowActions member={m} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
