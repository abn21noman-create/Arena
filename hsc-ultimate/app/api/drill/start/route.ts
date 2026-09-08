// ===================================================================
// Timed Drill শুরু করার API
// POST /api/drill/start
// Body: { subjectId: string, durationSec: number }
// Response: প্রশ্ন pool (সঠিক উত্তর/ব্যাখ্যা ছাড়া — cheating আটকাতে)
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDrillQuestionPool, isValidDrillDuration } from "@/lib/drill-practice";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { subjectId, durationSec } = await req.json().catch(() => ({}));

  if (!subjectId) {
    return NextResponse.json({ error: "subjectId দিন" }, { status: 400 });
  }
  if (!isValidDrillDuration(durationSec)) {
    return NextResponse.json({ error: "সঠিক duration দিন (30/60/90 সেকেন্ড)" }, { status: 400 });
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return NextResponse.json({ error: "সাবজেক্ট পাওয়া যায়নি" }, { status: 404 });
  }

  const pool = await getDrillQuestionPool(subjectId);
  if (pool.length === 0) {
    return NextResponse.json(
      { error: "এই সাবজেক্টে এখনো কোনো প্রশ্ন নেই" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    subjectId: subject.id,
    subjectName: subject.name,
    durationSec,
    questions: pool,
  });
}
