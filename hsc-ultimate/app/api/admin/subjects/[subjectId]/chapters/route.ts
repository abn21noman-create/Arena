// ===================================================================
// Admin: একটা Subject এ নতুন Chapter তৈরি করা
// POST /api/admin/subjects/[subjectId]/chapters
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { subjectId } = await params;
  const body = await req.json().catch(() => ({}));
  const { name, nameEn, order } = body;

  if (!name?.trim() || !nameEn?.trim()) {
    return NextResponse.json({ error: "name ও nameEn আবশ্যক" }, { status: 400 });
  }

  const chapter = await prisma.chapter.create({
    data: {
      subjectId,
      name: name.trim(),
      nameEn: nameEn.trim(),
      order: order ?? 0,
    },
  });

  return NextResponse.json({ chapter }, { status: 201 });
}
