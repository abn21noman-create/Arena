// ===================================================================
// Mock Exam শুরু করা — MCQ ও CQ প্রশ্ন এলোমেলোভাবে বাছাই করে Attempt তৈরি
// POST /api/mock-exam/start
// Body: { subjectId, mode: "FULL" | "QUICK" }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MOCK_EXAM_CONFIG, pickRandom, MockExamModeKey } from "@/lib/mock-exam";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { subjectId, mode } = body as { subjectId: string; mode: MockExamModeKey };

  if (!subjectId || !mode || !MOCK_EXAM_CONFIG[mode]) {
    return NextResponse.json({ error: "সাবজেক্ট ও মোড দিন" }, { status: 400 });
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return NextResponse.json({ error: "সাবজেক্ট পাওয়া যায়নি" }, { status: 404 });
  }

  const config = MOCK_EXAM_CONFIG[mode];

  // এই সাবজেক্টের সব চ্যাপ্টার/টপিকের সব MCQ ও CQ প্রশ্ন নিয়ে আসা হচ্ছে
  const [allMcq, allCq] = await Promise.all([
    prisma.question.findMany({
      where: { topic: { chapter: { subjectId } }, type: "MCQ" },
      select: { id: true },
    }),
    prisma.cQQuestion.findMany({
      where: { topic: { chapter: { subjectId } } },
      select: { id: true },
    }),
  ]);

  if (allMcq.length === 0 && allCq.length === 0) {
    return NextResponse.json(
      { error: "এই সাবজেক্টে এখনো পর্যাপ্ত প্রশ্ন যোগ করা হয়নি" },
      { status: 400 }
    );
  }

  const selectedMcqIds = pickRandom(
    allMcq.map((q) => q.id),
    config.mcqCount
  );
  const selectedCqIds = pickRandom(
    allCq.map((q) => q.id),
    config.cqCount
  );

  const attempt = await prisma.mockExamAttempt.create({
    data: {
      userId: session.user.id,
      subjectId,
      mode,
      mcqQuestionIds: selectedMcqIds,
      mcqTotal: selectedMcqIds.length,
      cqQuestionIds: selectedCqIds,
      cqTotal: selectedCqIds.length * 10, // প্রতিটা CQ ১০ নম্বরের
      status: "IN_PROGRESS",
    },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    mcqCount: selectedMcqIds.length,
    cqCount: selectedCqIds.length,
    config,
  });
}
