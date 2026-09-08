// ===================================================================
// Admission Exam Configs তালিকা (UI তে সিলেকশন কার্ড দেখানোর জন্য) +
// প্রতিটা পরীক্ষায় কতগুলো প্রশ্ন বর্তমানে DB তে আছে
// GET /api/admission/exams
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ADMISSION_EXAM_CONFIGS, ADMISSION_EXAM_ORDER, getTotalQuestionCount } from "@/lib/admission";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const counts = await prisma.admissionQuestion.groupBy({
    by: ["examType"],
    _count: true,
  });
  const countMap = new Map(counts.map((c) => [c.examType, c._count]));

  const exams = ADMISSION_EXAM_ORDER.map((examType) => {
    const config = ADMISSION_EXAM_CONFIGS[examType];
    return {
      examType,
      label: config.label,
      shortLabel: config.shortLabel,
      subjects: config.subjects,
      negativeMarkPerWrong: config.negativeMarkPerWrong,
      timeMinutes: config.timeMinutes,
      passMark: config.passMark,
      disclaimer: config.disclaimer,
      idealQuestionCount: getTotalQuestionCount(config),
      availableQuestionCount: countMap.get(examType) ?? 0,
    };
  });

  return NextResponse.json({ exams });
}
