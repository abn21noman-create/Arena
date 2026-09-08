// ===================================================================
// Timed Drill — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { DrillIntro } from "@/components/practice/drill-intro";

export default async function DrillPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="Timed"
      titleBn="Drill"
      subtitle="Race the clock — দ্রুত প্রশ্নের উত্তর দাও, speed build করো"
      iconKey="Zap"
      iconGradient="from-amber-500 via-orange-500 to-red-500"
      badge="Speed"
    >
      <DrillIntro />
    </PageShell>
  );
}
