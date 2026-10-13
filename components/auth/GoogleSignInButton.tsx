"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** Where to send the user after the Google round-trip succeeds. */
  next?: string;
  /** Optional label override (defaults to "Google দিয়ে চালিয়ে যান"). */
  label?: string;
  className?: string;
};

/**
 * "Continue with Google" button.
 *
 * Triggers Supabase OAuth (PKCE) for Google. Supabase will round-trip the
 * user through Google and return them to /auth/callback?code=...&next=...,
 * which exchanges the code for a session cookie.
 */
export default function GoogleSignInButton({
  next = "/orders",
  label = "Google দিয়ে চালিয়ে যান",
  className
}: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
        next
      )}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            // Always show the account chooser so users can switch accounts.
            prompt: "select_account"
          }
        }
      });

      if (error) {
        toast.error("Google সাইন ইন শুরু করতে পারিনি");
        console.error(error);
        setLoading(false);
      }
      // On success the browser navigates away to Google — no need to reset.
    } catch (err) {
      console.error(err);
      toast.error("কিছু ভুল হয়েছে। আবার চেষ্টা করুন।");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={
        className ??
        "flex w-full items-center justify-center gap-3 rounded-xl border-2 border-mango-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-mango-300 hover:bg-mango-50 disabled:opacity-60"
      }
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <GoogleLogo className="h-5 w-5" />
      )}
      {label}
    </button>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 34.91 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
