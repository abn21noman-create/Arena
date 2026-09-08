// ===================================================================
// Topic Mind Map জেনারেশন
// POST /api/topics/[topicId]/mind-map
// -------------------------------------------------------------------
// Topic এর notesMarkdown থেকে AI দিয়ে একটা concept tree বানায় (cache
// করা হয়, ?regenerate=1 দিয়ে জোর করে নতুন করে বানানো যায়)।
//
// 🐛 বাগ ফিক্স (PDF Chat Mind Map fix এর একই "সমাধান ৪" ক্লাস —
// দীর্ঘ AI কলের পরে write): existence check এর পরে `generateMindMap()`
// (AI কল) হয়, তারপর `prisma.topic.update()`। Admin এই সময়ে concurrent
// টপিক delete করলে P2025 crash হতে পারতো (কম likely কারণ শুধু admin
// পারে, কিন্তু established audit pattern অনুযায়ী প্রতিরোধমূলকভাবে
// ফিক্স করা হয়েছে)। `update()` → `updateMany()`, matched 0 হলে
// গ্রেসফুল ৪০৪।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMindMap } from "@/lib/mind-map";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await params;
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });

  if (!topic) {
    return NextResponse.json({ error: "টপিক পাওয়া যায়নি" }, { status: 404 });
  }

  if (!topic.notesMarkdown?.trim()) {
    return NextResponse.json(
      { error: "এই টপিকে এখনো কোনো নোট নেই, তাই mind map বানানো সম্ভব না" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const forceRegenerate = searchParams.get("regenerate") === "1";

  if (topic.mindMap && !forceRegenerate) {
    return NextResponse.json({
      mindMap: topic.mindMap,
      generatedAt: topic.mindMapGeneratedAt,
      cached: true,
    });
  }

  try {
    const result = await generateMindMap(topic.notesMarkdown);
    const claimResult = await prisma.topic.updateMany({
      where: { id: topicId },
      data: {
        mindMap: result.mindMap as unknown as Prisma.InputJsonValue,
        mindMapGeneratedAt: new Date(),
      },
    });

    if (claimResult.count === 0) {
      return NextResponse.json(
        { error: "এই টপিকটা ইতিমধ্যে ডিলিট হয়ে গেছে" },
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
