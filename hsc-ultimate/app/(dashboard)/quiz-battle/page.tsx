// ===================================================================
// Quiz Battle — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { QuizBattleHome } from "@/components/quiz-battle/quiz-battle-home";

export default async function QuizBattleHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="Quiz"
      titleBn="Battle"
      subtitle="Room code দিয়ে ৩০+ জনের সাথে self-paced MCQ প্রতিযোগিতা"
      iconKey="Swords"
      iconGradient="from-rose-500 via-pink-500 to-fuchsia-500"
      badge="Multiplayer"
    >
      <QuizBattleHome />
    </PageShell>
  );
}
