import { Mail, Phone, MessageSquare, Calendar } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DeleteMessageButton from "./DeleteMessageButton";
import { fetchAdminMessages } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await fetchAdminMessages();

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle={`${messages.length} customer message${messages.length === 1 ? "" : "s"}`}
      />

      {messages.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center">
          <MessageSquare className="h-14 w-14 mx-auto text-mango-400" />
          <p className="mt-3 font-display text-lg">Akhono kono message nei</p>
          <p className="text-sm text-ink/50 mt-1">
            Customer-ra contact form fill up korle ekhane jomte thakbe.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {messages.map((m) => (
            <article
              key={m.id}
              className="glass rounded-2xl p-5 flex flex-col"
            >
              <header className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-ink">
                    {m.name}
                  </h3>
                  <div className="text-[11px] text-ink/50 inline-flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(m.created_at).toLocaleString("en-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
                <DeleteMessageButton id={m.id} />
              </header>

              <div className="flex flex-wrap gap-2 mb-3">
                {m.email && (
                  <a
                    href={`mailto:${m.email}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-mango-100 px-3 py-1 text-[11px] font-semibold text-mango-700 hover:bg-mango-200 transition"
                  >
                    <Mail className="h-3 w-3" />
                    {m.email}
                  </a>
                )}
                {m.phone && (
                  <a
                    href={`tel:${m.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-leaf-400/20 px-3 py-1 text-[11px] font-semibold text-leaf-700 hover:bg-leaf-400/30 transition"
                  >
                    <Phone className="h-3 w-3" />
                    {m.phone}
                  </a>
                )}
              </div>

              <div className="rounded-xl bg-cream/70 border border-mango-200/50 p-3 text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">
                {m.message}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
