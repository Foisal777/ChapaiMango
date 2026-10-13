"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/providers/LocaleProvider";

/**
 * Set the new password (step 2 of recovery). The session already
 * exists (created by /auth/callback when the email link was opened),
 * so a plain `updateUser({ password })` is all that's needed.
 */
export default function ResetPasswordForm() {
  const { t: d } = useLocale();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError(d.auth.passwordMin);
      return;
    }
    if (password !== confirm) {
      setError(d.auth.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });
      if (updateError) {
        setError(updateError.message);
        toast.error(d.auth.genericError);
        return;
      }
      setDone(true);
      toast.success(d.auth.resetSuccessTitle);
    } catch (err) {
      console.error(err);
      setError(d.auth.genericError);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-2">
        <CheckCircle2 className="h-14 w-14 mx-auto text-leaf-500" />
        <h2 className="font-display-bn text-xl font-bold mt-3">
          {d.auth.resetSuccessTitle}
        </h2>
        <p className="mt-2 text-sm text-ink/70">{d.auth.resetSuccessDesc}</p>
        <Link href="/login" className="btn-primary mt-6 inline-flex text-sm py-2.5">
          <KeyRound className="h-4 w-4" /> {d.auth.signInBtn}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          {d.auth.newPassword}
        </label>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          {d.auth.confirmPassword}
        </label>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input-field"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {d.auth.resetSending}
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" /> {d.auth.resetBtn}
          </>
        )}
      </button>
    </form>
  );
}
