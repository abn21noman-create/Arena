// ===================================================================
// ইউজারের Admission Mock Test History (progress tracking এর জন্য)
// GET /api/admission/history?examType=MEDICAL (ঐচ্ছিক ফিল্টার)
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AdmissionExamType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const examType = req.nextUrl.searchParams.get("examType") as AdmissionExamType | null;

  const attempts = await prisma.admissionMockAttempt.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      ...(examType ? { examType } : {}),
    },
    orderBy: { completedAt: "desc" },
    take: 30,
    select: {
      id: true,
      examType: true,
      rawScore: true,
      maxScore: true,
      correctCount: true,
      wrongCount: true,
      skippedCount: true,
      timeTakenSec: true,
      completedAt: true,
    },
  });

  return NextResponse.json({ attempts });
}
