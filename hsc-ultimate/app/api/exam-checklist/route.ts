// ===================================================================
// Exam Day Checklist List + Custom Item Create API
// GET  /api/exam-checklist  — ইউজারের checklist (প্রথমবার হলে ডিফল্ট আইটেম seed করা হয়)
// POST /api/exam-checklist  — নতুন কাস্টম আইটেম যোগ (সর্বোচ্চ MAX_CUSTOM_ITEMS_PER_USER টা)
// Body (POST): { category, label }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ensureDefaultChecklistSeeded,
  MAX_CUSTOM_ITEMS_PER_USER,
  MAX_CHECKLIST_LABEL_LENGTH,
} from "@/lib/exam-checklist";

const VALID_CATEGORIES = ["NIGHT_BEFORE", "EXAM_DAY"] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  await ensureDefaultChecklistSeeded(session.user.id);

  const items = await prisma.examChecklistItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { category, label } = body as { category?: string; label?: string };

  if (!VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
    return NextResponse.json({ error: "সঠিক category দিন" }, { status: 400 });
  }
  if (!label?.trim()) {
    return NextResponse.json({ error: "আইটেমের নাম দিন" }, { status: 400 });
  }
  if (label.trim().length > MAX_CHECKLIST_LABEL_LENGTH) {
    return NextResponse.json(
      { error: `নাম খুব বড় (সর্বোচ্চ ${MAX_CHECKLIST_LABEL_LENGTH} অক্ষর)` },
      { status: 400 }
    );
  }

  // established Habit Tracker/Bookmark Folder প্যাটার্ন — atomic
  // user-row-lock দিয়ে capacity-bypass race condition প্রতিরোধ
  try {
    const item = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${session.user.id} FOR UPDATE`;

      const existingCustomCount = await tx.examChecklistItem.count({
        where: { userId: session.user.id, isCustom: true },
      });
      if (existingCustomCount >= MAX_CUSTOM_ITEMS_PER_USER) {
        throw new Error(`সর্বোচ্চ ${MAX_CUSTOM_ITEMS_PER_USER}টা কাস্টম আইটেম যোগ করা যায়`);
      }

      const maxOrder = await tx.examChecklistItem.aggregate({
        where: { userId: session.user.id, category: category as "NIGHT_BEFORE" | "EXAM_DAY" },
        _max: { order: true },
      });

      return tx.examChecklistItem.create({
        data: {
          userId: session.user.id,
          category: category as "NIGHT_BEFORE" | "EXAM_DAY",
          label: label.trim(),
          isCustom: true,
          order: (maxOrder._max.order ?? -1) + 1,
        },
      });
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "আইটেম যোগ করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
