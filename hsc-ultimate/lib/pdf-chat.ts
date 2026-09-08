// ===================================================================
// PDF Chat (RAG) — Core Logic
// -------------------------------------------------------------------
// পাইপলাইন: PDF বাফার → টেক্সট এক্সট্রাক্ট (pdf-parse, পাতা-ভিত্তিক) →
// প্রতিটা পাতাকে ছোট chunk এ ভাগ (overlap সহ, context না হারানোর জন্য) →
// Mistral Embeddings (mistral-embed মডেল, 1024-dim ভেক্টর) → Supabase
// pgvector কলামে সংরক্ষণ (raw SQL দিয়ে, কারণ Prisma "Unsupported" টাইপ
// সরাসরি ইনসার্ট/কোয়েরি সাপোর্ট করে না) → প্রশ্নের সময় embedding বানিয়ে
// cosine similarity দিয়ে top-K প্রাসঙ্গিক chunk খুঁজে বের করা → সেই chunk
// গুলো AI কে context হিসেবে দিয়ে উত্তর জেনারেট করা (hallucination কমানোর
// জন্য প্রম্পটে কড়াভাবে বলা আছে PDF এ না থাকলে স্পষ্ট করে বলতে)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { getAIResponse, type ChatMessage } from "@/lib/ai-provider";

const EMBEDDING_MODEL = "mistral-embed";
const EMBEDDING_DIMENSIONS = 1024;
const CHUNK_SIZE_CHARS = 1200; // প্রতিটা chunk এ আনুমানিক এই সংখ্যক অক্ষর
const CHUNK_OVERLAP_CHARS = 200; // chunk এর মধ্যে overlap, context না হারানোর জন্য
const MAX_CHUNKS_PER_DOC = 400; // একটা PDF এর জন্য সর্বোচ্চ chunk সংখ্যা (খুব বড় PDF আটকাতে)
const RETRIEVAL_TOP_K = 5; // প্রশ্নের জন্য কতগুলো প্রাসঙ্গিক chunk আনা হবে

export const MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024; // ১৫ MB সীমা
export const MAX_PDF_PAGES = 150; // পাতার সীমা (খুব বড় বই আটকাতে)
export const MAX_DOCS_PER_USER = 10; // ইউজার প্রতি সর্বোচ্চ কতটা PDF রাখা যাবে

interface PageText {
  pageNumber: number;
  text: string;
}

/**
 * Mistral Embeddings API দিয়ে একাধিক টেক্সটের ভেক্টর এমবেডিং বের করে।
 * (ব্যাচে পাঠানো যায়, কিন্তু rate-limit এড়াতে ছোট ব্যাচে ভাগ করে পাঠানো হয়)
 */
async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY পাওয়া যায়নি (.env.local দেখুন)");
  }

  const BATCH_SIZE = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const res = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: batch }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Mistral Embeddings API ব্যর্থ হয়েছে (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const embeddings = data?.data?.map((d: { embedding: number[] }) => d.embedding);
    if (!embeddings || embeddings.length !== batch.length) {
      throw new Error("Mistral Embeddings API থেকে অসম্পূর্ণ রেসপন্স এসেছে");
    }
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}

/** pgvector এ ইনসার্ট করার জন্য number[] কে "[0.1,0.2,...]" স্ট্রিং ফরম্যাটে রূপান্তর */
function vectorToSqlLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

/**
 * PDF বাফার থেকে পাতা-ভিত্তিক টেক্সট এক্সট্রাক্ট করে।
 * pdf-parse v2 API ব্যবহার করা হয়েছে (PDFParse ক্লাস)।
 */
