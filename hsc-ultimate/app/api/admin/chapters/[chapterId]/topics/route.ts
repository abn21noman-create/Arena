// ===================================================================
// Admin: একটা Chapter এ নতুন Topic তৈরি করা
// POST /api/admin/chapters/[chapterId]/topics
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isValidOptionalBoolean } from "@/lib/boolean-validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { chapterId } = await params;
  const body = await req.json().catch(() => ({}));
  const { name, nameEn, isImportant, videoUrl, notesMarkdown, formulaSheet, order } = body;

  if (!name?.trim() || !nameEn?.trim()) {
    return NextResponse.json({ error: "name ও nameEn আবশ্যক" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স (Boolean Field Validation bug hunt): আগে `!!isImportant`
  // দিয়ে coerce করা হতো — non-empty string (যেমন "false") পাঠালে
  // `!!"false"` === true, সাইলেন্টলি ভুল ভ্যালু সেভ হতো। এখন strict
  // boolean validation, undefined হলে false ডিফল্ট।
  if (!isValidOptionalBoolean(isImportant)) {
    return NextResponse.json(
      { error: "isImportant অবশ্যই true/false (boolean) হতে হবে" },
      { status: 400 }
    );
  }

  const topic = await prisma.topic.create({
    data: {
      chapterId,
      name: name.trim(),
      nameEn: nameEn.trim(),
      isImportant: isImportant ?? false,
      videoUrl: videoUrl?.trim() || null,
      notesMarkdown: notesMarkdown?.trim() || null,
      formulaSheet: formulaSheet?.trim() || null,
      order: order ?? 0,
    },
  });

  return NextResponse.json({ topic }, { status: 201 });
}
