// ===================================================================
// CQ উত্তর জমা দেওয়ার API — AI দিয়ে মূল্যায়ন করে নম্বর ও ফিডব্যাক দেয়
// POST /api/cq/[cqQuestionId]/submit
// Body: { answerA, answerB, answerC, answerD }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateCQAnswer } from "@/lib/cq-evaluator";
import { updateStreak } from "@/lib/streak";
import { checkAndAwardBadges } from "@/lib/gamification";
import { awardXp } from "@/lib/league";
import { markUserActive } from "@/lib/live-activity";

// CQ সম্পন্ন করলে XP (প্রাপ্ত নম্বরের ভিত্তিতে, সর্বোচ্চ ১০ নম্বরে ৩০ XP)
const XP_MULTIPLIER = 3;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cqQuestionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { cqQuestionId } = await params;
  const body = await req.json().catch(() => ({}));
  const { answerA, answerB, answerC, answerD } = body;

  if (!answerA?.trim() && !answerB?.trim() && !answerC?.trim() && !answerD?.trim()) {
    return NextResponse.json({ error: "অন্তত একটা উত্তর লিখতে হবে" }, { status: 400 });
  }

  const cqQuestion = await prisma.cQQuestion.findUnique({ where: { id: cqQuestionId } });
  if (!cqQuestion) {
    return NextResponse.json({ error: "প্রশ্ন পাওয়া যায়নি" }, { status: 404 });
  }

  try {
    const evaluation = await evaluateCQAnswer({
      stimulus: cqQuestion.stimulus,
      questionA: cqQuestion.questionA,
      questionB: cqQuestion.questionB,
      questionC: cqQuestion.questionC,
      questionD: cqQuestion.questionD,
      modelAnswerA: cqQuestion.modelAnswerA,
      modelAnswerB: cqQuestion.modelAnswerB,
      modelAnswerC: cqQuestion.modelAnswerC,
      modelAnswerD: cqQuestion.modelAnswerD,
      answerA: answerA ?? "",
      answerB: answerB ?? "",
      answerC: answerC ?? "",
      answerD: answerD ?? "",
    });

    const attempt = await prisma.cQAttempt.create({
      data: {
        userId: session.user.id,
        cqQuestionId,
        answerA: answerA ?? "",
        answerB: answerB ?? "",
        answerC: answerC ?? "",
        answerD: answerD ?? "",
        scoreA: evaluation.scoreA,
        scoreB: evaluation.scoreB,
        scoreC: evaluation.scoreC,
        scoreD: evaluation.scoreD,
        totalScore: evaluation.totalScore,
        feedback: evaluation.feedback,
        aiProvider: evaluation.provider,
      },
    });

    const xpEarned = evaluation.totalScore * XP_MULTIPLIER;
    await awardXp(session.user.id, xpEarned);

    await updateStreak(session.user.id);
    const newBadges = await checkAndAwardBadges(session.user.id);
    await markUserActive(session.user.id, "CQ").catch(() => {});

    return NextResponse.json({
      attemptId: attempt.id,
      totalScore: evaluation.totalScore,
      xpEarned,
      newBadges: newBadges.map((b) => ({ code: b.code, name: b.name, iconEmoji: b.iconEmoji })),
    });
  } catch (err) {
    console.error("CQ Evaluation Error:", err);
    return NextResponse.json(
      { error: "মূল্যায়ন করতে সমস্যা হয়েছে, আবার চেষ্টা করো" },
      { status: 500 }
    );
  }
}
