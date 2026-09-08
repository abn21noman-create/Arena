// ===================================================================
// Live Exam শুরু করা
// POST /api/live-exam/start
// Body: { sourceType: "custom"|"question_bank", questionType: "MCQ"|"CQ",
//         customSetId?, subjectId?, questionCount?, durationMinutes }
// -------------------------------------------------------------------
// 🔧 সম্প্রসারণ (এই সেশনে): নতুন `questionType` ফিল্ড যোগ হয়েছে (MCQ/CQ)
// — established শুধু MCQ সাপোর্ট করত। backward-compat: `questionType`
// না পাঠালে `"MCQ"` ধরে নেওয়া হয় (established পুরনো ফ্রন্টএন্ড কোড
// ভাঙবে না)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { startLiveExam } from "@/lib/live-exam";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { sourceType, questionType, customSetId, subjectId, questionCount, durationMinutes } = body as {
    sourceType?: "custom" | "question_bank";
    questionType?: "MCQ" | "CQ";
    customSetId?: string;
    subjectId?: string;
    questionCount?: number;
    durationMinutes?: number;
  };

  if (sourceType !== "custom" && sourceType !== "question_bank") {
    return NextResponse.json({ error: "sourceType সঠিক দিতে হবে" }, { status: 400 });
  }
  const finalQuestionType: "MCQ" | "CQ" = questionType === "CQ" ? "CQ" : "MCQ";
  if (!durationMinutes || durationMinutes <= 0) {
    return NextResponse.json({ error: "সময়সীমা দিতে হবে" }, { status: 400 });
  }

  try {
    const liveExam = await startLiveExam({
      userId: session.user.id,
      sourceType,
      questionType: finalQuestionType,
      customSetId,
      subjectId,
      questionCount,
      durationMinutes,
    });
    return NextResponse.json({ liveExam }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Live Exam শুরু করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

