"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, LogIn, Mail, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

type AuthMode = "phone" | "email";

export default function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") || "/orders";
  const oauthError = search.get("error");

  const [mode, setMode] = useState<AuthMode>("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Surface errors bounced back from /auth/callback (e.g. Google OAuth failed).
  useEffect(() => {
    if (oauthError) {
      setError(oauthError);
      toast.error("সাইন ইন করা যায়নি");
    }
  }, [oauthError]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let credentials:
      | { email: string; password: string }
      | { phone: string; password: string };
    if (mode === "email") {
      credentials = {
        email: identifier.trim().toLowerCase(),
        password
      };
    } else {
      if (!isValidBdPhone(identifier)) {
        setError("সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 01712345678)");
        return;
      }
      credentials = {
        phone: normalizeBdPhone(identifier),
        password
      };
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } =
        await supabase.auth.signInWithPassword(credentials);
      if (signInError) {
        setError(signInError.message);
        toast.error("সাইন ইন করতে পারিনি");
        return;
      }
      toast.success("স্বাগতম!");
      window.location.href = next;
    } catch (err) {
      console.error(err);
      setError("কিছু ভুল হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <GoogleSignInButton next={next} />

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-mango-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-semibold uppercase tracking-wide text-ink/40">
            অথবা
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-2">
          কী দিয়ে সাইন ইন করবেন?
        </label>
        <div className="grid grid-cols-2 gap-2">
          <ModeButton
            active={mode === "phone"}
            onClick={() => {
              setMode("phone");
              setIdentifier("");
              setError(null);
            }}
            icon={<Smartphone className="h-4 w-4" />}
            label="ফোন"
          />
          <ModeButton
            active={mode === "email"}
            onClick={() => {
              setMode("email");
              setIdentifier("");
              setError(null);
            }}
            icon={<Mail className="h-4 w-4" />}
            label="ইমেইল"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          {mode === "email" ? "ইমেইল" : "ফোন নম্বর"}
        </label>
        <input
          type={mode === "email" ? "email" : "tel"}
          autoComplete={mode === "email" ? "email" : "tel"}
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="input-field"
          placeholder={mode === "email" ? "you@email.com" : "01712345678"}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          পাসওয়ার্ড
        </label>
        <input
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
            <Loader2 className="h-4 w-4 animate-spin" /> সাইন ইন হচ্ছে...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" /> সাইন ইন
          </>
        )}
      </button>
    </form>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition",
        active
          ? "border-mango-500 bg-mango-100 text-mango-700 shadow-glow"
          : "border-mango-200 bg-white text-ink/60 hover:border-mango-300"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
