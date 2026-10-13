"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/providers/LocaleProvider";

/**
 * Step 1 of password recovery: ask Supabase Auth to email a reset link.
 *
 * The link in that email points at `/auth/callback?next=/reset-password`
 * (an allowed redirect URL — the same one Google OAuth already uses).
 * The callback exchanges the PKCE code for a session, then the
 * /reset-password page lets the user pick the new password.
 *
 * Note: Supabase deliberately does NOT reveal whether an email is
 * registered — the same success message shows either way.
 */
export default function ForgotPasswordForm() {
  const { t: d } = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError(d.auth.genericError);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo });
      if (resetError) {
        setError(resetError.message);
        toast.error(d.auth.genericError);
        return;
      }
      setSentTo(trimmed);
    } catch (err) {
      console.error(err);
      setError(d.auth.genericError);
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="text-center py-2">
        <CheckCircle2 className="h-14 w-14 mx-auto text-leaf-500" />
        <h2 className="font-display-bn text-xl font-bold mt-3">
          {d.auth.forgotSuccessTitle}
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          {d.auth.forgotSuccessDesc(sentTo)}
        </p>
        <p className="mt-3 text-xs text-ink/50 leading-relaxed">
          {d.auth.forgotSpamNote}
        </p>
        <Link
          href="/login"
          className="btn-primary mt-6 inline-flex text-sm py-2.5"
        >
          {d.auth.forgotBackToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          {d.auth.email}
        </label>
        <div className="relative">
          <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field pl-10"
            placeholder="you@email.com"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {d.auth.forgotSending}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> {d.auth.forgotBtn}
          </>
        )}
      </button>
    </form>
  );
}
