// ===================================================================
// Quiz Battle History পেজ (Server Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { QuizBattleHistory } from "@/components/quiz-battle/quiz-battle-history";

export default async function QuizBattleHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <QuizBattleHistory />;
}
