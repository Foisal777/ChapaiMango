import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import { signOutAction } from "@/app/admin/actions";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth";

export const metadata = {
  title: "Admin — Chapai Mango House",
  robots: { index: false, follow: false }
};

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // The /admin/login page is rendered "full bleed" without the sidebar.
  // Middleware already redirects unauthenticated users to /admin/login,
  // so when we reach this layout for any other admin route the user must
  // exist. We additionally check is_admin() to enforce the role.
  if (!isSupabaseConfigured()) {
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  const { user, isAdmin } = await getAuthContext();

  // Login page (no user yet) — render full-bleed.
  if (!user) {
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  // Logged in but NOT in admin_emails — show a clear "no access" screen.
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream grid place-items-center px-4">
        <div className="w-full max-w-md glass rounded-3xl p-8 text-center">
          <ShieldAlert className="h-14 w-14 mx-auto text-mango-600" />
          <h1 className="font-display-bn text-2xl font-bold mt-4">
            অ্যাডমিন অ্যাক্সেস নেই
          </h1>
          <p className="text-sm text-ink/70 mt-2">
            এই অ্যাকাউন্ট (<span className="font-mono">{user.email}</span>)
            অ্যাডমিন তালিকায় নেই। অ্যাকাউন্টটি অ্যাডমিন করতে Supabase SQL
            Editor-এ চালান:
          </p>
          <pre className="mt-4 text-left text-[11px] bg-mango-50 border border-mango-200 rounded-xl p-3 overflow-x-auto">
{`insert into public.admin_emails (email)
values ('${user.email}')
on conflict do nothing;`}
          </pre>
          <div className="flex gap-2 justify-center mt-5 flex-wrap">
            <Link href="/" className="btn-ghost text-xs py-2">
              হোম
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
              >
                সাইন আউট
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream lg:flex">
      <Sidebar email={user.email ?? ""} />
      <div className="flex-1 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
