// ===================================================================
// Admin: একটা Chapter এর বিস্তারিত (topics সহ) + আপডেট + ডিলিট
// GET    /api/admin/chapters/[chapterId]
// PATCH  /api/admin/chapters/[chapterId]
// DELETE /api/admin/chapters/[chapterId]
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ GET/PATCH/DELETE endpoint অডিটে আবিষ্কৃত,
// forum/posts/[postId] GET এ একই bug pattern এর পরে সম্পূর্ণ কোডবেস
// সিস্টেমেটিক অডিট করে ধরা পড়েছে): আগে PATCH/DELETE সরাসরি
// `prisma.chapter.update()/delete()` কল করতো কোনো existence চেক
// ছাড়াই। অস্তিত্বহীন/মুছে ফেলা chapterId দিলে Prisma `update`/
// `delete` `null` রিটার্ন করে না — বরং P2025 error throw করে, যা
// unhandled থেকে ৫০০ Internal Server Error রিটার্ন করতো (৪০৪ এর
// বদলে) — লাইভ টেস্টে সরাসরি ভেরিফাই করে নিশ্চিত হওয়া গেছে। ফিক্স:
// আগে existence চেক করে ৪০৪ রিটার্ন করা হচ্ছে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { chapterId } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      subject: true,
      topics: {
        orderBy: { order: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });

  if (!chapter) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
  return NextResponse.json({ chapter });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { chapterId } = await params;
  const body = await req.json().catch(() => ({}));
  const { name, nameEn, order } = body;

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
  const updateResult = await prisma.chapter.updateMany({
    where: { id: chapterId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(nameEn !== undefined && { nameEn: nameEn.trim() }),
      ...(order !== undefined && { order }),
    },
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: "চ্যাপ্টার পাওয়া যায়নি" }, { status: 404 });
  }

  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) {
    return NextResponse.json({ error: "চ্যাপ্টার পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ chapter });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { chapterId } = await params;

  const claimResult = await prisma.chapter.deleteMany({ where: { id: chapterId } });
  if (claimResult.count === 0) {
    return NextResponse.json({ error: "চ্যাপ্টার পাওয়া যায়নি" }, { status: 404 });
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "CHAPTER_DELETE",
      targetType: "Chapter",
      targetId: chapterId,
      req,
    });
  }

  return NextResponse.json({ success: true });
}
