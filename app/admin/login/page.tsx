import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";
import LoginForm from "./LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin Login — Chapai Mango",
  robots: { index: false, follow: false }
};

export default function AdminLoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-hero-radial grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-mango-700 hover:gap-2 transition-all mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> Back to site
        </Link>

        <div className="glass rounded-3xl p-8 shadow-soft">
          <Link
            href="/"
            className="flex items-center justify-center mb-1 group"
            aria-label="Chapai Mango House — home"
          >
            <BrandLogo size="lg" />
          </Link>
          <h1 className="font-display text-2xl font-bold mt-4">
            Admin Login
          </h1>
          <p className="text-sm text-ink/60 mt-1 mb-6">
            Sign in with your Supabase admin account.
          </p>

          {!configured ? (
            <div className="rounded-2xl border-2 border-dashed border-mango-400 bg-mango-50 p-5 text-sm text-ink/70 leading-relaxed">
              <p className="font-semibold text-ink mb-2">
                Supabase ekhono configure kora hoyni.
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Supabase project banan (free)</li>
                <li>SQL Editor-e <code>supabase/schema.sql</code> run korun</li>
                <li>
                  Authentication → Users → Add user (email + password) banan
                </li>
                <li>
                  <code>.env.local</code>-e Supabase URL + anon key bosan ar
                  restart korun
                </li>
              </ol>
            </div>
          ) : (
            <>
              <LoginForm />
              <div className="text-center mt-4">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-mango-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-ink/50 mt-5">
          🔒 Only authorized admin users can access this area.
        </p>
      </div>
    </div>
  );
}
