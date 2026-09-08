// ===================================================================
// Admin: একটা CQ Question আপডেট + ডিলিট
// PATCH  /api/admin/cq-questions/[cqQuestionId]
// DELETE /api/admin/cq-questions/[cqQuestionId]
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";
import {
  isValidOptionalBoardYear,
  MIN_BOARD_YEAR,
  MAX_BOARD_YEAR,
} from "@/lib/numeric-validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ cqQuestionId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { cqQuestionId } = await params;
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

  // 🐛 বাগ ফিক্স (Admin Form Inline Validation ফিচারের সময় Topic/Chapter/
  // Subject PATCH এ একই সমস্যা পাওয়া গিয়েছিল — defense-in-depth হিসেবে
  // এখানেও যোগ করা হলো)
  const requiredFields: [string, string | undefined][] = [
    ["stimulus", stimulus],
    ["questionA", questionA],
    ["questionB", questionB],
    ["questionC", questionC],
    ["questionD", questionD],
  ];
  for (const [fieldName, value] of requiredFields) {
    if (value !== undefined && !value.trim()) {
      return NextResponse.json({ error: `${fieldName} খালি রাখা যাবে না` }, { status: 400 });
    }
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
  if (boardYear !== undefined && !isValidOptionalBoardYear(parsedBoardYear)) {
    return NextResponse.json(
      { error: `সঠিক বোর্ড বছর দিন (${MIN_BOARD_YEAR}-${MAX_BOARD_YEAR}) অথবা খালি রাখুন` },
      { status: 400 }
    );
  }

  // 🐛 বাগ ফিক্স (Race Condition, Admin Forum Post/Reply Delete এর একই
  // "existence check থাকা সত্ত্বেও read-then-write" ক্লাস, broad grep
  // audit এ আবিষ্কৃত): আগে existence check (`findUnique`) এর পরে
  // আলাদা raw `update()` কল করা হতো — concurrent double-PATCH/DELETE
  // এ P2025 crash হতো। ফিক্স: `update()` এর বদলে atomic
  // `updateMany()`, matched count 0 হলে গ্রেসফুল ৪০৪।
  const updateResult = await prisma.cQQuestion.updateMany({
    where: { id: cqQuestionId },
    data: {
      ...(stimulus !== undefined && { stimulus: stimulus.trim() }),
      ...(questionA !== undefined && { questionA: questionA.trim() }),
      ...(questionB !== undefined && { questionB: questionB.trim() }),
      ...(questionC !== undefined && { questionC: questionC.trim() }),
      ...(questionD !== undefined && { questionD: questionD.trim() }),
      ...(modelAnswerA !== undefined && { modelAnswerA: modelAnswerA || null }),
      ...(modelAnswerB !== undefined && { modelAnswerB: modelAnswerB || null }),
      ...(modelAnswerC !== undefined && { modelAnswerC: modelAnswerC || null }),
      ...(modelAnswerD !== undefined && { modelAnswerD: modelAnswerD || null }),
      ...(boardYear !== undefined && { boardYear: parsedBoardYear }),
      ...(boardName !== undefined && { boardName: boardName || null }),
      ...(misconceptionTag !== undefined && { misconceptionTag: misconceptionTag || null }),
    },
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: "CQ প্রশ্ন পাওয়া যায়নি" }, { status: 404 });
  }

  const cqQuestion = await prisma.cQQuestion.findUnique({ where: { id: cqQuestionId } });
  if (!cqQuestion) {
    return NextResponse.json({ error: "CQ প্রশ্ন পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ cqQuestion });
}

// 🐛 বাগ ফিক্স (Race Condition, একই ক্লাস — উপরের কমেন্টে বিস্তারিত):
// raw `delete()` এর বদলে atomic `deleteMany()`।
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ cqQuestionId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { cqQuestionId } = await params;

  const claimResult = await prisma.cQQuestion.deleteMany({ where: { id: cqQuestionId } });
  if (claimResult.count === 0) {
    return NextResponse.json({ error: "CQ প্রশ্ন পাওয়া যায়নি" }, { status: 404 });
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "CQ_QUESTION_DELETE",
      targetType: "CQQuestion",
      targetId: cqQuestionId,
      req,
    });
  }

  return NextResponse.json({ success: true });
}
