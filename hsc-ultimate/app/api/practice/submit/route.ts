// ===================================================================
// Practice Quiz জমা দেওয়ার API — সার্ভার সাইডে সঠিক উত্তরের সাথে মিলিয়ে
// স্কোর হিসাব করা হয় (ক্লায়েন্টকে বিশ্বাস করা হয় না, নিরাপত্তার জন্য)
// POST /api/practice/submit
// Body: {
//   subjectId, chapterId, timeTakenSec,
//   answers: [{ questionId, userAnswer }]
// }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streak";
import { syncUserLevel, checkAndAwardBadges } from "@/lib/gamification";
import { awardXp } from "@/lib/league";
import { normalizeConfidence } from "@/lib/confidence";
import { markUserActive } from "@/lib/live-activity";

// প্রতিটা সঠিক উত্তরে XP
const XP_PER_CORRECT_ANSWER = 5;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { subjectId, chapterId, timeTakenSec, answers } = body as {
    subjectId: string;
    chapterId: string;
    timeTakenSec: number;
    answers: { questionId: string; userAnswer: string; confidence?: unknown }[];
  };

  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "কোনো উত্তর পাওয়া যায়নি" }, { status: 400 });
  }

  // ডাটাবেজ থেকে আসল প্রশ্ন ও সঠিক উত্তর নিয়ে আসা হচ্ছে
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
    // Confidence-Based Answering — ঐচ্ছিক, ইউজার না দিলে null থাকবে
    return {
      questionId: a.questionId,
      userAnswer: a.userAnswer,
      isCorrect,
      confidence: normalizeConfidence(a.confidence),
    };
  });

  const totalQuestions = answers.length;
  const xpEarned = correctCount * XP_PER_CORRECT_ANSWER;

  // QuizAttempt + সব উত্তর একসাথে সেভ করা হচ্ছে (nested write, কম round-trip)
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      subjectId,
      chapterId,
      quizType: "practice",
      score: correctCount,
      totalMarks: totalQuestions,
      totalQuestions,
      timeTakenSec: timeTakenSec ?? 0,
      answers: {
        create: gradedAnswers,
      },
    },
  });

  // ইউজারের XP বাড়ানো হচ্ছে
  await awardXp(session.user.id, xpEarned);

  // Streak, Level, Badge সিঙ্ক করা হচ্ছে (quiz দেওয়াটাও একটা "একটিভিটি")
  await updateStreak(session.user.id);
  await syncUserLevel(session.user.id);
  const newBadges = await checkAndAwardBadges(session.user.id);
  // 🆕 Live Study Leaderboard heartbeat (non-critical side-effect)
  await markUserActive(session.user.id, "PRACTICE").catch(() => {});

  return NextResponse.json({
    attemptId: attempt.id,
    score: correctCount,
    total: totalQuestions,
    xpEarned,
    newBadges: newBadges.map((b) => ({ code: b.code, name: b.name, iconEmoji: b.iconEmoji })),
  });
}
