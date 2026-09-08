// ===================================================================
// Notification Center — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { NotificationCenter } from "@/components/notifications/notification-center";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="Notification"
      titleBn="Center"
      subtitle="সব নোটিফিকেশনের পূর্ণাঙ্গ ইতিহাস"
      iconKey="Bell"
      iconGradient="from-amber-500 via-orange-500 to-rose-500"
      badge="Inbox"
    >
      <NotificationCenter />
    </PageShell>
  );
}
