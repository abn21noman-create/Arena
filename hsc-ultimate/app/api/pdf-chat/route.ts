// ===================================================================
// PDF Chat — Document List + Upload API
// GET  /api/pdf-chat  -> ইউজারের সব আপলোড করা PDF (status সহ)
// POST /api/pdf-chat  -> নতুন PDF আপলোড (multipart/form-data, ফাইল)
// -------------------------------------------------------------------
// আপলোডের পর টেক্সট এক্সট্রাকশন+এমবেডিং জেনারেশন ব্যাকগ্রাউন্ডে (await
// ছাড়া) চালানো হয় যাতে রিকোয়েস্ট দ্রুত রেসপন্স দেয় ("PROCESSING" স্ট্যাটাস
// নিয়ে), ফ্রন্টএন্ড পোলিং করে "READY" হওয়া পর্যন্ত অপেক্ষা করবে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processUploadedPdf, MAX_PDF_SIZE_BYTES, MAX_DOCS_PER_USER } from "@/lib/pdf-chat";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const documents = await prisma.pdfDocument.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      originalFileName: true,
      pageCount: true,
      totalChunks: true,
      status: true,
      errorMessage: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "ফাইল আপলোড ফরম্যাট সঠিক নয়" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "কোনো ফাইল পাওয়া যায়নি" }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "শুধু PDF ফাইল আপলোড করা যাবে" }, { status: 400 });
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return NextResponse.json(
      { error: `ফাইলের সাইজ ${(MAX_PDF_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB এর বেশি হতে পারবে না` },
      { status: 400 }
    );
  }

  const titleRaw = formData.get("title");
  const title = typeof titleRaw === "string" && titleRaw.trim() ? titleRaw.trim() : file.name.replace(/\.pdf$/i, "");

  const buffer = Buffer.from(await file.arrayBuffer());

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত, Study Group/Quiz
  // Battle/Habit/Custom Question Set এর একই capacity-bypass race
  // condition ক্লাস — এখানে আরও বেশি গুরুত্বপূর্ণ কারণ প্রতিটা অতিরিক্ত
  // ডকুমেন্ট আসল AI embedding cost/storage ব্যবহার করে): আগে
  // `existingCount >= MAX_DOCS_PER_USER` চেক করে তারপর আলাদা `create()`
  // কল করা হতো (read-then-write) — লাইভ concurrency টেস্টে ৯টা বিদ্যমান
  // ডকুমেন্ট থাকা অবস্থায় ৫টা concurrent POST এ ৫টাই সফল হয়েছে
  // (প্রত্যাশিত ১টা), চূড়ান্ত count হয়েছিল ১৪টা (MAX_DOCS_PER_USER=10
  // bypass)। ফিক্স: Study Group এর established প্যাটার্ন অনুসরণ করে
  // `SELECT ... FOR UPDATE` দিয়ে User row কে transaction এর ভেতরে lock
  // করা হয়।
  let document;
  try {
    document = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${session.user.id} FOR UPDATE`;

      const existingCount = await tx.pdfDocument.count({ where: { userId: session.user.id } });
      if (existingCount >= MAX_DOCS_PER_USER) {
        throw new Error(`সর্বোচ্চ ${MAX_DOCS_PER_USER}টা PDF রাখা যাবে, পুরনো কিছু ডিলিট করে আবার চেষ্টা করো`);
      }

      return tx.pdfDocument.create({
        data: {
          userId: session.user.id,
          title,
          originalFileName: file.name,
          status: "PROCESSING",
        },
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF আপলোড করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // ব্যাকগ্রাউন্ডে প্রসেসিং শুরু (রেসপন্স ব্লক করবে না)
  processUploadedPdf(document.id, buffer).catch((err) => {
    console.error("PDF ব্যাকগ্রাউন্ড প্রসেসিং এরর:", err);
  });

  return NextResponse.json({ document }, { status: 201 });
}
