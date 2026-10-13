"use client";

import { createContext, useContext } from "react";
import type { SiteSettings } from "@/lib/settings-schema";

/**
 * Makes the operator-managed site settings available to any client
 * component. The root layout resolves settings on the server and passes
 * them here, so client components never need their own fetch and the
 * values are present on first render (no flash of default content).
 */
const SettingsContext = createContext<SiteSettings | null>(null);

export function SettingsProvider({
  value,
  children
}: {
  value: SiteSettings;
  children: React.ReactNode;
}) {
  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SiteSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside <SettingsProvider>");
  }
  return ctx;
}
