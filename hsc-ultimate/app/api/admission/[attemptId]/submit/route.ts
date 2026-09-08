// ===================================================================
// Admission Mock Test জমা দেওয়া — সার্ভার সাইডে negative marking সহ স্কোরিং
// POST /api/admission/[attemptId]/submit
// Body: { answers: [{ questionId, userAnswer }], timeTakenSec }
// -------------------------------------------------------------------
// নেগেটিভ মার্কিং প্রয়োগ হয় exam type অনুযায়ী কনফিগার করা মান দিয়ে
// (lib/admission.ts এ calculateAdmissionScore())। উত্তর না দেওয়া প্রশ্নে
// কোনো penalty নেই (শুধু ভুল উত্তরে কাটা যায়, বাস্তব ভর্তি পরীক্ষার নিয়ম)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ADMISSION_EXAM_CONFIGS, calculateAdmissionScore } from "@/lib/admission";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { attemptId } = await params;
  const attempt = await prisma.admissionMockAttempt.findUnique({ where: { id: attemptId } });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "পরীক্ষা পাওয়া যায়নি" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { answers, timeTakenSec } = body as {
    answers: { questionId: string; userAnswer: string }[];
    timeTakenSec?: number;
  };

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // Mock Exam submit-mcq/submit-cq এর একই array-validation-missing
  // প্যাটার্ন): `answers` সত্যিই array কিনা যাচাই না করেই `for (const
  // a of answers ?? [])` দিয়ে iterate করা হতো — non-iterable ইনপুট
  // (number/plain object) দিলে `TypeError: ... is not iterable`
  // throw করে ৫০০ crash করতো। এই ভ্যালিডেশন নিচের atomic status-
  // claim এর আগে রাখা হয়েছে (একই কারণে যা Mock Exam CQ ফাইলে
  // ডকুমেন্টেড — নাহলে exam status আটকে যেত কোনো score প্রসেস না
  // হয়েই)।
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: "সঠিক answers array দিন" }, { status: 400 });
  }

  const questionIds = attempt.questionIds as string[];
  const questions = await prisma.admissionQuestion.findMany({
    where: { id: { in: questionIds } },
  });
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let correctCount = 0;
  let wrongCount = 0;
  const userAnswersMap: Record<string, string> = {};

  for (const a of answers ?? []) {
    const q = questionMap.get(a.questionId);
    if (!q || !a.userAnswer) continue; // স্কিপ করা প্রশ্ন গণনায় ধরা হবে না (penalty নেই)
    userAnswersMap[a.questionId] = a.userAnswer;
    if (q.correctAnswer === a.userAnswer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  }

  const config = ADMISSION_EXAM_CONFIGS[attempt.examType];
  const result = calculateAdmissionScore(
    questionIds.length,
    correctCount,
    wrongCount,
    config
  );

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত, Task/StudyPlanItem/
  // QuizBattle/QuizDuel/ContentReport/MockExam এর একই race-condition
  // ক্লাস): আগে উপরে (এই ফাংশনের শুরুতে) `attempt.status !== "IN_PROGRESS"`
  // চেক করা হতো read-then-write প্যাটার্নে (স্কোরিং লজিকের অনেক আগে,
  // আলাদা `update()` কল পরে) — লাইভ concurrency টেস্টে ৩টা concurrent
  // submit request পাঠিয়ে ৩টাই সফল হয়েছে (প্রত্যাশিত ১টা, প্রতিটা stale
  // `status="IN_PROGRESS"` দেখে independently scoring+update করেছে)।
  // ফিক্স: চেকটা সরিয়ে এখানে single atomic `updateMany({ where: { id,
  // status: "IN_PROGRESS" } })` স্টেটমেন্ট দিয়ে check+set একসাথে করা
  // হয়েছে — শুধু matched (count>0) হলেই ফলাফল রিটার্ন হয়।
  const claimResult = await prisma.admissionMockAttempt.updateMany({
    where: { id: attemptId, status: "IN_PROGRESS" },
    data: {
      status: "COMPLETED",
      userAnswers: userAnswersMap,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,
      skippedCount: result.skippedCount,
      rawScore: result.rawScore,
      timeTakenSec: timeTakenSec ?? null,
      completedAt: new Date(),
    },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "এই পরীক্ষা ইতিমধ্যে জমা হয়ে গেছে" }, { status: 400 });
  }

  return NextResponse.json({
    attemptId,
    ...result,
  });
}
