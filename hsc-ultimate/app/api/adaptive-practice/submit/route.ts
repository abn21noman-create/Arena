// ===================================================================
// Adaptive Practice জমা দেওয়া — সার্ভার-সাইড স্কোরিং, XP/Streak/Badge সিঙ্ক
// POST /api/adaptive-practice/submit
// Body: { timeTakenSec, answers: [{ questionId, userAnswer }] }
// -------------------------------------------------------------------
// app/api/practice/submit/route.ts এর প্যাটার্ন হুবহু অনুসরণ করে, শুধু
// subjectId=null (মিশ্র সাবজেক্টের প্রশ্ন থাকতে পারে) ও quizType="adaptive"
// দিয়ে QuizAttempt রেকর্ড তৈরি করে — বিদ্যমান Analytics/GPA/Badge লজিক
// স্বয়ংক্রিয়ভাবে এই attempt গুলোও গণনা করবে (কোনো আলাদা কোড লাগবে না)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streak";
import { syncUserLevel, checkAndAwardBadges } from "@/lib/gamification";
import { awardXp } from "@/lib/league";
import { normalizeConfidence } from "@/lib/confidence";
import { markUserActive } from "@/lib/live-activity";

const XP_PER_CORRECT_ANSWER = 5;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { timeTakenSec, answers } = body as {
    timeTakenSec?: number;
    answers?: { questionId: string; userAnswer: string; confidence?: unknown }[];
  };

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
    return {
      questionId: a.questionId,
      userAnswer: a.userAnswer,
      isCorrect,
      confidence: normalizeConfidence(a.confidence),
    };
  });

  const totalQuestions = answers.length;
  const xpEarned = correctCount * XP_PER_CORRECT_ANSWER;

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      subjectId: null,
      chapterId: null,
      quizType: "adaptive",
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
    xpEarned,
    newBadges: newBadges.map((b) => ({ code: b.code, name: b.name, iconEmoji: b.iconEmoji })),
  });
}
