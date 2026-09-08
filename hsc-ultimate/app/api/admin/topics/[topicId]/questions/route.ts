// ===================================================================
// Admin: একটা Topic এ নতুন Question তৈরি করা (single)
// POST /api/admin/topics/[topicId]/questions
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
  const { text, options, correctAnswer, explanation, difficulty, boardYear, boardName, misconceptionTag } = body;

  if (!text?.trim() || !correctAnswer?.trim()) {
    return NextResponse.json(
      { error: "প্রশ্ন ও সঠিক উত্তর আবশ্যক" },
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

  const question = await prisma.question.create({
    data: {
      topicId,
      type: "MCQ",
      text: text.trim(),
      options: Array.isArray(options) ? options : [],
      correctAnswer: correctAnswer.trim(),
      explanation: explanation?.trim() || null,
      difficulty: difficulty || "MEDIUM",
      boardYear: parsedBoardYear,
      boardName: boardName?.trim() || null,
      misconceptionTag: misconceptionTag?.trim() || null,
    },
  });

  return NextResponse.json({ question }, { status: 201 });
}
