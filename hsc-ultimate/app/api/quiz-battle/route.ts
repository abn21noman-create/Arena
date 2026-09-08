// ===================================================================
// Quiz Battle — নতুন Battle তৈরি + আমার তৈরি করা Battle লিস্ট
// POST /api/quiz-battle  -> নতুন room তৈরি
// Body: { title, sourceType, subjectId?, customSetId?, maxPlayers? }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createQuizBattle } from "@/lib/quiz-battle";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, sourceType, subjectId, customSetId, maxPlayers } = body as {
    title?: string;
    sourceType?: "custom" | "question_bank";
    subjectId?: string;
    customSetId?: string;
    maxPlayers?: number;
  };

  if (sourceType !== "custom" && sourceType !== "question_bank") {
    return NextResponse.json({ error: "sourceType সঠিক দিতে হবে" }, { status: 400 });
  }

  try {
    const battle = await createQuizBattle({
      ownerId: session.user.id,
      title: title ?? "Quiz Battle",
      sourceType,
      subjectId,
      customSetId,
      maxPlayers,
    });
    return NextResponse.json({ battle }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Battle তৈরি করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
