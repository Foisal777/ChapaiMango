import Link from "next/link";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";
import ResetPasswordForm from "./ResetPasswordForm";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata = {
  title: "নতুন পাসওয়ার্ড — Chapai Mango House",
  description: "নতুন পাসওয়ার্ড সেট করুন।",
  robots: { index: false, follow: false }
};

/**
 * Step 2 of password recovery: set the new password.
 *
 * By the time the user reaches this page the /auth/callback route has
 * already exchanged the email link's PKCE code for a session, so we
 * simply require a signed-in user and let them call
 * `supabase.auth.updateUser({ password })`.
 *
 * No session (expired link, code already used, …) → show the
 * "link not valid" state with a shortcut back to /forgot-password.
 */
export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  const d = getDictionary(getLocale());
  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;

  return (
    <div className="min-h-[calc(100vh-12rem)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/forgot-password"
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

          {searchParams.error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mt-4">
              <AlertTriangle className="inline h-4 w-4 mr-1.5 -mt-0.5" />
              {searchParams.error}
            </div>
          )}

          {user ? (
            <>
              <h1 className="font-display-bn text-2xl font-bold mt-4">
                {d.auth.resetTitle}
              </h1>
              <p className="text-sm text-ink/60 mt-1 mb-6">
                {d.auth.resetDesc}
              </p>
              {configured ? (
                <ResetPasswordForm />
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-mango-400 bg-mango-50 p-5 text-sm text-ink/70">
                  {d.auth.notConfigured} —{" "}
                  <code>.env.local</code>-এ Supabase URL ও anon key বসান।
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="font-display-bn text-2xl font-bold mt-4">
                {d.auth.invalidLinkTitle}
              </h1>
              <p className="text-sm text-ink/60 mt-1 mb-6">
                {d.auth.invalidLinkDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/forgot-password"
                  className="btn-primary flex-1 text-sm py-2.5"
                >
                  {d.auth.requestNewLink}
                </Link>
                <Link
                  href="/login"
                  className="btn-ghost flex-1 text-sm py-2.5"
                >
                  {d.auth.signInBtn}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
