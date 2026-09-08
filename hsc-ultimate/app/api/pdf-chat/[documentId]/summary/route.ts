// ===================================================================
// PDF Chat — Audio Overview (AI সারাংশ জেনারেশন)
// POST /api/pdf-chat/[documentId]/summary
// -------------------------------------------------------------------
// PDF এর chunk থেকে AI দিয়ে একটা বাংলা সারাংশ বানায় (cache করা হয়, বার
// বার জেনারেট করতে হয় না — ক্লায়েন্ট চাইলে ?regenerate=1 দিয়ে জোর করে
// নতুন করে বানাতে পারবে)। জেনারেট হওয়া টেক্সট বিদ্যমান TextToSpeechButton
// (Web Speech API) দিয়ে শোনা যাবে — কোনো নতুন audio-generation
// infrastructure লাগেনি।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePdfSummary } from "@/lib/pdf-chat";

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

  // Cache — আগে থেকেই সারাংশ থাকলে ও রিজেনারেট না চাইলে সেটাই ফেরত দেওয়া হয়
  // (অপ্রয়োজনীয় AI cost এড়াতে)
  if (document.summary && !forceRegenerate) {
    return NextResponse.json({
      summary: document.summary,
      generatedAt: document.summaryGeneratedAt,
      cached: true,
    });
  }

  try {
    const result = await generatePdfSummary(documentId);
    return NextResponse.json({
      summary: result.summary,
      generatedAt: new Date(),
      cached: false,
      provider: result.provider,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "সারাংশ বানানো যায়নি";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
