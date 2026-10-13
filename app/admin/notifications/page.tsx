import { Bell } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { fetchPushSubscriberCount } from "@/lib/admin/data";
import SendPushForm from "./SendPushForm";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const count = await fetchPushSubscriberCount();
  const vapidConfigured = Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  );

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={`Push to ${count} subscribed device${
          count === 1 ? "" : "s"
        }`}
      />

      {!vapidConfigured && (
        <div className="glass rounded-2xl p-5 mb-6 border-2 border-amber-300 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-amber-700 mt-0.5" />
            <div className="text-sm text-amber-900 leading-relaxed">
              <strong>VAPID keys are not configured.</strong> Generate a key
              pair (e.g. with{" "}
              <code className="bg-amber-100 px-1 rounded">
                npx web-push generate-vapid-keys
              </code>
              ) and set{" "}
              <code className="bg-amber-100 px-1 rounded">
                NEXT_PUBLIC_VAPID_PUBLIC_KEY
              </code>
              ,{" "}
              <code className="bg-amber-100 px-1 rounded">
                VAPID_PRIVATE_KEY
              </code>{" "}
              and{" "}
              <code className="bg-amber-100 px-1 rounded">VAPID_SUBJECT</code>{" "}
              in Railway env. Until then SubscribeButton is hidden everywhere
              and broadcasts will fail.
            </div>
          </div>
        </div>
      )}

      <SendPushForm subscriberCount={count} />
    </>
  );
}
