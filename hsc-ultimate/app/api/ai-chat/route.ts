// ===================================================================
// AI Doubt Solver API Route
// -------------------------------------------------------------------
// GET  /api/ai-chat  -> লগইন করা ইউজারের চ্যাট হিস্ট্রি লোড করে
// POST /api/ai-chat  -> নতুন মেসেজ পাঠায়, DB তে সেভ করে, AI রেসপন্স দেয়
// Body (POST): { message: string, imageUrl?: string (data URL) }
//
// এটা lib/ai-provider.ts এর multi-provider fallback চেইন ব্যবহার করে।
// ছবি থাকলে vision-capable provider (Mistral Pixtral) ব্যবহার হয়,
// না থাকলে সাধারণ টেক্সট চেইন (Groq প্রাইমারি)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAIResponse,
  getVisionResponse,
  HSC_TUTOR_SYSTEM_PROMPT,
  HSC_TUTOR_SOCRATIC_PROMPT,
  type ChatMessage,
} from "@/lib/ai-provider";
import { validateImageDataUrlSize } from "@/lib/image-validation";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";

const HISTORY_LIMIT = 50; // সাম্প্রতিক এত টা মেসেজ context হিসেবে পাঠানো হবে

// DIRECT mode এ ছবি পাঠালে সরাসরি ধাপে ধাপে সমাধান দেওয়ার নির্দেশ
const VISION_PROMPT_SUFFIX_DIRECT = `\n\nইউজার একটা ছবি পাঠিয়েছে (সাধারণত অংক/প্রশ্নের ছবি)। ছবিটা মনোযোগ দিয়ে দেখে
প্রশ্নটা বুঝে ধাপে ধাপে সমাধান করে দাও।`;

// SOCRATIC mode এ ছবি পাঠালেও সরাসরি সমাধান না দিয়ে গাইডিং প্রশ্ন করার নির্দেশ
const VISION_PROMPT_SUFFIX_SOCRATIC = `\n\nইউজার একটা ছবি পাঠিয়েছে (সাধারণত অংক/প্রশ্নের ছবি)। ছবিটা মনোযোগ দিয়ে দেখো,
কিন্তু সরাসরি সমাধান বলে দিও না — Socratic পদ্ধতি অনুযায়ী প্রথমে জিজ্ঞেস করো
শিক্ষার্থী এই সমস্যাটা কীভাবে শুরু করবে বলে মনে করছে।`;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const [messages, user] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: HISTORY_LIMIT,
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { aiTutorMode: true },
    }),
  ]);

  return NextResponse.json({ messages, aiTutorMode: user?.aiTutorMode ?? "DIRECT" });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  await prisma.chatMessage.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const limited = await enforceRateLimit(
    req,
    "aiChat",
    makeRateLimitKey(req, "ai-chat", session.user.id)
  );
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const userMessage: string = body.message ?? "";
    const imageUrl: string | undefined = body.imageUrl;

    if (!userMessage.trim() && !imageUrl) {
      return NextResponse.json(
        { error: "কোনো মেসেজ বা ছবি পাওয়া যায়নি" },
        { status: 400 }
      );
    }

    // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ
    // আবিষ্কৃত): আগে imageUrl এর কোনো ব্যাকএন্ড সাইজ ভ্যালিডেশন
    // ছিল না (শুধু frontend এ ৫MB চেক, যেটা সরাসরি API কল করে bypass
    // করা যায়)। লাইভ টেস্টে ~১৫MB oversized data URL পাঠিয়ে AI
    // provider সেটা reject করে দিয়েছে এবং সেই error unhandled থেকে
    // ৫০০ crash হয়েছে (৪০০ হওয়া উচিত ছিল)। ফিক্স: custom-question-
    // sets এর established সাইজ লিমিট এখানেও প্রয়োগ করা হয়েছে —
    // ব্যয়বহুল/ব্যর্থ হতে বাধ্য AI কল হওয়ার আগেই ব্লক করা হয়।
    if (imageUrl) {
      const sizeCheck = validateImageDataUrlSize(imageUrl);
      if (!sizeCheck.valid) {
        return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
      }
    }

    // ইউজারের বর্তমান AI Tutor মোড (DIRECT/SOCRATIC) পড়া হচ্ছে
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { aiTutorMode: true },
    });
    const tutorMode = user?.aiTutorMode ?? "DIRECT";
    const isSocratic = tutorMode === "SOCRATIC";
    const systemPrompt = isSocratic ? HSC_TUTOR_SOCRATIC_PROMPT : HSC_TUTOR_SYSTEM_PROMPT;
    const visionSuffix = isSocratic ? VISION_PROMPT_SUFFIX_SOCRATIC : VISION_PROMPT_SUFFIX_DIRECT;

    // ইউজারের মেসেজ সাথে সাথেই DB তে সেভ করা হচ্ছে
    await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        role: "user",
        content: userMessage,
        imageUrl: imageUrl ?? null,
      },
    });

    // পূর্ববর্তী কথোপকথনের হিস্ট্রি নিয়ে আসা হচ্ছে (context এর জন্য)
    const previousMessages = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: HISTORY_LIMIT,
    });

    let result;

    if (imageUrl) {
      // ছবি থাকলে vision provider ব্যবহার — শুধু বর্তমান প্রশ্ন + ছবি পাঠানো হচ্ছে
      // (vision মডেলে পুরনো history পাঠালে জটিলতা বাড়ে, তাই simple রাখা হয়েছে)
      const visionMessages: ChatMessage[] = [
        { role: "system", content: systemPrompt + visionSuffix },
        {
          role: "user",
          content: [
            { type: "text", text: userMessage || "এই ছবিতে কী আছে, ব্যাখ্যা করে সমাধান দাও।" },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ];
      result = await getVisionResponse(visionMessages);
    } else {
      // টেক্সট-ওনলি হলে পুরো conversation history context হিসেবে পাঠানো হচ্ছে
      const contextMessages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...previousMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];
      result = await getAIResponse(contextMessages);
    }

    // AI এর উত্তর DB তে সেভ করা হচ্ছে (কোন মোডে উত্তর তৈরি হয়েছে তাও রেকর্ড রাখা হয়)
    await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        role: "assistant",
        content: result.content,
        provider: result.provider,
        tutorMode,
      },
    });

    return NextResponse.json({
      content: result.content,
      provider: result.provider,
      tutorMode,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "অজানা সমস্যা হয়েছে";
    console.error("AI Chat Error:", message);
    return NextResponse.json(
      { error: "দুঃখিত, এই মুহূর্তে AI উত্তর দিতে পারছে না। একটু পরে চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
