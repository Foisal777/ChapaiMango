"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, isLocale, LOCALE_COOKIE, type Dictionary, type Locale } from "@/lib/i18n";

type LocaleCtx = {
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
};

const Ctx = createContext<LocaleCtx>({ locale: "bn", t: getDictionary("bn"), setLocale: () => {} });

export function LocaleProvider({ initial, children }: { initial: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initial);

  // On first mount, a previously saved localStorage preference wins
  // if the cookie wasn't there (e.g. first visit on a new browser).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_COOKIE);
      if (isLocale(saved) && saved !== initial) {
        document.cookie = `${LOCALE_COOKIE}=${saved}; path=/; max-age=31536000; samesite=lax`;
        setLocaleState(saved);
        router.refresh();
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_COOKIE, l);
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = l === "en" ? "en" : "bn";
    } catch { /* ignore */ }
    // Server components read the cookie — refresh re-renders them
    // in the newly chosen language.
    router.refresh();
  }, [router]);

  return <Ctx.Provider value={{ locale, t: getDictionary(locale), setLocale }}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  return useContext(Ctx);
}
