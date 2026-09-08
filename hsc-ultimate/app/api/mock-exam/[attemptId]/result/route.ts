// ===================================================================
// Mock Exam এর সম্পূর্ণ ফলাফল — MCQ+CQ স্কোর, প্রতিটা প্রশ্নের বিস্তারিত রিভিউ
// GET /api/mock-exam/[attemptId]/result
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMockExamPercentile } from "@/lib/percentile";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { attemptId } = await params;
  const attempt = await prisma.mockExamAttempt.findUnique({
    where: { id: attemptId },
    include: { subject: true },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "পরীক্ষা পাওয়া যায়নি" }, { status: 404 });
  }

  if (attempt.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "পরীক্ষা এখনো সম্পন্ন হয়নি" },
      { status: 400 }
    );
  }

  const mcqIds = attempt.mcqQuestionIds as string[];
  const cqIds = attempt.cqQuestionIds as string[];

  const [mcqQuestions, cqQuestions, cqAttempts] = await Promise.all([
    prisma.question.findMany({ where: { id: { in: mcqIds } } }),
    prisma.cQQuestion.findMany({ where: { id: { in: cqIds } } }),
    prisma.cQAttempt.findMany({
      where: { cqQuestionId: { in: cqIds }, userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // প্রতিটা CQ প্রশ্নের সর্বশেষ attempt (এই mock exam এ যেটা জমা দেওয়া হয়েছে)
  const cqAttemptMap = new Map<string, (typeof cqAttempts)[number]>();
  for (const ca of cqAttempts) {
    if (!cqAttemptMap.has(ca.cqQuestionId)) {
      cqAttemptMap.set(ca.cqQuestionId, ca);
    }
  }

  const cqMap = new Map(cqQuestions.map((q) => [q.id, q]));

  const cqReview = cqIds.map((id) => {
    const question = cqMap.get(id);
    const cqAttempt = cqAttemptMap.get(id);
    return { question, attempt: cqAttempt };
  });

  const totalScore = attempt.mcqScore + attempt.cqScore;
  const totalMarks = attempt.mcqTotal + attempt.cqTotal;

  // একই Subject+Mode এর সব পরীক্ষার্থীর তুলনায় Percentile/Rank হিসাব
  const percentile = await calculateMockExamPercentile(
    attempt.subjectId,
    attempt.mode,
    session.user.id
  );

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      subjectName: attempt.subject.name,
      mode: attempt.mode,
      mcqScore: attempt.mcqScore,
      mcqTotal: attempt.mcqTotal,
      mcqUserAnswers: attempt.mcqUserAnswers ?? {},
      cqScore: attempt.cqScore,
      cqTotal: attempt.cqTotal,
      totalScore,
      totalMarks,
      percentage: totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0,
      timeTakenSec: attempt.timeTakenSec,
      createdAt: attempt.createdAt,
      completedAt: attempt.completedAt,
    },
    mcqQuestions,
    cqReview,
    percentile,
  });
}
