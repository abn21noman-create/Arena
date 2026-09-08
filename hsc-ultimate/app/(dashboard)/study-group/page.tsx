// ===================================================================
// Study Group — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { StudyGroupDashboard } from "@/components/study-group/study-group-dashboard";

export default async function StudyGroupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="Study"
      titleBn="Group"
      subtitle="Party up — accountability mechanic, weekly goals, shared progress"
      iconKey="Users"
      iconGradient="from-emerald-500 via-teal-500 to-cyan-500"
      badge="Together"
    >
      <StudyGroupDashboard />
    </PageShell>
  );
}