async function extractPdfPages(buffer: Buffer): Promise<PageText[]> {
  // pdf-parse v2 সার্ভারলেস/বান্ডলার এনভায়রনমেন্টে (Next.js Turbopack সহ)
  // pdfjs-dist এর worker ফাইল নিজে থেকে খুঁজে পায় না ("Setting up fake worker
  // failed" এরর দেয়) — troubleshooting গাইড অনুযায়ী `pdf-parse/worker` থেকে
  // getPath() দিয়ে ম্যানুয়ালি worker সেট করে দিতে হয়, PDFParse ইম্পোর্টের আগে।
  const { getPath } = await import("pdf-parse/worker");
  const { PDFParse } = await import("pdf-parse");
  PDFParse.setWorker(getPath());

  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    // pdf-parse v2 প্রতিটা পাতার টেক্সট আলাদাভাবে result.pages[].text এ দেয়
    if (result.pages && result.pages.length > 0) {
      return result.pages.map((p, idx) => ({
        pageNumber: idx + 1,
        text: (p.text || "").trim(),
      }));
    }
    // fallback: পুরো টেক্সট এক পাতা হিসেবে
    return [{ pageNumber: 1, text: result.text.trim() }];
  } finally {
    await parser.destroy();
  }
}

/**
 * একটা পাতার টেক্সটকে overlap সহ ছোট chunk এ ভাগ করে
 * (paragraph বাউন্ডারি সম্মান করার চেষ্টা করে, একদম মাঝপথে না কেটে)।
 */
function chunkText(text: string): string[] {
  if (text.length <= CHUNK_SIZE_CHARS) {
    return text.length > 0 ? [text] : [];
  }

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE_CHARS, text.length);

    // শব্দের মাঝখানে কাটা এড়াতে, শেষের দিকে একটা স্পেস/নিউলাইন খুঁজে বের করা
    if (end < text.length) {
      const lastBreak = text.lastIndexOf("\n", end);
      const lastSpace = text.lastIndexOf(" ", end);
      const breakPoint = Math.max(lastBreak, lastSpace);
      if (breakPoint > start + CHUNK_SIZE_CHARS * 0.5) {
        end = breakPoint;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) chunks.push(chunk);

    if (end >= text.length) break;
    start = Math.max(end - CHUNK_OVERLAP_CHARS, start + 1);
  }
  return chunks;
}

/**
 * PDF আপলোডের পর ব্যাকগ্রাউন্ডে (fire-and-forget) প্রসেসিং করে:
 * টেক্সট এক্সট্রাক্ট → chunk → embedding → DB তে সংরক্ষণ → status আপডেট।
 */
export async function processUploadedPdf(documentId: string, buffer: Buffer): Promise<void> {
  try {
    const pages = await extractPdfPages(buffer);
    const totalText = pages.map((p) => p.text).join("");

    if (totalText.trim().length < 20) {
      await prisma.pdfDocument.update({
        where: { id: documentId },
        data: {
          status: "FAILED",
          errorMessage:
            "এই PDF থেকে কোনো টেক্সট বের করা যায়নি। এটা সম্ভবত স্ক্যান করা ছবি-ভিত্তিক PDF — শুধু টেক্সট-ভিত্তিক PDF সাপোর্ট করা হয়।",
        },
      });
      return;
    }

    // প্রতিটা পাতাকে chunk এ ভাগ করা, pageNumber ট্র্যাক রাখা
    const allChunks: { pageNumber: number; content: string }[] = [];
    for (const page of pages) {
      if (!page.text) continue;
      const pageChunks = chunkText(page.text);
      for (const c of pageChunks) {
        allChunks.push({ pageNumber: page.pageNumber, content: c });
      }
    }

    if (allChunks.length === 0) {
      await prisma.pdfDocument.update({
        where: { id: documentId },
        data: { status: "FAILED", errorMessage: "PDF থেকে কোনো ব্যবহারযোগ্য টেক্সট chunk তৈরি করা যায়নি।" },
      });
      return;
    }

    const limitedChunks = allChunks.slice(0, MAX_CHUNKS_PER_DOC);

    // Embedding ব্যাচে জেনারেট করা
    const texts = limitedChunks.map((c) => c.content);
    const embeddings = await getEmbeddings(texts);

    // raw SQL দিয়ে ইনসার্ট (Prisma Unsupported vector টাইপের জন্য দরকার)
    for (let i = 0; i < limitedChunks.length; i++) {
      const { pageNumber, content } = limitedChunks[i];
      const vecLiteral = vectorToSqlLiteral(embeddings[i]);
      await prisma.$executeRawUnsafe(
        `INSERT INTO "pdf_chunks" ("id", "documentId", "chunkIndex", "pageNumber", "content", "embedding", "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::vector, NOW())`,
        documentId,
        i,
        pageNumber,
        content,
        vecLiteral
      );
    }

    await prisma.pdfDocument.update({
      where: { id: documentId },
      data: {
        status: "READY",
        pageCount: pages.length,
        totalChunks: limitedChunks.length,
      },
    });
  } catch (err) {
    console.error("PDF প্রসেসিং এরর:", err);
    const message = err instanceof Error ? err.message : "অজানা এরর";
    await prisma.pdfDocument.update({
      where: { id: documentId },
      data: { status: "FAILED", errorMessage: `প্রসেসিং ব্যর্থ হয়েছে: ${message}` },
    }).catch(() => {});
  }
}

