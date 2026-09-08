// ===================================================================
// Admin: একটা Subject এর বিস্তারিত (chapters সহ) + আপডেট + ডিলিট
// GET    /api/admin/subjects/[subjectId]
// PATCH  /api/admin/subjects/[subjectId]
// DELETE /api/admin/subjects/[subjectId]
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Chapter/Topic/Question/CQQuestion PATCH/DELETE এর
// সাথে একই bug pattern, প্রোঅ্যাক্টিভ সিস্টেমেটিক অডিটে ধরা পড়েছে):
// অস্তিত্বহীন subjectId দিলে Prisma `update`/`delete` P2025 throw
// করতো (৪০৪ এর বদলে ৫০০)। ফিক্স: existence চেক আগে করা হচ্ছে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { subjectId } = await params;
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: { _count: { select: { topics: true } } },
      },
    },
  });

  if (!subject) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
  return NextResponse.json({ subject });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { subjectId } = await params;
  const body = await req.json().catch(() => ({}));
  const { name, nameEn, colorHex, order } = body;

  // 🐛 বাগ ফিক্স (Admin Form Inline Validation ফিচারের সময় Topic PATCH এ
  // একই সমস্যা পাওয়া গিয়েছিল, এখানেও একই defense-in-depth যোগ করা হলো)
  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: "বাংলা নাম খালি রাখা যাবে না" }, { status: 400 });
  }
  if (nameEn !== undefined && !nameEn.trim()) {
    return NextResponse.json({ error: "ইংরেজি নাম খালি রাখা যাবে না" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স (Race Condition, Admin Forum Post/Reply Delete এর একই
  // "existence check থাকা সত্ত্বেও read-then-write" ক্লাস, broad grep
  // audit এ আবিষ্কৃত): আগে existence check এর পরেও আলাদা raw
  // `update()`/`delete()` কল করা হতো — concurrent double-PATCH/
  // DELETE এ P2025 crash হতো। ফিক্স: atomic `updateMany()`/
  // `deleteMany()`, matched count 0 হলে গ্রেসফুল ৪০৪।
  const updateResult = await prisma.subject.updateMany({
    where: { id: subjectId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(nameEn !== undefined && { nameEn: nameEn.trim() }),
      ...(colorHex !== undefined && { colorHex }),
      ...(order !== undefined && { order }),
    },
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: "সাবজেক্ট পাওয়া যায়নি" }, { status: 404 });
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return NextResponse.json({ error: "সাবজেক্ট পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ subject });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { subjectId } = await params;

  const claimResult = await prisma.subject.deleteMany({ where: { id: subjectId } });
  if (claimResult.count === 0) {
    return NextResponse.json({ error: "সাবজেক্ট পাওয়া যায়নি" }, { status: 404 });
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "SUBJECT_DELETE",
      targetType: "Subject",
      targetId: subjectId,
      req,
    });
  }

  return NextResponse.json({ success: true });
}
