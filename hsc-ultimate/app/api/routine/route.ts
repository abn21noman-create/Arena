// ===================================================================
// Class Routine List + Create API
// GET  /api/routine  — ইউজারের সাপ্তাহিক রুটিন (সব দিনের সব স্লট)
// POST /api/routine  — নতুন স্লট যোগ করা
// Body (POST): { dayOfWeek, startTime, endTime, subjectCode?, label, colorHex? }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidEnumValue, VALID_SUBJECT_CODES } from "@/lib/enum-validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const slots = await prisma.routineSlot.findMany({
    where: { userId: session.user.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ slots });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { dayOfWeek, startTime, endTime, subjectCode, label, colorHex } = body;

  if (
    typeof dayOfWeek !== "number" ||
    dayOfWeek < 0 ||
    dayOfWeek > 6 ||
    !startTime ||
    !endTime ||
    !label?.trim()
  ) {
    return NextResponse.json(
      { error: "বার, শুরু/শেষ সময় ও লেবেল দিন" },
      { status: 400 }
    );
  }

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // Habit/Study Group এর একই max-length প্যাটার্ন): আগে কোনো ব্যাকএন্ড
  // length limit ছিল না — লাইভ টেস্টে ~৩১৭ KB label সরাসরি DB তে সেভ
  // হয়ে গেছে। ফিক্স: ১০০ অক্ষর সীমা যোগ করা হয়েছে।
  if (label.trim().length > 100) {
    return NextResponse.json(
      { error: "লেবেল খুব বড় (সর্বোচ্চ ১০০ অক্ষর)" },
      { status: 400 }
    );
  }

  if (startTime >= endTime) {
    return NextResponse.json(
      { error: "শেষ সময় শুরুর সময়ের পরে হতে হবে" },
      { status: 400 }
    );
  }

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // lib/enum-validation.ts এ বিস্তারিত): অজানা subjectCode দিলে
  // Prisma create() এ `PrismaClientValidationError` throw করে ৫০০
  // crash করতো। লাইভ টেস্টে প্রমাণিত।
  if (!isValidEnumValue(subjectCode, VALID_SUBJECT_CODES)) {
    return NextResponse.json({ error: "সঠিক subjectCode দিন" }, { status: 400 });
  }

  const slot = await prisma.routineSlot.create({
    data: {
      userId: session.user.id,
      dayOfWeek,
      startTime,
      endTime,
      subjectCode: subjectCode || null,
      label: label.trim(),
      colorHex: colorHex || "#6d28d9",
    },
  });

  return NextResponse.json({ slot }, { status: 201 });
}
