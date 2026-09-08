// ===================================================================
// PDF Chat — Mind Map জেনারেশন
// POST /api/pdf-chat/[documentId]/mind-map
// -------------------------------------------------------------------
// PDF এর chunk থেকে AI দিয়ে একটা concept tree বানায় (cache করা হয়,
// ?regenerate=1 দিয়ে জোর করে নতুন করে বানানো যায়)। PDF Chat এর বিদ্যমান
// chunk sampling প্যাটার্ন (Audio Overview ফিচারে ব্যবহৃত) অনুসরণ করা হয়েছে।
//
// 🐛 বাগ ফিক্স (PDF Chat Message vs Delete race fix এর ধারাবাহিকতায়
// আবিষ্কৃত, established "সমাধান ৪" — দীর্ঘ বহিরাগত AI কলের পরে write
// — এরই আরেকটা instance): existence check এর পরে `generateMindMap()`
// (AI কল, কয়েক সেকেন্ড) হয়, তারপর ফলাফল cache করতে
// `prisma.pdfDocument.update()` কল হতো। এই সময়ে concurrent `DELETE
// /api/pdf-chat/[documentId]` ডকুমেন্ট মুছে ফেললে `update()` P2025
// ("record not found") throw করে সরাসরি ৫০০ crash করতো। লাইভ টেস্টে
// ৬/৬ (১০০%) crash rate প্রমাণিত হয়েছে।
//
// PDF Chat Messages fix এর মতোই এখানেও `$transaction`+`FOR UPDATE`
// ইচ্ছাকৃতভাবে এড়ানো হয়েছে (AI কলের সময় DB transaction/row-lock খোলা
// রাখা anti-pattern)। ফিক্স: `update()` এর বদলে atomic `updateMany()`
// (কখনো throw করে না) ব্যবহার করে, matched count 0 হলে ডকুমেন্টটা
// ততক্ষণে delete হয়ে গেছে বুঝে গ্রেসফুল ৪০৪ রিটার্ন করা হয়েছে (AI
// call এর ফলাফল এমনিতেও অকেজো, কারণ document আর নেই)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMindMap } from "@/lib/mind-map";

const MAX_CHUNKS_FOR_MINDMAP = 20;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { documentId } = await params;
  const document = await prisma.pdfDocument.findFirst({
    where: { id: documentId, userId: session.user.id },
  });

  if (!document) {
    return NextResponse.json({ error: "ডকুমেন্ট পাওয়া যায়নি" }, { status: 404 });
  }

  if (document.status !== "READY") {
    return NextResponse.json(
      { error: "PDF এখনো প্রসেস হয়নি, একটু অপেক্ষা করো" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const forceRegenerate = searchParams.get("regenerate") === "1";

  if (document.mindMap && !forceRegenerate) {
    return NextResponse.json({
      mindMap: document.mindMap,
      generatedAt: document.mindMapGeneratedAt,
      cached: true,
    });
  }

  try {
    const chunks = await prisma.pdfChunk.findMany({
      where: { documentId },
      orderBy: { chunkIndex: "asc" },
      select: { content: true },
    });

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "এই PDF থেকে কোনো টেক্সট পাওয়া যায়নি" },
        { status: 400 }
      );
    }

    let sampled = chunks;
    if (chunks.length > MAX_CHUNKS_FOR_MINDMAP) {
      const step = chunks.length / MAX_CHUNKS_FOR_MINDMAP;
      sampled = Array.from({ length: MAX_CHUNKS_FOR_MINDMAP }, (_, i) =>
        chunks[Math.floor(i * step)]
      );
    }

    const combinedText = sampled.map((c) => c.content).join("\n\n");
    const result = await generateMindMap(combinedText);

    const claimResult = await prisma.pdfDocument.updateMany({
      where: { id: documentId },
      data: {
        mindMap: result.mindMap as unknown as Prisma.InputJsonValue,
        mindMapGeneratedAt: new Date(),
      },
    });

    if (claimResult.count === 0) {
      // AI কল চলাকালীন সময়ে ডকুমেন্টটা concurrent DELETE এ মুছে গেছে
      return NextResponse.json(
        { error: "এই ডকুমেন্টটা ইতিমধ্যে ডিলিট হয়ে গেছে" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      mindMap: result.mindMap,
      generatedAt: new Date(),
      cached: false,
      provider: result.provider,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mind map বানানো যায়নি";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
