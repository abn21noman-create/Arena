// ===================================================================
// মিস্টেক ভল্ট রিভিশন জমা দেওয়ার API — সার্ভার সাইডে সঠিক উত্তরের সাথে
// মিলিয়ে স্কোর হিসাব করা হয় (ক্লায়েন্টকে বিশ্বাস করা হয় না)
// POST /api/mistake-vault/submit
// Body: { answers: [{ questionId, userAnswer }] }
// -------------------------------------------------------------------
// Adaptive/Drill Practice এর established প্যাটার্ন অনুসরণ করে —
// quizType="mistake_vault", subjectId/chapterId=null (মিশ্র সাবজেক্ট/
// চ্যাপ্টারের প্রশ্ন থাকতে পারে)। এই attempt এর নতুন সঠিক উত্তর
// পরের বার getMistakeVaultQuestions() query তে স্বয়ংক্রিয়ভাবে সেই
// প্রশ্নকে ভান্ডার থেকে বাদ দেবে (schema-free ডিজাইন, lib/mistake-vault.ts)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streak";
import { syncUserLevel, checkAndAwardBadges } from "@/lib/gamification";
import { awardXp } from "@/lib/league";
import { markUserActive } from "@/lib/live-activity";
import { MISTAKE_VAULT_QUIZ_TYPE } from "@/lib/mistake-vault";

// রিভিশনে সঠিক উত্তরে সাধারণ Practice এর মতোই +5 XP (একই মান, বিশেষ
// বোনাস না — কারণ এটা "আবার একই প্রশ্ন" তাই over-reward এড়ানো হয়েছে)
const XP_PER_CORRECT_ANSWER = 5;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { answers } = body as { answers: { questionId: string; userAnswer: string }[] };

  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "কোনো উত্তর পাওয়া যায়নি" }, { status: 400 });
  }

  const questionIds = answers.map((a) => a.questionId);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
  });
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let correctCount = 0;
  const gradedAnswers = answers.map((a) => {
    const question = questionMap.get(a.questionId);
    const isCorrect = question ? question.correctAnswer === a.userAnswer : false;
    if (isCorrect) correctCount++;
    return { questionId: a.questionId, userAnswer: a.userAnswer, isCorrect };
  });

  const totalQuestions = answers.length;
  const xpEarned = correctCount * XP_PER_CORRECT_ANSWER;

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      subjectId: null,
      chapterId: null,
      quizType: MISTAKE_VAULT_QUIZ_TYPE,
      score: correctCount,
      totalMarks: totalQuestions,
      totalQuestions,
      timeTakenSec: 0,
      answers: { create: gradedAnswers },
    },
  });

  await awardXp(session.user.id, xpEarned);
  await updateStreak(session.user.id);
  await syncUserLevel(session.user.id);
  const newBadges = await checkAndAwardBadges(session.user.id);
  await markUserActive(session.user.id, "PRACTICE").catch(() => {});

  return NextResponse.json({
    attemptId: attempt.id,
    score: correctCount,
    total: totalQuestions,
    xpEarned,
    newBadges: newBadges.map((b) => ({ code: b.code, name: b.name, iconEmoji: b.iconEmoji })),
  });
}
