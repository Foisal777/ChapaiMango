"use client";

import { Globe } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

/** বাংলা | EN segmented switch. Persists via cookie + localStorage. */
export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  const options: { code: Locale; label: string }[] = [
    { code: "bn", label: "বাংলা" },
    { code: "en", label: "EN" }
  ];
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-mango-300 bg-white/80 p-1 shadow-soft"
      role="group"
      aria-label={locale === "en" ? "Language" : "ভাষা"}
    >
      {!compact && <Globe className="ml-1.5 h-4 w-4 text-mango-600" aria-hidden />}
      {options.map((o) => (
        <button
          key={o.code}
          type="button"
          onClick={() => setLocale(o.code)}
          aria-pressed={locale === o.code}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold transition-all",
            locale === o.code
              ? "bg-mango-gradient text-ink shadow-glow scale-[1.03]"
              : "text-ink/55 hover:text-mango-700 hover:bg-mango-100"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
