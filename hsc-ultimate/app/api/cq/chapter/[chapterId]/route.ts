// ===================================================================
// একটা Chapter এর সব CQ প্রশ্ন লোড করার API (সঠিক উত্তর ছাড়া)
// GET /api/cq/chapter/[chapterId]
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { chapterId } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      subject: true,
      topics: {
        include: { cqQuestions: true },
      },
    },
  });

  if (!chapter) {
    return NextResponse.json({ error: "চ্যাপ্টার পাওয়া যায়নি" }, { status: 404 });
  }

  const cqQuestions = chapter.topics.flatMap((t) =>
    t.cqQuestions.map((cq) => ({
      id: cq.id,
      stimulus: cq.stimulus,
      questionA: cq.questionA,
      questionB: cq.questionB,
      questionC: cq.questionC,
      questionD: cq.questionD,
      boardYear: cq.boardYear,
      boardName: cq.boardName,
    }))
  );

  if (cqQuestions.length === 0) {
    return NextResponse.json(
      { error: "এই চ্যাপ্টারে এখনো কোনো CQ প্রশ্ন নেই" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    chapterName: chapter.name,
    subjectName: chapter.subject.name,
    cqQuestions,
  });
}