interface RetrievedChunk {
  content: string;
  pageNumber: number | null;
  similarity: number;
}

/**
 * ইউজারের প্রশ্নের এমবেডিং বানিয়ে pgvector cosine similarity দিয়ে
 * সবচেয়ে প্রাসঙ্গিক chunk গুলো খুঁজে বের করে।
 */
async function retrieveRelevantChunks(
  documentId: string,
  question: string
): Promise<RetrievedChunk[]> {
  const [questionEmbedding] = await getEmbeddings([question]);
  const vecLiteral = vectorToSqlLiteral(questionEmbedding);

  // <=> অপারেটর pgvector এ cosine distance দেয় (0 = অভিন্ন, 2 = সম্পূর্ণ বিপরীত)
  // similarity = 1 - distance হিসেবে দেখানো হচ্ছে (সহজবোধ্যতার জন্য)
  const rows = await prisma.$queryRawUnsafe<
    { content: string; pageNumber: number | null; distance: number }[]
  >(
    `SELECT "content", "pageNumber", ("embedding" <=> $1::vector) AS distance
     FROM "pdf_chunks"
     WHERE "documentId" = $2
     ORDER BY "embedding" <=> $1::vector
     LIMIT $3`,
    vecLiteral,
    documentId,
    RETRIEVAL_TOP_K
  );

  return rows.map((r) => ({
    content: r.content,
    pageNumber: r.pageNumber,
    similarity: 1 - r.distance,
  }));
}

const PDF_CHAT_SYSTEM_PROMPT = `তুমি "HSC Ultimate" প্ল্যাটফর্মের একজন AI সহকারী যে একটা নির্দিষ্ট PDF
ডকুমেন্ট (ছাত্রের নিজের নোট বা বইয়ের অংশ) নিয়ে প্রশ্নের উত্তর দিচ্ছো।

নিয়মাবলী:
- নিচে দেওয়া "PDF থেকে প্রাসঙ্গিক অংশ" এর ভিত্তিতেই উত্তর দেবে, নিজের বাইরের জ্ঞান থেকে অনুমান করে
  নতুন তথ্য যোগ করবে না
- যদি দেওয়া অংশে প্রশ্নের উত্তর না থাকে, স্পষ্টভাবে বলবে "এই তথ্যটা আপলোড করা PDF তে খুঁজে পাইনি"
  — নিজে থেকে অনুমান করে উত্তর বানাবে না (hallucination এড়াতে হবে)
- সহজ, বন্ধুত্বপূর্ণ বাংলায় উত্তর দেবে (প্রয়োজনে ইংরেজি টার্ম ব্র্যাকেটে)
- উত্তরের শেষে কোন পাতা থেকে তথ্যটা নেওয়া হয়েছে তা উল্লেখ করতে পারো (যদি প্রাসঙ্গিক হয়)
- ধাপে ধাপে বুঝিয়ে বলবে, প্রয়োজনে উদাহরণ দেবে`;

interface PdfChatAnswer {
  content: string;
  provider: string;
  citedPages: number[];
}

