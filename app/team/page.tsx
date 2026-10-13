import Link from "next/link";
import { Facebook, Mail, Phone, Users } from "lucide-react";
import { getActiveTeamMembers } from "@/lib/data";
import type { TeamMember, TeamMemberRole } from "@/types";

export const metadata = {
  title: "আমাদের টিম — Chapai Mango House",
  description:
    "Chapai Mango House-এর প্রতিষ্ঠাতা, সরবরাহকারী ও টিম সদস্যদের সাথে পরিচিত হোন।"
};

// Render at most every revalidate seconds, so admin edits show
// up quickly without a full rebuild.
export const revalidate = 60;

const ROLE_ORDER: TeamMemberRole[] = ["founder", "supplier", "member"];

const ROLE_META: Record<
  TeamMemberRole,
  { heading: string; subheading: string; emoji: string }
> = {
  founder: {
    heading: "প্রতিষ্ঠাতা",
    subheading: "যাঁদের স্বপ্নে গড়ে উঠেছে Chapai Mango House",
    emoji: "🌟"
  },
  supplier: {
    heading: "আমাদের সরবরাহকারী",
    subheading:
      "চাঁপাইনবাবগঞ্জের অভিজ্ঞ চাষি ও বাগান অংশীদার — খাঁটি আমের প্রকৃত উৎস",
    emoji: "🌳"
  },
  member: {
    heading: "টিম সদস্য",
    subheading: "প্যাকেজিং, ডেলিভারি ও কাস্টমার কেয়ার দলের পরিচিত মুখগুলো",
    emoji: "🤝"
  }
};

export default async function TeamPage() {
  const members = await getActiveTeamMembers();

  // Group by role so each section is rendered together.
  const grouped = ROLE_ORDER.map((role) => ({
    role,
    items: members.filter((m) => m.role === role)
  })).filter((g) => g.items.length > 0);

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-radial">
        <div className="container-x py-16 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-mango-600 mb-2">
            ━ আমাদের টিম
          </p>
          <h1 className="font-display-bn text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            যাদের হাতে <span className="shimmer-text">গড়ে ওঠে</span> খাঁটি আম
          </h1>
          <p className="mt-5 text-ink/70 text-base sm:text-lg">
            প্রতিষ্ঠাতা থেকে শুরু করে বাগানের চাষি, প্যাকেজিং দল আর ডেলিভারি
            টিম — প্রত্যেকের পরিশ্রমেই আপনার দরজায় পৌঁছায় চাঁপাইনবাবগঞ্জের
            সেরা আম।
          </p>
        </div>
      </section>

      {/* Sections per role */}
      {grouped.length === 0 ? (
        <section className="container-x py-20 text-center">
          <Users className="h-14 w-14 mx-auto text-mango-400" />
          <p className="mt-3 font-display-bn text-lg">
            টিম তথ্য এখনো যোগ করা হয়নি
          </p>
          <p className="text-sm text-ink/50 mt-1">
            শীঘ্রই আমাদের পরিবার সম্পর্কে জানতে পারবেন।
          </p>
        </section>
      ) : (
        grouped.map(({ role, items }) => (
          <section key={role} className="container-x py-14">
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <p className="text-sm font-semibold text-mango-600 mb-2">
                ━ {ROLE_META[role].emoji} {ROLE_META[role].heading}
              </p>
              <h2 className="section-title">
                {role === "founder" ? (
                  <>
                    আমাদের <span className="shimmer-text">প্রতিষ্ঠাতা</span>
                  </>
                ) : role === "supplier" ? (
                  <>
                    বাগান <span className="shimmer-text">অংশীদার</span>
                  </>
                ) : (
                  <>
                    টিম <span className="shimmer-text">সদস্য</span>
                  </>
                )}
              </h2>
              <p className="mt-3 text-sm text-ink/60">
                {ROLE_META[role].subheading}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((m) => (
                <TeamCard key={m.id} member={m} />
              ))}
            </div>
          </section>
        ))
      )}

      {/* Footer CTA */}
      <section className="container-x pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-mango-gradient p-10 sm:p-14 text-center">
          <div className="absolute -top-10 -left-10 text-9xl opacity-15">
            🥭
          </div>
          <div className="absolute -bottom-10 -right-10 text-9xl opacity-15">
            🌿
          </div>
          <h2 className="relative font-display-bn text-2xl sm:text-3xl md:text-4xl font-bold text-ink max-w-2xl mx-auto leading-tight">
            আমাদের পরিবারের অংশ হয়ে চাখুন চাঁপাইয়ের সেরা আম।
          </h2>
          <Link
            href="/products"
            className="relative mt-6 inline-flex btn-ghost bg-white/40"
          >
            শপ দেখুন
          </Link>
        </div>
      </section>
    </>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  const initials = (member.name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <article className="glass rounded-3xl overflow-hidden hover:shadow-glow transition-shadow flex flex-col">
      <div className="relative aspect-[4/5] bg-mango-100 overflow-hidden">
        {member.photo_url ? (
          // Avoid next/image so any operator-pasted URL works without
          // adding the host to next.config.mjs first.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo_url}
            alt={member.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center bg-mango-gradient">
            <span className="font-display text-5xl font-bold text-ink/70">
              {initials || "🥭"}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/40 to-transparent" />
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <h3 className="font-display-bn text-lg sm:text-xl font-bold text-ink leading-tight">
          {member.name}
        </h3>
        {member.title && (
          <p className="text-sm font-semibold text-mango-700 mt-1">
            {member.title}
          </p>
        )}
        {member.bio && (
          <p className="mt-3 text-sm text-ink/70 leading-relaxed">
            {member.bio}
          </p>
        )}

        {(member.phone || member.email || member.facebook_url) && (
          <div className="mt-4 pt-4 border-t border-mango-200/60 flex flex-wrap gap-2">
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-mango-200 px-3 py-1.5 text-xs font-semibold text-mango-700 hover:bg-mango-50 transition"
                aria-label={`Call ${member.name}`}
              >
                <Phone className="h-3.5 w-3.5" />
                {member.phone}
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-mango-200 px-3 py-1.5 text-xs font-semibold text-mango-700 hover:bg-mango-50 transition"
                aria-label={`Email ${member.name}`}
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </a>
            )}
            {member.facebook_url && (
              <a
                href={member.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1877F2] px-3 py-1.5 text-xs font-semibold text-white hover:scale-105 transition"
                aria-label={`Facebook profile of ${member.name}`}
              >
                <Facebook className="h-3.5 w-3.5 fill-white" />
                Facebook
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
