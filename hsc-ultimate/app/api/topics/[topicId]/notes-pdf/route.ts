// ===================================================================
// Downloadable PDF Notes — একটা Topic এর Text Notes + Formula Sheet কে
// PDF এ এক্সপোর্ট করে ডাউনলোড হিসেবে পাঠায় (অফলাইনে পড়ার জন্য)
// GET /api/topics/[topicId]/notes-pdf
// -------------------------------------------------------------------
// app/api/report-card/route.ts এর একই প্যাটার্ন — renderToBuffer() দিয়ে
// server-side (Node runtime) এ PDF বাইনারি জেনারেট করা হয়।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopicNotesDocument, type TopicNotesPdfData } from "@/lib/topic-notes-pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { chapter: { include: { subject: true } } },
  });

  if (!topic) {
    return NextResponse.json({ error: "টপিক পাওয়া যায়নি" }, { status: 404 });
  }

  // কোনো নোট/ফর্মুলা শীট নেই এমন টপিকের জন্যও PDF জেনারেট করা যায়
  // (খালি অংশে "যোগ করা হয়নি" বার্তা দেখায়) — ব্লক করার প্রয়োজন নেই

  const data: TopicNotesPdfData = {
    subjectName: topic.chapter.subject.name,
    chapterName: topic.chapter.name,
    topicName: topic.name,
    topicNameEn: topic.nameEn,
    isImportant: topic.isImportant,
    notesMarkdown: topic.notesMarkdown,
    formulaSheet: topic.formulaSheet,
    generatedAt: new Date().toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  try {
    const pdfBuffer = await renderToBuffer(TopicNotesDocument({ data }));

    const asciiFileName = "HSC-Ultimate-Topic-Notes.pdf";
    const utf8FileName = `HSC-Ultimate-${topic.nameEn}-নোট.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodeURIComponent(utf8FileName)}`,
      },
    });
  } catch (err) {
    console.error("Topic Notes PDF Generation Error:", err);
    return NextResponse.json(
      { error: "নোট PDF তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