/**
 * PDF এর উপর ভিত্তি করে ইউজারের প্রশ্নের উত্তর জেনারেট করে (RAG)।
 * পূর্ববর্তী কথোপকথনের সংক্ষিপ্ত ইতিহাসও context হিসেবে পাঠানো হয়।
 */
export async function answerPdfQuestion(
  documentId: string,
  question: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[]
): Promise<PdfChatAnswer> {
  const relevantChunks = await retrieveRelevantChunks(documentId, question);

  if (relevantChunks.length === 0) {
    return {
      content: "এই PDF থেকে কোনো প্রাসঙ্গিক তথ্য খুঁজে পাওয়া যায়নি। PDF টা ঠিকমতো প্রসেস হয়েছে কিনা যাচাই করো।",
      provider: "none",
      citedPages: [],
    };
  }

  const contextText = relevantChunks
    .map((c, i) => `[অংশ ${i + 1}${c.pageNumber ? `, পাতা ${c.pageNumber}` : ""}]\n${c.content}`)
    .join("\n\n---\n\n");

  const citedPages = Array.from(
    new Set(relevantChunks.map((c) => c.pageNumber).filter((p): p is number => p !== null))
  ).sort((a, b) => a - b);

  const messages: ChatMessage[] = [
    { role: "system", content: PDF_CHAT_SYSTEM_PROMPT },
    { role: "system", content: `PDF থেকে প্রাসঙ্গিক অংশ:\n\n${contextText}` },
    // সাম্প্রতিক কথোপকথনের ইতিহাস (শেষ কয়েকটা মেসেজ, টোকেন সীমিত রাখতে)
    ...conversationHistory.slice(-6).map((m) => ({ role: m.role, content: m.content } as ChatMessage)),
    { role: "user", content: question },
  ];

  const result = await getAIResponse(messages, 1024);

  return {
    content: result.content,
    provider: result.provider,
    citedPages,
  };
}

// ===================================================================
// Audio Overview — PDF এর সারাংশ AI দিয়ে জেনারেট করা, তারপর বিদ্যমান
// Text-to-Speech বাটন (Web Speech API, Accessibility Pack) দিয়ে শোনা যায়।
// NotebookLM এর "Audio Overview" ফিচার থেকে অনুপ্রাণিত, কিন্তু সরলীকৃত —
// শুধু একটা well-structured বাংলা সারাংশ টেক্সট বানানো হয় (podcast-স্টাইল
// দুই-হোস্ট কথোপকথন/audio ফাইল জেনারেট করা হয় না, কারণ সেটা আলাদা TTS
// infrastructure/cost লাগবে — বিদ্যমান ফ্রি Web Speech API পুনর্ব্যবহার
// করাই এই ফিচারের মূল সুবিধা, কোনো নতুন cost/dependency ছাড়াই)।
// ===================================================================
const PDF_SUMMARY_SYSTEM_PROMPT = `তুমি "HSC Ultimate" প্ল্যাটফর্মের একজন AI সহকারী। ছাত্রের আপলোড করা একটা
PDF ডকুমেন্টের (নোট/বইয়ের অংশ) কিছু অংশ নিচে দেওয়া হলো। তোমার কাজ হলো
পুরো ডকুমেন্টের একটা সংক্ষিপ্ত, সহজবোধ্য বাংলা সারাংশ (audio তে শোনার জন্য
উপযুক্ত — flowing paragraph স্টাইলে, বুলেট পয়েন্ট/মার্কডাউন ছাড়া) লেখা।

নিয়মাবলী:
- ৩-৫টা প্যারাগ্রাফে মূল বিষয়বস্তু, গুরুত্বপূর্ণ সংজ্ঞা/সূত্র, ও মূল ধারণাগুলো
  সংক্ষেপে তুলে ধরবে
- সহজ, বন্ধুত্বপূর্ণ কথ্য বাংলায় লিখবে (যেন কাউকে মুখে মুখে বুঝিয়ে বলছো)
- বুলেট পয়েন্ট, হেডিং, markdown symbol ব্যবহার করবে না (এটা text-to-speech
  দিয়ে শোনানো হবে, তাই plain flowing sentence দরকার)
- শুধু দেওয়া অংশের ভিত্তিতেই সারাংশ লিখবে, বাইরের তথ্য যোগ করবে না
- ইংরেজি টার্ম/সংখ্যা দরকার হলে ব্যবহার করতে পারো কিন্তু বাক্য গঠন বাংলায় রাখবে`;

