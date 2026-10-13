import { FileText } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { fetchRefundPolicy } from "@/lib/admin/data";
import RefundPolicyEditor from "./RefundPolicyEditor";

export const dynamic = "force-dynamic";

/**
 * Edit the public /refund page content. Markdown-only — keeps
 * the storage shape simple and the page renders safely on every
 * device. The /refund page revalidates as soon as the policy is
 * saved here.
 */
export default async function AdminRefundPolicyPage() {
  const policy = await fetchRefundPolicy();

  return (
    <>
      <PageHeader
        title="Refund Policy"
        subtitle="Public page — /refund"
        actions={
          <Link
            href="/refund"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-mango-200 bg-white px-4 py-2 text-xs font-semibold text-mango-700 hover:bg-mango-50"
          >
            <FileText className="h-3.5 w-3.5" />
            View live page
          </Link>
        }
      />

      <RefundPolicyEditor
        initialBody={policy?.body_md ?? ""}
        updatedAt={policy?.updated_at ?? ""}
      />
    </>
  );
}
