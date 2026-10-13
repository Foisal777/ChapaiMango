"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function SignupForm() {
  const search = useSearchParams();
  const next = search.get("next") || "/orders";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ needsConfirm: boolean } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
            phone
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        toast.error("সাইন আপ করতে পারিনি");
        return;
      }

      // If email confirmation is required, the user is returned but session is null.
      // If confirmation is off, session is set and we can proceed straight in.
      if (data.session) {
        toast.success("অ্যাকাউন্ট তৈরি! স্বাগতম।");
        window.location.href = next;
      } else {
        setDone({ needsConfirm: true });
      }
    } catch (err) {
      console.error(err);
      setError("কিছু ভুল হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-2">
        <CheckCircle2 className="h-14 w-14 mx-auto text-leaf-500" />
        <h2 className="font-display-bn text-xl font-bold mt-3">
          অ্যাকাউন্ট তৈরি হয়েছে!
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          আপনার ইমেইলে একটি কনফার্মেশন লিঙ্ক পাঠানো হয়েছে।{" "}
          <strong>{email}</strong> চেক করুন এবং লিঙ্কে ক্লিক করুন। তারপর{" "}
          <a href="/login" className="text-mango-700 underline">
            সাইন ইন
          </a>{" "}
          করুন।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <GoogleSignInButton next={next} label="Google দিয়ে সাইন আপ" />

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
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          পূর্ণ নাম *
        </label>
        <input
          type="text"
          required
          minLength={2}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input-field"
          placeholder="মোঃ রহিম উদ্দিন"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          ফোন *
        </label>
        <input
          type="tel"
          required
          minLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-field"
          placeholder="01XXXXXXXXX"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          ইমেইল *
        </label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder="you@email.com"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          পাসওয়ার্ড * <span className="font-normal text-ink/40">(৬+ অক্ষর)</span>
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

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> তৈরি করছি...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" /> অ্যাকাউন্ট তৈরি করুন
          </>
        )}
      </button>
    </form>
  );
}
