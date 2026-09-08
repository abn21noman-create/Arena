// ===================================================================
// Mock Exam এর MCQ অংশ জমা দেওয়া — সার্ভার সাইডে স্কোরিং
// POST /api/mock-exam/[attemptId]/submit-mcq
// Body: { answers: [{ questionId, userAnswer }], timeTakenSec }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { attemptId } = await params;
  const attempt = await prisma.mockExamAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "পরীক্ষা পাওয়া যায়নি" }, { status: 404 });
  }

  if (attempt.status !== "IN_PROGRESS") {
    return NextResponse.json(
      { error: "এই পরীক্ষার MCQ অংশ ইতিমধ্যে জমা হয়ে গেছে" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { answers, timeTakenSec } = body as {
    answers: { questionId: string; userAnswer: string }[];
    timeTakenSec: number;
  };

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // Numeric/Enum/Date Validation এর একই "input validation
  // consistency" ক্লাস — এবার array ইনপুট): আগে `answers` যে সত্যিই
  // একটা array কিনা তা যাচাই করা হতো না, সরাসরি `for (const a of
  // answers ?? [])` দিয়ে iterate করা হতো। `answers` যদি number/plain
  // object (non-iterable) হয়, জাভাস্ক্রিপ্ট `TypeError: ... is not
  // iterable` throw করে, যেটা unhandled থেকে ৫০০ crash হয়ে যেত (৪০০
  // Bad Request হওয়া উচিত ছিল)। লাইভ টেস্টে number ও plain object
  // উভয় ইনপুটেই crash প্রমাণিত হয়েছে। ফিক্স: `Array.isArray()` দিয়ে
  // iterate করার আগেই ভ্যালিডেট করা।
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: "সঠিক answers array দিন" }, { status: 400 });
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: (attempt.mcqQuestionIds as string[]) } },
  });
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let correctCount = 0;
  const userAnswersMap: Record<string, string> = {};
  for (const a of answers ?? []) {
    const q = questionMap.get(a.questionId);
    userAnswersMap[a.questionId] = a.userAnswer;
    if (q && q.correctAnswer === a.userAnswer) correctCount++;
  }

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত, Task/StudyPlanItem/
  // QuizBattle/QuizDuel/ContentReport এর একই race-condition ক্লাস): আগে
  // উপরের `attempt.status !== "IN_PROGRESS"` চেক শুধু read-then-write
  // প্যাটার্নে ছিল — লাইভ concurrency টেস্টে একই attempt এ ৩টা concurrent
  // submit-mcq request পাঠিয়ে ৩টাই সফল হয়েছে (প্রত্যাশিত ১টা)। ফিক্স:
  // single atomic `updateMany({ where: { id, status: "IN_PROGRESS" } })`
  // স্টেটমেন্ট দিয়ে check+set একসাথে করা হয়েছে।
  const claimResult = await prisma.mockExamAttempt.updateMany({
    where: { id: attemptId, status: "IN_PROGRESS" },
    data: {
      mcqScore: correctCount,
      mcqUserAnswers: userAnswersMap,
      status: "MCQ_DONE",
      timeTakenSec: (attempt.timeTakenSec ?? 0) + (timeTakenSec ?? 0),
    },
  });

  if (claimResult.count === 0) {
    return NextResponse.json(
      { error: "এই পরীক্ষার MCQ অংশ ইতিমধ্যে জমা হয়ে গেছে" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    mcqScore: correctCount,
    mcqTotal: attempt.mcqTotal,
  });
}

