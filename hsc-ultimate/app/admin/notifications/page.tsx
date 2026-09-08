// ===================================================================
// Admin Notification Broadcast পেজ (Server Component wrapper)
// ===================================================================
import { NotificationBroadcastForm } from "@/components/admin/notification-broadcast-form";
import { WeeklyDigestTrigger } from "@/components/admin/weekly-digest-trigger";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-8">
      <NotificationBroadcastForm />
      <WeeklyDigestTrigger />
    </div>
  );
}
