// ===================================================================
// Custom Question Set — লিস্ট + আপলোড/জেনারেট
// GET  /api/custom-question-sets  -> ইউজারের সব সেট (status সহ)
// POST /api/custom-question-sets  -> নতুন সেট তৈরি (ছবি + questionType)
// Body (POST): { imageUrl: string (data URL), questionType: "MCQ"|"CQ", title?: string }
// -------------------------------------------------------------------
// আপলোডের পর ছবি→OCR→AI প্রশ্ন জেনারেশন ব্যাকগ্রাউন্ডে (await ছাড়া) চলে,
// PDF Chat এর processUploadedPdf() প্যাটার্ন অনুসরণ করে — রিকোয়েস্ট দ্রুত
// রেসপন্স দেয় ("PROCESSING" স্ট্যাটাস নিয়ে), ফ্রন্টএন্ড পোলিং করে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processImageToQuestions } from "@/lib/custom-question-gen";
import { validateImageDataUrlSize } from "@/lib/image-validation";

const MAX_SETS_PER_USER = 20;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const sets = await prisma.customQuestionSet.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      questionType: true,
      status: true,
      errorMessage: true,
      createdAt: true,
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sets });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { imageUrl, questionType, title } = body as {
    imageUrl?: string;
    questionType?: "MCQ" | "CQ";
    title?: string;
  };

  if (!imageUrl) {
    return NextResponse.json({ error: "ছবি পাওয়া যায়নি" }, { status: 400 });
  }
  if (questionType !== "MCQ" && questionType !== "CQ") {
    return NextResponse.json({ error: "questionType MCQ অথবা CQ হতে হবে" }, { status: 400 });
  }
  // 🐛 বাগ ফিক্স (রিফ্যাক্টর — lib/image-validation.ts এ শেয়ার্ড
  // ফাংশনে তোলা হয়েছে, বিস্তারিত সেই ফাইলের কমেন্টে): এই সাইজ
  // ভ্যালিডেশন logic এখন `ai-chat`/`ocr-extract`/flashcard IMAGE_
  // OCCLUSION endpoint এও পুনর্ব্যবহার করা হচ্ছে, যেগুলোতে আগে এই
  // চেক ছিল না।
  const sizeCheck = validateImageDataUrlSize(imageUrl);
  if (!sizeCheck.valid) {
    return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
  }

  const finalTitle = title?.trim().slice(0, 100) || `${questionType} সেট - ${new Date().toLocaleDateString("bn-BD")}`;

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত, Study Group/Quiz
  // Battle/Habit এর একই capacity-bypass race condition ক্লাস): আগে
  // `existingCount >= MAX_SETS_PER_USER` চেক করে তারপর আলাদা `create()`
  // কল করা হতো (read-then-write) — লাইভ concurrency টেস্টে ১৯টা বিদ্যমান
  // সেট থাকা অবস্থায় ৫টা concurrent POST এ ৫টাই সফল হয়েছে (প্রত্যাশিত
  // ১টা), চূড়ান্ত count হয়েছিল ২৪টা (MAX_SETS_PER_USER=20 bypass)।
  // ফিক্স: Study Group এর established প্যাটার্ন অনুসরণ করে `SELECT ...
  // FOR UPDATE` দিয়ে User row কে transaction এর ভেতরে lock করা হয়।
  let set;
  try {
    set = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${session.user.id} FOR UPDATE`;

      const existingCount = await tx.customQuestionSet.count({ where: { userId: session.user.id } });
      if (existingCount >= MAX_SETS_PER_USER) {
        throw new Error(`সর্বোচ্চ ${MAX_SETS_PER_USER}টা সেট রাখা যাবে, পুরনো কিছু ডিলিট করে আবার চেষ্টা করো`);
      }

      return tx.customQuestionSet.create({
        data: {
          userId: session.user.id,
          title: finalTitle,
          questionType,
          status: "PROCESSING",
        },
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "সেট তৈরি করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  processImageToQuestions(set.id, imageUrl, questionType).catch((err) => {
    console.error("Custom Question ব্যাকগ্রাউন্ড প্রসেসিং এরর:", err);
  });

  return NextResponse.json({ set }, { status: 201 });
}
