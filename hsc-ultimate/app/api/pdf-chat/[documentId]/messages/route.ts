// ===================================================================
// PDF Chat — কথোপকথন হিস্ট্রি + নতুন প্রশ্ন
// GET  /api/pdf-chat/[documentId]/messages -> পুরনো চ্যাট হিস্ট্রি
// POST /api/pdf-chat/[documentId]/messages -> নতুন প্রশ্ন, AI উত্তর (RAG)
// Body (POST): { question: string }
//
// 🐛 বাগ ফিক্স (Study Group Leave fix এর ধারাবাহিকতায় আরও Bug Hunt
// চালিয়ে PDF Chat এলাকায় আবিষ্কৃত, established "existence check-then-
// write with FK dependency" ক্লাসের নতুন instance): আগে existence
// check (`getOwnedDocument`) এর পরে সরাসরি `prisma.pdfChatMessage.
// create()` কল করা হতো (২ বার — প্রথমে ইউজারের প্রশ্ন, তারপর AI উত্তর
// আসার পরে assistant মেসেজ)। AI উত্তর জেনারেশন (RAG + LLM কল) কয়েক
// সেকেন্ড সময় নেয়, যা একটা বড় race window তৈরি করে — এই সময়ের ভেতরে
// concurrent `DELETE /api/pdf-chat/[documentId]` ডকুমেন্ট (cascade এ
// chunks সহ) মুছে ফেললে, AI কল শেষ হওয়ার পরে assistant message
// `create()` করার সময় FK constraint violation (P2003) হয়ে সরাসরি
// ৫০০ crash করতো। লাইভ টেস্টে ৮/৮ (১০০%) crash rate প্রমাণিত হয়েছে —
// এই সেশনের সর্বোচ্চ crash-rate bug এর একটি।
//
// এখানে established `updateMany()`/`SELECT ... FOR UPDATE` প্যাটার্ন
// সরাসরি প্রযোজ্য না — কারণ AI কল কয়েক সেকেন্ড ধরে চলে, এই পুরো সময়
// document row কে transaction এর ভেতরে lock করে রাখা (`FOR UPDATE`)
// একটা গুরুতর anti-pattern হতো (external I/O কে DB transaction এর
// ভেতরে রাখা, যা DELETE কে বহুক্ষণ ব্লক করে রাখতো এবং connection
// pool/transaction timeout ঝুঁকি তৈরি করতো)। তাই এখানে ভিন্ন সমাধান:
// উভয় `create()` কলকে P2003 (foreign key constraint violation) এর
// জন্য catch করে গ্রেসফুলভাবে ৪০৪ রিটার্ন করা হয়েছে ("ডকুমেন্টটা
// ইতিমধ্যে ডিলিট হয়ে গেছে") — কোনো crash সম্ভব না, এবং error message
// টাও যথাযথ (generic ৫০০ "সমস্যা হয়েছে" এর বদলে সঠিক root cause)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { answerPdfQuestion } from "@/lib/pdf-chat";

// Prisma error object এ P2003 (foreign key constraint violation) কিনা
// যাচাই করার হেল্পার — ডকুমেন্ট concurrent delete হয়ে গেলে এই কোড আসে
function isForeignKeyViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2003"
  );
}

async function getOwnedDocument(documentId: string, userId: string) {
  return prisma.pdfDocument.findFirst({ where: { id: documentId, userId } });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { documentId } = await params;
  const document = await getOwnedDocument(documentId, session.user.id);
  if (!document) {
    return NextResponse.json({ error: "ডকুমেন্ট পাওয়া যায়নি" }, { status: 404 });
  }

  const messages = await prisma.pdfChatMessage.findMany({
    where: { documentId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { documentId } = await params;
  const document = await getOwnedDocument(documentId, session.user.id);
  if (!document) {
    return NextResponse.json({ error: "ডকুমেন্ট পাওয়া যায়নি" }, { status: 404 });
  }

  if (document.status !== "READY") {
    return NextResponse.json(
      { error: "PDF এখনো প্রসেস হচ্ছে বা প্রসেসিং ব্যর্থ হয়েছে, একটু অপেক্ষা করো" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { question } = body as { question?: string };

  if (!question || typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "প্রশ্ন লিখতে হবে" }, { status: 400 });
  }

  const trimmedQuestion = question.trim().slice(0, 2000);

  // পূর্ববর্তী কথোপকথনের ইতিহাস আনা (context এর জন্য)
  const historyRows = await prisma.pdfChatMessage.findMany({
    where: { documentId },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
  const conversationHistory = historyRows.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // ইউজারের প্রশ্ন সংরক্ষণ — concurrent delete এ document ততক্ষণে
  // মুছে গেলে P2003 catch করে ৪০৪ রিটার্ন করা হচ্ছে (crash না)
  try {
    await prisma.pdfChatMessage.create({
      data: { documentId, role: "user", content: trimmedQuestion },
    });
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      return NextResponse.json(
        { error: "এই ডকুমেন্টটা ইতিমধ্যে ডিলিট হয়ে গেছে" },
        { status: 404 }
      );
    }
    throw err;
  }

  try {
    const answer = await answerPdfQuestion(documentId, trimmedQuestion, conversationHistory);

    const assistantMessage = await prisma.pdfChatMessage.create({
      data: {
        documentId,
        role: "assistant",
        content: answer.content,
        citedPages: answer.citedPages.length > 0 ? answer.citedPages.join(",") : null,
        provider: answer.provider,
      },
    });

    return NextResponse.json({ message: assistantMessage });
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      // AI কল চলাকালীন সময়ে ডকুমেন্টটা concurrent DELETE এ মুছে গেছে
      // (RAG+LLM কল কয়েক সেকেন্ড নেয় বলে এই race window স্বাভাবিক) —
      // ইউজারের প্রশ্ন (উপরে) সেভ হয়ে গিয়েছিল কিন্তু document cascade
      // এ সেটাও ততক্ষণে মুছে গেছে, তাই এখানে আর আলাদা cleanup লাগে না
      return NextResponse.json(
        { error: "এই ডকুমেন্টটা ইতিমধ্যে ডিলিট হয়ে গেছে" },
        { status: 404 }
      );
    }
    console.error("PDF Chat উত্তর জেনারেশন এরর:", err);
    return NextResponse.json(
      { error: "উত্তর তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করো" },
      { status: 500 }
    );
  }
}
