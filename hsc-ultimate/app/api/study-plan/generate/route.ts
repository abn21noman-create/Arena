// ===================================================================
// AI দিয়ে নতুন Study Plan জেনারেট করা
// POST /api/study-plan/generate
// Body: { durationDays?: number } — না দিলে ডিফল্ট ৭ দিন
// -------------------------------------------------------------------
// আগের প্ল্যান থাকলে মুছে ফেলে নতুন প্ল্যান বানায় (weak topics + exam
// countdown বিশ্লেষণ করে)। durationDays ৩০ এর বেশি হলে প্রথম ৩০ দিন
// সাথে সাথে জেনারেট হয়ে রেসপন্স যায়, বাকি দিনগুলো ব্যাকগ্রাউন্ডে
// (fire-and-forget, response block করে না) ধাপে ধাপে জেনারেট হতে
// থাকে — ক্লায়েন্ট `GET /api/study-plan` পোলিং করে generationStatus
// দেখে অগ্রগতি জানতে পারবে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  generateStudyPlan,
  generateRemainingChunks,
  clampDurationDays,
  MIN_DURATION_DAYS,
  MAX_DURATION_DAYS,
} from "@/lib/study-plan-generator";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { durationDays } = body as { durationDays?: number };

  if (
    durationDays !== undefined &&
    (typeof durationDays !== "number" ||
      !Number.isFinite(durationDays) ||
      durationDays < MIN_DURATION_DAYS ||
      durationDays > MAX_DURATION_DAYS)
  ) {
    return NextResponse.json(
      { error: `durationDays অবশ্যই ${MIN_DURATION_DAYS}-${MAX_DURATION_DAYS} এর মধ্যে একটা সংখ্যা হতে হবে` },
      { status: 400 }
    );
  }

  try {
    const { plan, needsMoreChunks } = await generateStudyPlan(
      session.user.id,
      clampDurationDays(durationDays ?? 7)
    );

    // ব্যাকগ্রাউন্ডে বাকি chunk জেনারেট করা (await ছাড়া, fire-and-forget —
    // custom-question-gen.ts এর processImageToQuestions() এর একই প্যাটার্ন)
    if (needsMoreChunks) {
      generateRemainingChunks(plan.id).catch((err) => {
        console.error("generateRemainingChunks ব্যর্থ (ইতিমধ্যে ভেতরে হ্যান্ডল করা হয়):", err);
      });
    }

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("Study Plan Generation Error:", err);
    const message =
      err instanceof Error ? err.message : "স্টাডি প্ল্যান তৈরি করতে সমস্যা হয়েছে";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
