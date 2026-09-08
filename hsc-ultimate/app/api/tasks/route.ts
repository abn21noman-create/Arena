// ===================================================================
// Task List + Create API
// GET  /api/tasks   -> ইউজারের সব টাস্ক (dueDate অনুযায়ী সাজানো)
// POST /api/tasks    -> নতুন টাস্ক তৈরি
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidEnumValue, VALID_TASK_PRIORITIES, VALID_SUBJECT_CODES } from "@/lib/enum-validation";
import { isValidDateString } from "@/lib/date-validation";

// 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
// Habit এর established `name.trim().length > 100` প্যাটার্নের একই
// ক্লাস): আগে title/description এর কোনো ব্যাকএন্ড max-length চেক
// ছিল না — লাইভ টেস্টে ~৩১৭ KB টেক্সট (কোনো length limit ছাড়া)
// সরাসরি DB তে সেভ হয়ে গেছে (storage/bandwidth abuse ঝুঁকি, এবং
// পরবর্তীতে UI তে এই বিশাল টাস্ক লিস্ট রেন্ডার করতে গেলে performance
// সমস্যাও হতে পারে)। ফিক্স: Habit এর established প্যাটার্ন অনুসরণ
// করে title/description এ ব্যাকএন্ড length limit যোগ করা হয়েছে।
export const MAX_TASK_TITLE_LENGTH = 200;
export const MAX_TASK_DESCRIPTION_LENGTH = 5000;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, description, dueDate, priority, subjectCode } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "টাস্কের নাম দিন" }, { status: 400 });
  }
  if (title.trim().length > MAX_TASK_TITLE_LENGTH) {
    return NextResponse.json(
      { error: `টাস্কের নাম খুব বড় (সর্বোচ্চ ${MAX_TASK_TITLE_LENGTH} অক্ষর)` },
      { status: 400 }
    );
  }
  if (description?.trim() && description.trim().length > MAX_TASK_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      { error: `বিবরণ খুব বড় (সর্বোচ্চ ${MAX_TASK_DESCRIPTION_LENGTH} অক্ষর)` },
      { status: 400 }
    );
  }

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // lib/enum-validation.ts এ বিস্তারিত): আগে অজানা priority/subjectCode
  // ভ্যালু (যেমন "URGENT_INVALID") সরাসরি Prisma create() এ পাস হতো —
  // Prisma `PrismaClientValidationError` throw করে ৫০০ crash করতো।
  // লাইভ টেস্টে প্রমাণিত। ফিক্স: create() এর আগেই enum ভ্যালিডেশন।
  if (!isValidEnumValue(priority, VALID_TASK_PRIORITIES)) {
    return NextResponse.json({ error: "সঠিক priority (LOW/MEDIUM/HIGH) দিন" }, { status: 400 });
  }
  if (!isValidEnumValue(subjectCode, VALID_SUBJECT_CODES)) {
    return NextResponse.json({ error: "সঠিক subjectCode দিন" }, { status: 400 });
  }
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // lib/date-validation.ts এ বিস্তারিত): অবৈধ dueDate স্ট্রিং দিলে
  // `new Date()` একটা Invalid Date অবজেক্ট বানায়, যেটা Prisma
  // create() এ পাস করলে `PrismaClientValidationError` throw করে ৫০০
  // crash করতো। লাইভ টেস্টে প্রমাণিত।
  if (!isValidDateString(dueDate)) {
    return NextResponse.json({ error: "সঠিক তারিখ দিন" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "MEDIUM",
      subjectCode: subjectCode || null,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}

