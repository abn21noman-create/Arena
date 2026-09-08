// ===================================================================
// Room code দিয়ে Quiz Battle এ যোগ দেওয়া
// POST /api/quiz-battle/join
// Body: { roomCode: string }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { joinQuizBattle } from "@/lib/quiz-battle";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { roomCode } = body as { roomCode?: string };

  if (!roomCode?.trim()) {
    return NextResponse.json({ error: "রুম কোড দিতে হবে" }, { status: 400 });
  }

  try {
    const battle = await joinQuizBattle(roomCode, session.user.id);
    return NextResponse.json({ battle });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Battle এ যোগ দেওয়া যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
