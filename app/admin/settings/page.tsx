import PageHeader from "@/components/admin/PageHeader";
import { getSiteSettings } from "@/lib/settings";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

/**
 * Operator control panel for everything that used to live in Railway env
 * vars: brand text, contact + map, social links, delivery rules, payment
 * methods/numbers/advance, bank account, homepage hero and SEO tokens.
 */
export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader
        title="Site Settings"
        subtitle={
          isSupabaseConfigured()
            ? "Website er sob text, contact, delivery ar payment — ekhan theke change korun."
            : "Supabase configure kora nei — ekhon default value dekhacche, save kora jabe na."
        }
      />
      <SettingsForm initial={settings} />
    </>
  );
}
