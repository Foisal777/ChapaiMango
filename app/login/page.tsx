import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import LoginForm from "./LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "লগইন — Chapai Mango House",
  description: "Chapai Mango House-এ আপনার অ্যাকাউন্টে সাইন ইন করুন।"
};

export default async function CustomerLoginPage({
  searchParams
}: {
  searchParams: { next?: string };
}) {
  const configured = isSupabaseConfigured();
  if (configured) {
    const user = await getCurrentUser();
    if (user) redirect(searchParams.next || "/orders");
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-mango-700 hover:gap-2 transition-all mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> হোমে ফিরুন
        </Link>

        <div className="glass rounded-3xl p-8 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🥭</span>
            <span className="font-display text-lg font-bold">
              Chapai <span className="shimmer-text">Mango</span> House
            </span>
          </div>
          <h1 className="font-display-bn text-2xl font-bold mt-4">
            স্বাগতম! সাইন ইন করুন
          </h1>
          <p className="text-sm text-ink/60 mt-1 mb-6">
            অর্ডার করতে এবং অর্ডার হিস্টরি দেখতে সাইন ইন করুন।
          </p>

          {configured ? (
            <LoginForm />
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-mango-400 bg-mango-50 p-5 text-sm text-ink/70">
              Supabase কনফিগার করা হয়নি — সাইট অ্যাডমিন হলে{" "}
              <code>.env.local</code>-এ Supabase URL ও anon key বসান।
            </div>
          )}
        </div>

        <p className="text-center text-sm text-ink/60 mt-5">
          নতুন ব্যবহারকারী?{" "}
          <Link
            href={`/signup${
              searchParams.next ? `?next=${searchParams.next}` : ""
            }`}
            className="font-semibold text-mango-700 hover:underline"
          >
            সাইন আপ করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
