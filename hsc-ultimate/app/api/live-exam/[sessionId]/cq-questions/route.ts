// ===================================================================
// Live Exam এর CQ প্রশ্নপত্র লোড করা (মডেল উত্তর বাদ দিয়ে)
// GET /api/live-exam/[sessionId]/cq-questions
// -------------------------------------------------------------------
// established `GET /api/live-exam/[sessionId]/questions` (MCQ) এর
// counterpart — নতুন Live Exam CQ সাপোর্টের অংশ। dual-source
// (CustomQuestion/CQQuestion) লজিক `lib/live-exam.ts` এর
// `getLiveExamCqQuestions()` এ centralize করা আছে।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLiveExamCqQuestions } from "@/lib/live-exam";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { sessionId } = await params;

  try {
    const cqQuestions = await getLiveExamCqQuestions(sessionId, session.user.id);
    return NextResponse.json({ cqQuestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "প্রশ্ন পাওয়া যায়নি";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
