// ===================================================================
// Live Exam এর সম্পূর্ণ ফলাফল — প্রতিটা প্রশ্নের বিস্তারিত রিভিউ সহ (MCQ+CQ)
// GET /api/live-exam/[sessionId]/result
// -------------------------------------------------------------------
// established Mock Exam Result endpoint (`/api/mock-exam/[attemptId]/
// result`) এর প্যাটার্ন অনুসরণ করে বানানো হয়েছে — প্রতিটা প্রশ্নের
// বিস্তারিত রিটার্ন করে যাতে established Practice/Mock Exam Result
// পেজের মতো পূর্ণাঙ্গ রিভিউ + "AI দিয়ে ব্যাখ্যা বুঝি" বাটন দেখানো যায়।
// dual-source (Subject question bank বনাম CustomQuestionSet) সঠিকভাবে
// হ্যান্ডল করা হয়েছে (established `lib/live-exam.ts` এর dual-source
// চেক প্যাটার্ন অনুসরণ করে)।
//
// 🔧 সম্প্রসারণ (এই সেশনে, Live Exam CQ সাপোর্ট): established শুধু MCQ
// রিভিউ রিটার্ন করত। এখন `liveExam.questionType` চেক করে MCQ হলে
// established MCQ রিভিউ (অপরিবর্তিত), CQ হলে নতুন CQ রিভিউ (উদ্দীপক,
// ক/খ/গ/ঘ প্রশ্ন, মডেল উত্তর, ইউজারের উত্তর, AI স্কোর+ফিডব্যাক)
// রিটার্ন করে।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { sessionId } = await params;
  const liveExam = await prisma.liveExamSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
  });

  if (!liveExam) {
    return NextResponse.json({ error: "সেশন পাওয়া যায়নি" }, { status: 404 });
  }

  if (liveExam.status !== "COMPLETED") {
    return NextResponse.json({ error: "পরীক্ষা এখনো সম্পন্ন হয়নি" }, { status: 400 });
  }

  const questionIds = liveExam.questionIds as string[];

  // custom set হলে displayName (সেটের title) — উভয় questionType এই প্রযোজ্য
  const displayName = liveExam.customSetId
    ? (await prisma.customQuestionSet.findUnique({
        where: { id: liveExam.customSetId },
        select: { title: true },
      }))?.title ?? null
    : null;

  if (liveExam.questionType === "CQ") {
    interface CqReviewItem {
      id: string;
      stimulus: string;
      questionA: string;
      questionB: string;
      questionC: string;
      questionD: string;
      modelAnswerA: string | null;
      modelAnswerB: string | null;
      modelAnswerC: string | null;
      modelAnswerD: string | null;
      answerA: string;
      answerB: string;
      answerC: string;
      answerD: string;
      scoreA: number;
      scoreB: number;
      scoreC: number;
      scoreD: number;
      totalScore: number;
      feedback: string | null;
    }

    const cqAnswers = (liveExam.cqAnswers ?? {}) as Record<
      string,
      { answerA: string; answerB: string; answerC: string; answerD: string }
    >;
    const cqEvaluations = (liveExam.cqEvaluations ?? {}) as Record<
      string,
      { scoreA: number; scoreB: number; scoreC: number; scoreD: number; totalScore: number; feedback: string }
    >;

    let cqReview: CqReviewItem[];

    if (liveExam.sourceType === "custom") {
      const questions = await prisma.customQuestion.findMany({ where: { id: { in: questionIds } } });
      const map = new Map(questions.map((q) => [q.id, q]));
      cqReview = questionIds
        .map((id) => map.get(id))
        .filter((q): q is NonNullable<typeof q> => q !== undefined)
        .map((q) => {
          const a = cqAnswers[q.id] ?? { answerA: "", answerB: "", answerC: "", answerD: "" };
          const e = cqEvaluations[q.id] ?? { scoreA: 0, scoreB: 0, scoreC: 0, scoreD: 0, totalScore: 0, feedback: null };
          return {
            id: q.id,
            stimulus: q.stimulus ?? "",
            questionA: q.questionA ?? "",
            questionB: q.questionB ?? "",
            questionC: q.questionC ?? "",
            questionD: q.questionD ?? "",
            modelAnswerA: q.modelAnswerA,
            modelAnswerB: q.modelAnswerB,
            modelAnswerC: q.modelAnswerC,
            modelAnswerD: q.modelAnswerD,
            answerA: a.answerA,
            answerB: a.answerB,
            answerC: a.answerC,
            answerD: a.answerD,
            scoreA: e.scoreA,
            scoreB: e.scoreB,
            scoreC: e.scoreC,
            scoreD: e.scoreD,
            totalScore: e.totalScore,
            feedback: e.feedback,
          };
        });
    } else {
      const questions = await prisma.cQQuestion.findMany({ where: { id: { in: questionIds } } });
      const map = new Map(questions.map((q) => [q.id, q]));
      cqReview = questionIds
        .map((id) => map.get(id))
        .filter((q): q is NonNullable<typeof q> => q !== undefined)
        .map((q) => {
          const a = cqAnswers[q.id] ?? { answerA: "", answerB: "", answerC: "", answerD: "" };
          const e = cqEvaluations[q.id] ?? { scoreA: 0, scoreB: 0, scoreC: 0, scoreD: 0, totalScore: 0, feedback: null };
          return {
            id: q.id,
            stimulus: q.stimulus,
            questionA: q.questionA,
            questionB: q.questionB,
            questionC: q.questionC,
            questionD: q.questionD,
            modelAnswerA: q.modelAnswerA,
            modelAnswerB: q.modelAnswerB,
            modelAnswerC: q.modelAnswerC,
            modelAnswerD: q.modelAnswerD,
            answerA: a.answerA,
            answerB: a.answerB,
            answerC: a.answerC,
            answerD: a.answerD,
            scoreA: e.scoreA,
            scoreB: e.scoreB,
            scoreC: e.scoreC,
            scoreD: e.scoreD,
            totalScore: e.totalScore,
            feedback: e.feedback,
          };
        });
    }

    return NextResponse.json({
      liveExam: {
        id: liveExam.id,
        questionType: "CQ" as const,
        cqScore: liveExam.cqScore,
        cqTotalMarks: liveExam.cqTotalMarks,
        status: liveExam.status,
        sourceType: liveExam.sourceType,
        displayName,
      },
      cqReview,
    });
  }

  // ---------------- MCQ (established, অপরিবর্তিত) ----------------
  const userAnswers = (liveExam.userAnswers ?? {}) as Record<string, string>;

  interface ReviewQuestion {
    id: string;
    text: string;
    options: string[] | null;
    correctAnswer: string;
    explanation: string | null;
    userAnswer: string | null;
    isCorrect: boolean;
  }

  let reviewQuestions: ReviewQuestion[];

  if (liveExam.sourceType === "custom") {
    const questions = await prisma.customQuestion.findMany({ where: { id: { in: questionIds } } });
    const map = new Map(questions.map((q) => [q.id, q]));
    reviewQuestions = questionIds
      .map((id) => map.get(id))
      .filter((q): q is NonNullable<typeof q> => q !== undefined)
      .map((q) => {
        const userAnswer = userAnswers[q.id] ?? null;
        return {
          id: q.id,
          text: q.text ?? "",
          options: Array.isArray(q.options) ? (q.options as string[]) : null,
          correctAnswer: q.correctAnswer ?? "",
          explanation: null, // CustomQuestion এ established explanation ফিল্ড নেই
          userAnswer,
          isCorrect: userAnswer !== null && userAnswer === q.correctAnswer,
        };
      });
  } else {
    const questions = await prisma.question.findMany({ where: { id: { in: questionIds } } });
    const map = new Map(questions.map((q) => [q.id, q]));
    reviewQuestions = questionIds
      .map((id) => map.get(id))
      .filter((q): q is NonNullable<typeof q> => q !== undefined)
      .map((q) => {
        const userAnswer = userAnswers[q.id] ?? null;
        return {
          id: q.id,
          text: q.text,
          options: Array.isArray(q.options) ? (q.options as string[]) : null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          userAnswer,
          isCorrect: userAnswer !== null && userAnswer === q.correctAnswer,
        };
      });
  }

  return NextResponse.json({
    liveExam: {
      id: liveExam.id,
      questionType: "MCQ" as const,
      score: liveExam.score,
      totalQuestions: liveExam.totalQuestions,
      status: liveExam.status,
      sourceType: liveExam.sourceType,
      displayName,
    },
    questions: reviewQuestions,
  });
}
