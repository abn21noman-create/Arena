// ===================================================================
// Adaptive Practice — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { AdaptivePracticeIntro } from "@/components/practice/adaptive-practice-intro";

export default async function AdaptivePracticePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="Smart"
      titleBn="Practice"
      subtitle="AI analyzes your weak topics — targeted questions, mastery tracking"
      iconKey="Brain"
      iconGradient="from-violet-500 via-purple-500 to-fuchsia-500"
      badge="DATA-DRIVEN"
    >
      <AdaptivePracticeIntro />
    </PageShell>
  );
}
