import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { safeNextPath } from "@/lib/utils";

export const metadata = {
  title: "পাসওয়ার্ড রিসেট — Chapai Mango House",
  description:
    "ইমেইলে পাসওয়ার্ড রিসেট লিঙ্ক রিসিভ করুন এবং নতুন পাসওয়ার্ড সেট করুন।",
  robots: { index: false, follow: false }
};

/**
 * "Forgot password" step — user types their email and we ask Supabase
 * Auth to send the recovery email. The email's link lands on
 * /auth/callback?next=/reset-password, which exchanges the PKCE code
 * for a session and then opens /reset-password (set-new-password step).
 */
export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: { next?: string };
}) {
  const d = getDictionary(getLocale());
  const configured = isSupabaseConfigured();
  if (configured) {
    const user = await getCurrentUser();
    // Already signed in — no reset needed.
    if (user) redirect(safeNextPath(searchParams.next, "/orders"));
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-mango-700 hover:gap-2 transition-all mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> {d.auth.forgotBackToLogin}
        </Link>

        <div className="glass rounded-3xl p-8 shadow-soft">
          <Link
            href="/"
            className="flex items-center justify-center mb-1 group"
            aria-label="Chapai Mango House — হোম"
          >
            <BrandLogo size="lg" />
          </Link>
          <h1 className="font-display-bn text-2xl font-bold mt-4">
            {d.auth.forgotTitle}
          </h1>
          <p className="text-sm text-ink/60 mt-1 mb-6">
            {d.auth.forgotDesc}
          </p>

          {configured ? (
            <ForgotPasswordForm />
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-mango-400 bg-mango-50 p-5 text-sm text-ink/70">
              {d.auth.notConfigured} —{" "}
              <code>.env.local</code>-এ Supabase URL ও anon key বসান।
            </div>
          )}
        </div>

        <p className="text-center text-sm text-ink/60 mt-5">
          <Link href="/login" className="font-semibold text-mango-700 hover:underline">
            {d.auth.forgotBackToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}
