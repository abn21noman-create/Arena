// ===================================================================
// Duel History API — সম্পন্ন হওয়া Duel এর তালিকা + win/loss/draw stats
// GET /api/duel/history
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMyDuelHistory } from "@/lib/quiz-duel";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const result = await getMyDuelHistory(session.user.id);
  return NextResponse.json(result);
}
