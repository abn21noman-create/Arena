// ===================================================================
// Quiz Battle শুরু করা (শুধু owner) — WAITING → ACTIVE
// POST /api/quiz-battle/[battleId]/start
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { startQuizBattle } from "@/lib/quiz-battle";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ battleId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { battleId } = await params;

  try {
    const battle = await startQuizBattle(battleId, session.user.id);
    return NextResponse.json({ battle });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Battle শুরু করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
