// ===================================================================
// Quiz Battle Room পেজ (Server Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { QuizBattleRoom } from "@/components/quiz-battle/quiz-battle-room";

export default async function QuizBattleRoomPage({
  params,
}: {
  params: Promise<{ battleId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { battleId } = await params;
  return <QuizBattleRoom battleId={battleId} currentUserId={session.user.id} />;
}
