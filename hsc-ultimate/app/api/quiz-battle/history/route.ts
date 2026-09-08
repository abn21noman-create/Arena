// ===================================================================
// আমার Quiz Battle history (rank/score সহ)
// GET /api/quiz-battle/history
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMyBattleHistory } from "@/lib/quiz-battle";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const history = await getMyBattleHistory(session.user.id);
  return NextResponse.json({ history });
}
