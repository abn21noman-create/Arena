// ===================================================================
// Live Exam — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { CustomQuestionSetDashboard } from "@/components/live-exam/custom-question-set-dashboard";

export default async function LiveExamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="Live"
      titleBn="Exam"
      subtitle="AI-generated custom question sets — ছবি থেকে MCQ/CQ জেনারেট করো"
      iconKey="Sparkles"
      iconGradient="from-emerald-500 via-teal-500 to-cyan-500"
      badge="AI-Powered"
    >
      <CustomQuestionSetDashboard />
    </PageShell>
  );
}
