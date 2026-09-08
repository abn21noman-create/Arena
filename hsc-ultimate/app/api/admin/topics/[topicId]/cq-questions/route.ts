// ===================================================================
// Admin: একটা Topic এ নতুন CQ Question তৈরি করা
// POST /api/admin/topics/[topicId]/cq-questions
// Body: { stimulus, questionA/B/C/D, modelAnswerA/B/C/D, boardYear?, boardName? }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  isValidOptionalBoardYear,
  MIN_BOARD_YEAR,
  MAX_BOARD_YEAR,
} from "@/lib/numeric-validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { topicId } = await params;
  const body = await req.json().catch(() => ({}));
  const {
    stimulus,
    questionA,
    questionB,
    questionC,
    questionD,
    modelAnswerA,
    modelAnswerB,
    modelAnswerC,
    modelAnswerD,
    boardYear,
    boardName,
    misconceptionTag,
  } = body;

  if (
    !stimulus?.trim() ||
    !questionA?.trim() ||
    !questionB?.trim() ||
    !questionC?.trim() ||
    !questionD?.trim()
  ) {
    return NextResponse.json(
      { error: "উদ্দীপক এবং ক/খ/গ/ঘ চারটা প্রশ্ন আবশ্যক" },
      { status: 400 }
    );
  }

  // 🐛 বাগ ফিক্স (Boolean/Numeric Validation bug hunt সিরিজের ধারাবাহিকতা,
  // established hscBatch এর একই ক্লাস — lib/numeric-validation.ts এ
  // বিস্তারিত): আগে `boardYear ? Number(boardYear) : null` — extreme
  // digit-string এ ৫০০ crash, non-numeric string/array এ NaN→null
  // silent corruption।
  const parsedBoardYear =
    boardYear === undefined || boardYear === null || boardYear === ""
      ? null
      : typeof boardYear === "number"
        ? boardYear
        : Number(boardYear);
  if (!isValidOptionalBoardYear(parsedBoardYear)) {
    return NextResponse.json(
      { error: `সঠিক বোর্ড বছর দিন (${MIN_BOARD_YEAR}-${MAX_BOARD_YEAR}) অথবা খালি রাখুন` },
      { status: 400 }
    );
  }

  const cqQuestion = await prisma.cQQuestion.create({
    data: {
      topicId,
      stimulus: stimulus.trim(),
      questionA: questionA.trim(),
      questionB: questionB.trim(),
      questionC: questionC.trim(),
      questionD: questionD.trim(),
      modelAnswerA: modelAnswerA?.trim() || null,
      modelAnswerB: modelAnswerB?.trim() || null,
      modelAnswerC: modelAnswerC?.trim() || null,
      modelAnswerD: modelAnswerD?.trim() || null,
      boardYear: parsedBoardYear,
      boardName: boardName?.trim() || null,
      misconceptionTag: misconceptionTag?.trim() || null,
    },
  });

  return NextResponse.json({ cqQuestion }, { status: 201 });
}
