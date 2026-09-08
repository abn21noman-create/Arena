// ===================================================================
// একটা Subject এর সব Chapter এ কতগুলো CQ প্রশ্ন আছে তার লিস্ট
// GET /api/cq/subject/[subjectId]
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { subjectId } = await params;

  const chapters = await prisma.chapter.findMany({
    where: { subjectId },
    orderBy: { order: "asc" },
    include: {
      topics: { include: { _count: { select: { cqQuestions: true } } } },
    },
  });

  const result = chapters.map((c) => ({
    id: c.id,
    name: c.name,
    cqCount: c.topics.reduce((sum, t) => sum + t._count.cqQuestions, 0),
  }));

  return NextResponse.json({ chapters: result });
}
