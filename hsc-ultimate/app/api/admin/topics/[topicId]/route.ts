// ===================================================================
// Admin: একটা Topic এর বিস্তারিত (questions সহ) + আপডেট + ডিলিট
// GET    /api/admin/topics/[topicId]
// PATCH  /api/admin/topics/[topicId]
// DELETE /api/admin/topics/[topicId]
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";
import { isValidOptionalBoolean } from "@/lib/boolean-validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { topicId } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      chapter: { include: { subject: true } },
      questions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!topic) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
  return NextResponse.json({ topic });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { topicId } = await params;
  const body = await req.json().catch(() => ({}));
  const { name, nameEn, isImportant, videoUrl, notesMarkdown, formulaSheet, order } = body;

  // 🐛 বাগ ফিক্স (Admin Form Inline Validation ফিচারের সময় আবিষ্কৃত):
  // আগে PATCH এ name/nameEn এর কোনো server-side validation ছিল না
  // (POST এ ছিল) — ক্লায়েন্ট ভ্যালিডেশন bypass করে খালি স্ট্রিং
  // পাঠালে সেটা সরাসরি DB তে সেভ হয়ে যেত (defense-in-depth মিসিং)।
  // এখন undefined না হয়ে পাঠানো হলে non-empty হওয়া বাধ্যতামূলক।
  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: "বাংলা নাম খালি রাখা যাবে না" }, { status: 400 });
  }
  if (nameEn !== undefined && !nameEn.trim()) {
    return NextResponse.json({ error: "ইংরেজি নাম খালি রাখা যাবে না" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স (Boolean Field Validation bug hunt, broad grep audit এ
  // আবিষ্কৃত): আগে কোনো টাইপ চেক ছাড়াই `isImportant !== undefined &&
  // { isImportant }` স্প্রেড করে সরাসরি Prisma তে পাঠানো হতো —
  // non-boolean (string/array/number) দিলে PrismaClientValidationError
  // throw করে ৫০০ crash করতো (established habits/flashcard-decks এর
  // একই ক্লাস)।
  if (!isValidOptionalBoolean(isImportant)) {
    return NextResponse.json(
      { error: "isImportant অবশ্যই true/false (boolean) হতে হবে" },
      { status: 400 }
    );
  }

  // 🐛 বাগ ফিক্স (Race Condition, Admin Forum Post/Reply Delete এর একই
  // "existence check থাকা সত্ত্বেও read-then-write" ক্লাস, broad grep
  // audit এ আবিষ্কৃত): আগে existence check এর পরেও আলাদা raw
  // `update()`/`delete()` কল করা হতো — concurrent double-PATCH/
  // DELETE এ P2025 crash হতো। ফিক্স: atomic `updateMany()`/
  // `deleteMany()`, matched count 0 হলে গ্রেসফুল ৪০৪।
  const updateResult = await prisma.topic.updateMany({
    where: { id: topicId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(nameEn !== undefined && { nameEn: nameEn.trim() }),
      ...(isImportant !== undefined && { isImportant }),
      ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
      ...(notesMarkdown !== undefined && { notesMarkdown: notesMarkdown || null }),
      ...(formulaSheet !== undefined && { formulaSheet: formulaSheet || null }),
      ...(order !== undefined && { order }),
    },
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: "টপিক পাওয়া যায়নি" }, { status: 404 });
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return NextResponse.json({ error: "টপিক পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ topic });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { topicId } = await params;

  const claimResult = await prisma.topic.deleteMany({ where: { id: topicId } });
  if (claimResult.count === 0) {
    return NextResponse.json({ error: "টপিক পাওয়া যায়নি" }, { status: 404 });
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "TOPIC_DELETE",
      targetType: "Topic",
      targetId: topicId,
      req,
    });
  }

  return NextResponse.json({ success: true });
}
