// ===================================================================
// Mock Exam Attempt এর তথ্য লোড করা (MCQ প্রশ্ন লোড করতে, বা result দেখতে)
// GET /api/mock-exam/[attemptId]
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shuffleOptions } from "@/lib/mock-exam";

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

  const mcqIds = attempt.mcqQuestionIds as string[];
  const cqIds = attempt.cqQuestionIds as string[];

  // MCQ_DONE বা IN_PROGRESS স্ট্যাটাসে ক্লায়েন্টকে সঠিক উত্তর পাঠানো হয় না
  // (নিরাপত্তা), শুধু COMPLETED হলে explanation/correctAnswer দেখানো হয়
  const includeAnswers = attempt.status === "COMPLETED";

  const [mcqQuestions, cqQuestions] = await Promise.all([
    prisma.question.findMany({
      where: { id: { in: mcqIds } },
      select: {
        id: true,
        text: true,
        options: true,
        difficulty: true,
        ...(includeAnswers
          ? { correctAnswer: true, explanation: true }
          : {}),
      },
    }),
    prisma.cQQuestion.findMany({
      where: { id: { in: cqIds } },
      select: {
        id: true,
        stimulus: true,
        questionA: true,
        questionB: true,
        questionC: true,
        questionD: true,
        ...(includeAnswers
          ? {
              modelAnswerA: true,
              modelAnswerB: true,
              modelAnswerC: true,
              modelAnswerD: true,
            }
          : {}),
      },
    }),
  ]);

  // mcqIds/cqIds এর ক্রম বজায় রেখে সাজানো হচ্ছে (DB query তে ক্রম গ্যারান্টি থাকে না)
  // options শাফল করা হচ্ছে (answer-position মুখস্থ হওয়া ঠেকাতে) — শুধু
  // IN_PROGRESS/MCQ_DONE অবস্থায় (এখনো উত্তর দেওয়া বাকি), COMPLETED
  // (result review) এ shuffle করার দরকার নেই কারণ correctAnswer এমনিতেই
  // দেখানো হচ্ছে
  const mcqQuestionsShuffled = includeAnswers
    ? mcqQuestions
    : mcqQuestions.map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? shuffleOptions(q.options as unknown[]) : q.options,
      }));

  const mcqMap = new Map(mcqQuestionsShuffled.map((q) => [q.id, q]));
  const cqMap = new Map(cqQuestions.map((q) => [q.id, q]));

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      subjectId: attempt.subjectId,
      subjectName: attempt.subject.name,
      mode: attempt.mode,
      status: attempt.status,
      mcqScore: attempt.mcqScore,
      mcqTotal: attempt.mcqTotal,
      cqScore: attempt.cqScore,
      cqTotal: attempt.cqTotal,
      timeTakenSec: attempt.timeTakenSec,
      createdAt: attempt.createdAt,
      completedAt: attempt.completedAt,
    },
    mcqQuestions: mcqIds.map((id) => mcqMap.get(id)).filter(Boolean),
    cqQuestions: cqIds.map((id) => cqMap.get(id)).filter(Boolean),
  });
}
