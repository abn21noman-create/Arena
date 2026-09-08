// ===================================================================
// Timed Drill এর জন্য সাবজেক্ট লিস্ট (প্রশ্ন সংখ্যা সহ)
// GET /api/drill/subjects
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      chapters: {
        include: { topics: { include: { _count: { select: { questions: true } } } } },
      },
    },
  });

  const result = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    nameEn: s.nameEn,
    colorHex: s.colorHex,
    questionCount: s.chapters.reduce(
      (sum, ch) => sum + ch.topics.reduce((s2, t) => s2 + t._count.questions, 0),
      0
    ),
  }));

  return NextResponse.json({ subjects: result });
}
