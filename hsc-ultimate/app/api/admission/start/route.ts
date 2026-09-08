// ===================================================================
// Admission Mock Test শুরু করা
// POST /api/admission/start
// Body: { examType: "MEDICAL" | "DU_A_UNIT" | "BUET" }
// -------------------------------------------------------------------
// প্রতিটা সাবজেক্ট থেকে কনফিগার করা সংখ্যক প্রশ্ন এলোমেলোভাবে বাছাই করে
// একটা নতুন Attempt তৈরি করে। প্রশ্নের options সার্ভার-সাইডে শাফল করে
// পাঠানো হয় (answer-position মুখস্থ করা ঠেকাতে, Deep Research এ চিহ্নিত)।
// correctAnswer কখনো client এ পাঠানো হয় না।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pickRandom } from "@/lib/mock-exam";
import { ADMISSION_EXAM_CONFIGS, shuffleOptions } from "@/lib/admission";
import type { AdmissionExamType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { examType } = body as { examType?: AdmissionExamType };

  if (!examType || !ADMISSION_EXAM_CONFIGS[examType]) {
    return NextResponse.json({ error: "সঠিক পরীক্ষার ধরন দিন" }, { status: 400 });
  }

  const config = ADMISSION_EXAM_CONFIGS[examType];

  // প্রতিটা সাবজেক্ট থেকে কনফিগার করা সংখ্যক প্রশ্ন বাছাই — সাবজেক্ট-ভিত্তিক
  // বণ্টন নিশ্চিত করতে (যেমন Biology 30, Chemistry 25...) আলাদা আলাদা query
  const questionsBySubject = await Promise.all(
    config.subjects.map((s) =>
      prisma.admissionQuestion.findMany({
        where: { examType, subject: s.subject },
        select: { id: true },
      })
    )
  );

  const selectedQuestionIds: string[] = [];
  const insufficientSubjects: string[] = [];

  config.subjects.forEach((s, i) => {
    const available = questionsBySubject[i];
    if (available.length < s.questionCount) {
      insufficientSubjects.push(`${s.label} (${available.length}/${s.questionCount})`);
    }
    const picked = pickRandom(
      available.map((q) => q.id),
      s.questionCount
    );
    selectedQuestionIds.push(...picked);
  });

  if (selectedQuestionIds.length === 0) {
    return NextResponse.json(
      { error: "এই পরীক্ষার জন্য এখনো কোনো প্রশ্ন যোগ করা হয়নি" },
      { status: 400 }
    );
  }

  // পুরো সেট এলোমেলো করা হচ্ছে যাতে সাবজেক্ট অনুযায়ী ব্লক না দেখায়
  const shuffledQuestionIds = pickRandom(selectedQuestionIds, selectedQuestionIds.length);

  const attempt = await prisma.admissionMockAttempt.create({
    data: {
      userId: session.user.id,
      examType,
      questionIds: shuffledQuestionIds,
      totalCount: shuffledQuestionIds.length,
      maxScore: shuffledQuestionIds.length,
    },
  });

  // প্রশ্নের বিস্তারিত (সঠিক উত্তর ছাড়া) client এ পাঠানো, options শাফল করে
  const questions = await prisma.admissionQuestion.findMany({
    where: { id: { in: shuffledQuestionIds } },
  });
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const questionsForClient = shuffledQuestionIds.map((id) => {
    const q = questionMap.get(id);
    if (!q) return null;
    return {
      id: q.id,
      subject: q.subject,
      text: q.text,
      options: shuffleOptions(q.options as string[]),
      difficulty: q.difficulty,
    };
  }).filter(Boolean);

  return NextResponse.json({
    attemptId: attempt.id,
    examType,
    label: config.label,
    timeMinutes: config.timeMinutes,
    negativeMarkPerWrong: config.negativeMarkPerWrong,
    passMark: config.passMark,
    disclaimer: config.disclaimer,
    questions: questionsForClient,
    warning:
      insufficientSubjects.length > 0
        ? `কিছু সাবজেক্টে যথেষ্ট প্রশ্ন নেই: ${insufficientSubjects.join(", ")}`
        : null,
  });
}
