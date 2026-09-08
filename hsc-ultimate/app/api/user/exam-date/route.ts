// ===================================================================
// HSC Exam Date সেট/আপডেট করার API (Planner এর Exam Countdown এর জন্য)
// POST /api/user/exam-date
// Body: { examDate: string (ISO date) }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition — Profile Update এর একই "নিজের রো
// concurrent delete-account এর সাথে race" ক্লাস, প্রতিরোধমূলকভাবে
// ফিক্স করা হয়েছে): `update()` এর বদলে atomic `updateMany()` claim।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidDateString } from "@/lib/date-validation";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { examDate } = body;

  if (!examDate) {
    return NextResponse.json({ error: "তারিখ দিন" }, { status: 400 });
  }
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // lib/date-validation.ts এ বিস্তারিত): অবৈধ তারিখ স্ট্রিং দিলে
  // `new Date()` একটা Invalid Date অবজেক্ট বানায়, Prisma updateMany()
  // এ পাস করলে `PrismaClientValidationError` throw করে ৫০০ crash
  // করতো (updateMany() নিজে কখনো throw করে না — কিন্তু invalid data
  // ভ্যালু দিলে validation ধাপেই আটকে যায়, count-based ৪০৪ চেকের আগেই)।
  // লাইভ টেস্টে প্রমাণিত। ফিক্স: `new Date()` করার আগেই ভ্যালিডেশন।
  if (!isValidDateString(examDate)) {
    return NextResponse.json({ error: "সঠিক তারিখ দিন" }, { status: 400 });
  }

  const claimResult = await prisma.user.updateMany({
    where: { id: session.user.id },
    data: { examDate: new Date(examDate) },
  });

  if (claimResult.count === 0) {
    return NextResponse.json(
      { error: "ইউজার পাওয়া যায়নি (হয়তো অ্যাকাউন্ট ইতিমধ্যে ডিলিট হয়ে গেছে)" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
