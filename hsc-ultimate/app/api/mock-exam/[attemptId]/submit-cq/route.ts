// ===================================================================
// Mock Exam এর CQ অংশ জমা দেওয়া — প্রতিটা CQ AI দিয়ে মূল্যায়ন করে
// পুরো পরীক্ষা সম্পন্ন করে (status COMPLETED)
// POST /api/mock-exam/[attemptId]/submit-cq
// Body: {
//   answers: [{ cqQuestionId, answerA, answerB, answerC, answerD }],
//   timeTakenSec
// }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateCQAnswer } from "@/lib/cq-evaluator";
import { updateStreak } from "@/lib/streak";
import { syncUserLevel, checkAndAwardBadges } from "@/lib/gamification";
import { createNotification } from "@/lib/notifications";
import { awardXp } from "@/lib/league";

// MCQ প্রতি সঠিক উত্তরে ২ XP, CQ প্রতি নম্বরে ২ XP (mock exam সম্পূর্ণ করাটা
// normal practice এর চেয়ে বেশি গুরুত্বপূর্ণ বলে একটু বেশি XP দেওয়া হয়)
const XP_PER_MCQ_CORRECT = 2;
const XP_PER_CQ_MARK = 2;

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

  const body = await req.json().catch(() => ({}));
  const { answers, timeTakenSec } = body as {
    answers: {
      cqQuestionId: string;
      answerA: string;
      answerB: string;
      answerC: string;
      answerD: string;
    }[];
    timeTakenSec: number;
  };

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // submit-mcq এর একই array-validation-missing প্যাটার্ন): `answers`
  // সত্যিই array কিনা যাচাই না করেই `for (const a of answers ?? [])`
  // দিয়ে iterate করা হতো — non-iterable ইনপুট (number/plain object)
  // দিলে `TypeError: ... is not iterable` throw করে ৫০০ crash করতো।
  // এই ভ্যালিডেশন ইচ্ছাকৃতভাবে নিচের atomic status-claim এর **আগে**
  // রাখা হয়েছে — নাহলে invalid answers দিয়ে দিলে exam status
  // "COMPLETED" এ আটকে যেত (broken/unrecoverable state, কোনো score
  // কখনো প্রসেস না হয়েই) কারণ দ্বিতীয়বার submit করার চেষ্টা করলেও
  // "ইতিমধ্যে সম্পন্ন হয়ে গেছে" এরর পেয়ে যেত।
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: "সঠিক answers array দিন" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত, Task/StudyPlanItem/
  // QuizBattle/QuizDuel/ContentReport এর একই race-condition ক্লাস, কিন্তু
  // এখানে আরও বেশি গুরুতর কারণ ব্যয়বহুল AI evaluation call ও XP award দুটোই
  // জড়িত): আগে `attempt.status === "COMPLETED"` চেক শুধু read-then-write
  // প্যাটার্নে ছিল, এবং প্রকৃত status update হতো handler এর শেষে (সব CQ
  // evaluate করে, XP দেওয়ার পরে) — অর্থাৎ পুরো ব্যয়বহুল কাজটাই vulnerable
  // window এর ভেতরে ছিল। লাইভ concurrency টেস্টে ৩টা concurrent submit-cq
  // request পাঠিয়ে ৩টাই সফল হয়েছে, প্রতিটা প্রশ্নে ৩টা করে (২টা প্রশ্নে
  // মোট ৬টা) `CQAttempt` রো তৈরি হয়েছে (প্রত্যাশিত ২টা) — অ-শূন্য স্কোরের
  // ক্ষেত্রে এটা duplicate AI API cost ও duplicate XP award ঘটাতো। ফিক্স:
  // যেকোনো ব্যয়বহুল কাজ শুরুর **আগেই** single atomic
  // `updateMany({ where: { id, status: { not: "COMPLETED" } } })` দিয়ে
  // status="COMPLETED" এ transition claim করা হয় (placeholder, চূড়ান্ত
  // score পরে আসল `update()` কলে বসে) — শুধু matched (count>0) request-ই
  // AI evaluation loop চালানোর অনুমতি পায়, বাকিরা সাথে সাথে ৪০০ error
  // পায় (কোনো AI call/CQAttempt create হওয়ার আগেই ব্লক হয়ে যায়)।
  const claimResult = await prisma.mockExamAttempt.updateMany({
    where: { id: attemptId, status: { not: "COMPLETED" } },
    data: { status: "COMPLETED" },
  });

  if (claimResult.count === 0) {
    return NextResponse.json(
      { error: "এই পরীক্ষা ইতিমধ্যে সম্পন্ন হয়ে গেছে" },
      { status: 400 }
    );
  }

  const cqQuestions = await prisma.cQQuestion.findMany({
    where: { id: { in: (attempt.cqQuestionIds as string[]) } },
  });
  const cqMap = new Map(cqQuestions.map((q) => [q.id, q]));

  let totalCqScore = 0;

  // প্রতিটা CQ আলাদাভাবে AI দিয়ে মূল্যায়ন করা হচ্ছে (sequential — rate limit এড়াতে)
  for (const a of answers ?? []) {
    const cq = cqMap.get(a.cqQuestionId);
    if (!cq) continue;

    if (!a.answerA?.trim() && !a.answerB?.trim() && !a.answerC?.trim() && !a.answerD?.trim()) {
      // খালি উত্তর হলে AI কল না করে সরাসরি ০ দেওয়া হচ্ছে (খরচ ও সময় বাঁচাতে)
      await prisma.cQAttempt.create({
        data: {
          userId: session.user.id,
          cqQuestionId: a.cqQuestionId,
          answerA: "",
          answerB: "",
          answerC: "",
          answerD: "",
          scoreA: 0,
          scoreB: 0,
          scoreC: 0,
          scoreD: 0,
          totalScore: 0,
          feedback: "কোনো উত্তর দেওয়া হয়নি।",
          aiProvider: "none",
        },
      });
      continue;
    }

    try {
      const evaluation = await evaluateCQAnswer({
        stimulus: cq.stimulus,
        questionA: cq.questionA,
        questionB: cq.questionB,
        questionC: cq.questionC,
        questionD: cq.questionD,
        modelAnswerA: cq.modelAnswerA,
        modelAnswerB: cq.modelAnswerB,
        modelAnswerC: cq.modelAnswerC,
        modelAnswerD: cq.modelAnswerD,
        answerA: a.answerA ?? "",
        answerB: a.answerB ?? "",
        answerC: a.answerC ?? "",
        answerD: a.answerD ?? "",
      });

      await prisma.cQAttempt.create({
        data: {
          userId: session.user.id,
          cqQuestionId: a.cqQuestionId,
          answerA: a.answerA ?? "",
          answerB: a.answerB ?? "",
          answerC: a.answerC ?? "",
          answerD: a.answerD ?? "",
          scoreA: evaluation.scoreA,
          scoreB: evaluation.scoreB,
          scoreC: evaluation.scoreC,
          scoreD: evaluation.scoreD,
          totalScore: evaluation.totalScore,
          feedback: evaluation.feedback,
          aiProvider: evaluation.provider,
        },
      });

      totalCqScore += evaluation.totalScore;
    } catch (err) {
      console.error("Mock Exam CQ Evaluation Error:", err);
      // একটা CQ evaluate করতে ব্যর্থ হলেও বাকিগুলো চালিয়ে যাওয়া হচ্ছে
    }
  }

  const finalTimeTaken = (attempt.timeTakenSec ?? 0) + (timeTakenSec ?? 0);

  const updatedAttempt = await prisma.mockExamAttempt.update({
    where: { id: attemptId },
    data: {
      cqScore: totalCqScore,
      status: "COMPLETED",
      timeTakenSec: finalTimeTaken,
      completedAt: new Date(),
    },
  });

  // XP হিসাব ও gamification সিঙ্ক
  const xpEarned =
    attempt.mcqScore * XP_PER_MCQ_CORRECT + totalCqScore * XP_PER_CQ_MARK;

  await awardXp(session.user.id, xpEarned);

  await updateStreak(session.user.id);
  await syncUserLevel(session.user.id);
  const newBadges = await checkAndAwardBadges(session.user.id);

  const totalScore = attempt.mcqScore + totalCqScore;
  const totalMarks = attempt.mcqTotal + attempt.cqTotal;

  await createNotification({
    userId: session.user.id,
    title: "📝 Mock Exam সম্পন্ন হয়েছে!",
    body: `স্কোর: ${totalScore}/${totalMarks} (${Math.round((totalScore / totalMarks) * 100)}%)`,
    link: `/mock-exam/result/${attemptId}`,
  });

  return NextResponse.json({
    attemptId: updatedAttempt.id,
    mcqScore: attempt.mcqScore,
    mcqTotal: attempt.mcqTotal,
    cqScore: totalCqScore,
    cqTotal: attempt.cqTotal,
    totalScore,
    totalMarks,
    xpEarned,
    newBadges: newBadges.map((b) => ({
      code: b.code,
      name: b.name,
      iconEmoji: b.iconEmoji,
    })),
  });
}
