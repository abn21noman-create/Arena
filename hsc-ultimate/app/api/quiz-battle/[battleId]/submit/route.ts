// ===================================================================
// Quiz Battle এ নিজের উত্তর জমা দেওয়া (self-paced — অন্যদের অপেক্ষা লাগে না)
// POST /api/quiz-battle/[battleId]/submit
// Body: { answers: { questionId: answer }, timeTakenSec }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitBattleAnswers } from "@/lib/quiz-battle";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ battleId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { battleId } = await params;
  const body = await req.json().catch(() => ({}));
  const { answers, timeTakenSec } = body as { answers?: Record<string, string>; timeTakenSec?: number };

  try {
    const result = await submitBattleAnswers({
      battleId,
      userId: session.user.id,
      answers: answers ?? {},
      timeTakenSec: timeTakenSec ?? 0,
    });
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "উত্তর জমা দেওয়া যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
