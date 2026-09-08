// ===================================================================
// Quiz Battle বিস্তারিত অবস্থা + leaderboard (polling endpoint)
// GET /api/quiz-battle/[battleId]
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBattleDetail } from "@/lib/quiz-battle";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ battleId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { battleId } = await params;

  let battle;
  try {
    battle = await getBattleDetail(battleId, session.user.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "অ্যাক্সেস নেই";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  if (!battle) {
    return NextResponse.json({ error: "Battle পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ battle });
}
