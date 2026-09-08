// ===================================================================
// Reading Room — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { ReadingRoomDashboard } from "@/components/reading-room/reading-room-dashboard";

export default async function ReadingRoomPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="Reading"
      titleBn="Room"
      subtitle="Virtual study room with body doubling — সহপাঠীদের সাথে একসাথে পড়ো"
      iconKey="BookOpen"
      iconGradient="from-emerald-500 via-teal-500 to-cyan-500"
      badge="Focus Together"
    >
      <ReadingRoomDashboard />
    </PageShell>
  );
}
