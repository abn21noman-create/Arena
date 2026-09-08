// ===================================================================
// Live Exam এর CQ উত্তর জমা দেওয়া — AI দিয়ে প্রতিটা প্রশ্ন মূল্যায়ন করে
// POST /api/live-exam/[sessionId]/submit-cq
// Body: { answers: [{ questionId, answerA, answerB, answerC, answerD }] }
// -------------------------------------------------------------------
// established `POST /api/mock-exam/[attemptId]/submit-cq` এর একই
// কাঠামো (array validation আগে, atomic status-claim ব্যয়বহুল AI call
// শুরুর আগে) — dual-source (CustomQuestion/CQQuestion) লজিক
// `lib/live-exam.ts` এর `submitLiveExamCq()` এ centralize করা আছে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitLiveExamCq } from "@/lib/live-exam";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { sessionId } = await params;
  const body = await req.json().catch(() => ({}));
  const { answers } = body as {
    answers?: { questionId: string; answerA: string; answerB: string; answerC: string; answerD: string }[];
  };

  // 🐛 বাগ ফিক্স প্যাটার্ন (established Mock Exam submit-cq এর একই
  // array-validation-missing ক্লাস প্রোঅ্যাক্টিভভাবে প্রতিরোধ): `answers`
  // সত্যিই array কিনা এখানেই যাচাই করা হচ্ছে — `lib/live-exam.ts` এর
  // `submitLiveExamCq()` এও ডাবল-চেক আছে (defense-in-depth), কিন্তু
  // এখানে endpoint স্তরে আগে থেকেই ৪০০ দিয়ে দেওয়া ভালো (established
  // Mock Exam এর একই আচরণ)।
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: "সঠিক answers array দিন" }, { status: 400 });
  }

  try {
    const result = await submitLiveExamCq(sessionId, session.user.id, answers);
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "উত্তর জমা দেওয়া যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