/**
 * একটা PDF ডকুমেন্টের সব chunk থেকে একটা প্রতিনিধিত্বমূলক sample নিয়ে
 * (পুরো ডকুমেন্ট একসাথে AI কে পাঠানো টোকেন-সীমার কারণে সম্ভব না) AI দিয়ে
 * একটা সারাংশ জেনারেট করে এবং DB তে cache করে রাখে।
 */
export async function generatePdfSummary(documentId: string): Promise<{
  summary: string;
  provider: string;
}> {
  // chunkIndex অনুযায়ী ক্রমানুসারে সব chunk আনা হচ্ছে (embedding দরকার নেই,
  // তাই সাধারণ Prisma query দিয়েই যথেষ্ট — raw SQL লাগবে না)
  const chunks = await prisma.pdfChunk.findMany({
    where: { documentId },
    orderBy: { chunkIndex: "asc" },
    select: { content: true },
  });

  if (chunks.length === 0) {
    throw new Error("এই PDF থেকে কোনো টেক্সট পাওয়া যায়নি, সারাংশ বানানো সম্ভব না");
  }

  // টোকেন-সীমার মধ্যে রাখতে সর্বোচ্চ ৩০টা chunk পর্যন্ত ব্যবহার করা হয় —
  // ৩০ এর বেশি হলে evenly-spaced sampling করা হয় (শুধু শুরুর অংশ না নিয়ে
  // পুরো ডকুমেন্ট জুড়ে প্রতিনিধিত্বমূলক sample নেওয়ার জন্য)
  const MAX_CHUNKS_FOR_SUMMARY = 30;
  let sampledChunks = chunks;
  if (chunks.length > MAX_CHUNKS_FOR_SUMMARY) {
    const step = chunks.length / MAX_CHUNKS_FOR_SUMMARY;
    sampledChunks = Array.from({ length: MAX_CHUNKS_FOR_SUMMARY }, (_, i) =>
      chunks[Math.floor(i * step)]
    );
  }

  const combinedText = sampledChunks.map((c) => c.content).join("\n\n");

  const messages: ChatMessage[] = [
    { role: "system", content: PDF_SUMMARY_SYSTEM_PROMPT },
    { role: "user", content: `PDF এর অংশসমূহ:\n\n${combinedText}\n\nএখন এই ডকুমেন্টের একটা সারাংশ লেখো।` },
  ];

  const result = await getAIResponse(messages, 1536);

  // 🐛 বাগ ফিক্স (PDF Chat Mind Map/Messages fix এর একই "সমাধান ৪"
  // ক্লাস — দীর্ঘ AI কলের পরে write): আগে `update()` ব্যবহার হতো,
  // AI কল চলাকালীন সময়ে concurrent DELETE এ ডকুমেন্ট মুছে গেলে
  // P2025 throw করে caller (route.ts) generic ৫০০ error দিতো।
  // ফিক্স: `updateMany()` (কখনো throw করে না) — cache miss হলেও
  // (matched 0) generated summary caller কে ঠিকই রিটার্ন করা হয়
  // (AI কলটা তো সফলই হয়েছিল, শুধু cache করা যায়নি কারণ document
  // আর নেই — ইউজার তখন ততক্ষণে document delete করে ফেলেছে, তাই
  // এই summary দেখানোর কোনো UI ও অবশিষ্ট নেই, কিন্তু অন্তত crash
  // হচ্ছে না)।
  await prisma.pdfDocument.updateMany({
    where: { id: documentId },
    data: { summary: result.content, summaryGeneratedAt: new Date() },
  });

  return { summary: result.content, provider: result.provider };
}

export { EMBEDDING_DIMENSIONS };
