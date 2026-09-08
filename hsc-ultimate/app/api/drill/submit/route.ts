// ===================================================================
// Timed Drill জমা দেওয়ার API — সার্ভার সাইডে সঠিক উত্তরের সাথে মিলিয়ে
// স্কোর হিসাব করা হয় (ক্লায়েন্টকে বিশ্বাস করা হয় না)
// POST /api/drill/submit
// Body: {
//   subjectId, timeTakenSec,
//   answers: [{ questionId, userAnswer }]  // শুধু যে প্রশ্নগুলোতে উত্তর
//                                           // দেওয়া হয়েছে (টাইম শেষ হওয়ার
//                                           // আগে যতগুলো পারা গেছে)
// }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streak";
import { syncUserLevel, checkAndAwardBadges } from "@/lib/gamification";
import { awardXp } from "@/lib/league";
import { markUserActive } from "@/lib/live-activity";
import {
  XP_PER_CORRECT_ANSWER,
  SPEED_BONUS_XP,
  SPEED_BONUS_ACCURACY_THRESHOLD,
} from "@/lib/drill-practice";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { subjectId, timeTakenSec, answers } = body as {
    subjectId: string;
    timeTakenSec: number;
    answers: { questionId: string; userAnswer: string }[];
  };

  if (!subjectId) {
    return NextResponse.json({ error: "subjectId দিন" }, { status: 400 });
  }
  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json(
      { error: "টাইম শেষ হওয়ার আগে কোনো উত্তর দেওয়া হয়নি" },
      { status: 400 }
    );
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
  const accuracyPct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const speedBonusEarned = accuracyPct >= SPEED_BONUS_ACCURACY_THRESHOLD;
  const xpEarned = correctCount * XP_PER_CORRECT_ANSWER + (speedBonusEarned ? SPEED_BONUS_XP : 0);

  // quizType="drill", chapterId=null (একাধিক চ্যাপ্টার থেকে প্রশ্ন আসে,
  // Smart/Adaptive Practice এর subjectId=null প্যাটার্নের বিপরীত — এখানে
  // subjectId থাকে কারণ ইউজার নিজে সাবজেক্ট বেছে নেয়)
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      subjectId,
      chapterId: null,
      quizType: "drill",
      score: correctCount,
      totalMarks: totalQuestions,
      totalQuestions,
      timeTakenSec: timeTakenSec ?? 0,
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
    accuracyPct,
    speedBonusEarned,
    xpEarned,
    newBadges: newBadges.map((b) => ({ code: b.code, name: b.name, iconEmoji: b.iconEmoji })),
  });
}
