// ===================================================================
// Live Exam এর প্রশ্নপত্র লোড করা (correctAnswer বাদ দিয়ে)
// GET /api/live-exam/[sessionId]/questions
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLiveExamQuestions } from "@/lib/live-exam";

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
    const questions = await getLiveExamQuestions(sessionId, session.user.id);
    return NextResponse.json({ questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "প্রশ্ন পাওয়া যায়নি";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
