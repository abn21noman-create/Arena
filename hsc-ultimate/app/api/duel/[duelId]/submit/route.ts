// ===================================================================
// Duel এর MCQ উত্তর জমা দেওয়া (সার্ভার-সাইড স্কোরিং)
// POST /api/duel/[duelId]/submit
// Body: { answers: Record<questionId, userAnswer>, timeTakenSec: number }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitDuelAnswers } from "@/lib/quiz-duel";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ duelId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { duelId } = await params;
  const body = await req.json().catch(() => ({}));
  const { answers, timeTakenSec } = body as {
    answers: Record<string, string>;
    timeTakenSec: number;
  };

  try {
    const duel = await submitDuelAnswers({
      duelId,
      userId: session.user.id,
      answers: answers ?? {},
      timeTakenSec: timeTakenSec ?? 0,
    });
    return NextResponse.json({ duel });
  } catch (err) {
    const message = err instanceof Error ? err.message : "জমা দেওয়া যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
