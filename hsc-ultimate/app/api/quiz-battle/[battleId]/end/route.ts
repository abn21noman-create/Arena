// ===================================================================
// Quiz Battle শেষ করা (শুধু owner) — ACTIVE → COMPLETED, বিজয়ীকে বোনাস XP
// POST /api/quiz-battle/[battleId]/end
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { endQuizBattle } from "@/lib/quiz-battle";

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
    const battle = await endQuizBattle(battleId, session.user.id);
    return NextResponse.json({ battle });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Battle শেষ করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
