// ===================================================================
// Admin: একটা Question আপডেট + ডিলিট
// PATCH  /api/admin/questions/[questionId]
// DELETE /api/admin/questions/[questionId]
//
// 🐛 বাগ ফিক্স (Race Condition, Admin Forum Post/Reply Delete এর একই
// "existence check থাকা সত্ত্বেও read-then-write" ক্লাস, এই সেশনে
// broad grep audit এ পুরো admin content-management এলাকা জুড়ে
// (Question/CQQuestion/Chapter/Subject/Topic) সিস্টেম্যাটিকভাবে
// আবিষ্কৃত ও ফিক্স করা হয়েছে): existence check এর পরেও PATCH ও
// DELETE উভয় হ্যান্ডলারে চূড়ান্ত ধাপে raw `update()`/`delete()`
// ব্যবহার হতো — দুইজন admin/moderator concurrent একই কন্টেন্টে
// অ্যাকশন নিলে (বা দ্রুত ডাবল-ক্লিক) P2025 crash হতো। ফিক্স:
// `update()`/`delete()` এর বদলে atomic `updateMany()`/`deleteMany()`
// — matched count 0 হলে গ্রেসফুল ৪০৪।
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
  { params }: { params: Promise<{ questionId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { questionId } = await params;
  const body = await req.json().catch(() => ({}));
  const { text, options, correctAnswer, explanation, difficulty, boardYear, boardName, misconceptionTag } = body;

  // 🐛 বাগ ফিক্স (Admin Form Inline Validation ফিচারের সময় Topic/Chapter/
  // Subject PATCH এ একই সমস্যা পাওয়া গিয়েছিল — defense-in-depth হিসেবে
  // এখানেও যোগ করা হলো, যদিও বর্তমান UI শুধু misconceptionTag পাঠায়)
  if (text !== undefined && !text.trim()) {
    return NextResponse.json({ error: "প্রশ্নের টেক্সট খালি রাখা যাবে না" }, { status: 400 });
  }
  if (correctAnswer !== undefined && !correctAnswer.trim()) {
    return NextResponse.json({ error: "সঠিক উত্তর খালি রাখা যাবে না" }, { status: 400 });
  }
  if (options !== undefined && (!Array.isArray(options) || options.length < 2)) {
    return NextResponse.json({ error: "অন্তত ২টা অপশন থাকতে হবে" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স (Boolean/Numeric Validation bug hunt সিরিজের ধারাবাহিকতা,
  // established hscBatch এর একই ক্লাস, lib/numeric-validation.ts এ
  // বিস্তারিত): আগে `boardYear ? Number(boardYear) : null` — extreme
  // digit-string এ ৫০০ crash, non-numeric string/array এ NaN→null
  // (established real content silently corrupt হতো, লাইভ টেস্টে
  // প্রমাণিত)। parsedBoardYear এর টাইপ normalize করে ভ্যালিডেট করা হচ্ছে।
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

  const updateResult = await prisma.question.updateMany({
    where: { id: questionId },
    data: {
      ...(text !== undefined && { text: text.trim() }),
      ...(options !== undefined && { options }),
      ...(correctAnswer !== undefined && { correctAnswer: correctAnswer.trim() }),
      ...(explanation !== undefined && { explanation: explanation || null }),
      ...(difficulty !== undefined && { difficulty }),
      ...(boardYear !== undefined && { boardYear: parsedBoardYear }),
      ...(boardName !== undefined && { boardName: boardName || null }),
      ...(misconceptionTag !== undefined && { misconceptionTag: misconceptionTag || null }),
    },
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: "প্রশ্ন পাওয়া যায়নি" }, { status: 404 });
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: "প্রশ্ন পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ question });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { questionId } = await params;

  const claimResult = await prisma.question.deleteMany({ where: { id: questionId } });
  if (claimResult.count === 0) {
    return NextResponse.json({ error: "প্রশ্ন পাওয়া যায়নি" }, { status: 404 });
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "QUESTION_DELETE",
      targetType: "Question",
      targetId: questionId,
      req,
    });
  }

  return NextResponse.json({ success: true });
}

