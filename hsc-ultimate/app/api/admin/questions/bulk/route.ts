// ===================================================================
// Admin: CSV থেকে Bulk প্রশ্ন আপলোড
// POST /api/admin/questions/bulk
// Body: { topicId: string, csvText: string }
// -------------------------------------------------------------------
// CSV ফরম্যাট (হেডার সহ):
// text,option1,option2,option3,option4,correctAnswer,explanation,difficulty,boardYear,boardName
// (boardYear ও boardName ঐচ্ছিক — এই বোর্ড পরীক্ষার প্রশ্ন হলে, না হলে খালি রাখা যায়)
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition, Admin Notification Broadcast এর একই
// "bulk read-then-bulk-write with FK dependency" ক্লাস, লাইভ টেস্টে
// প্রমাণিত): আগে `topicId` existence check (`findUnique`) করার পরে
// আলাদা ধাপে `prisma.question.createMany()` কল করা হতো — এই দুই
// ধাপের মাঝের window এ যদি concurrent `DELETE
// /api/admin/topics/[topicId]` কল দিয়ে সেই টপিক ডিলিট হয়ে যায়,
// তাহলে createMany() এ FK constraint violation (`questions_topicId_
// fkey`, P2003) হয়ে পুরো bulk upload ৫০০ crash করতো (১৫ iteration
// লাইভ টেস্টে ৫টা crash প্রমাণিত)। Notification Broadcast এর মতো
// `INSERT ... SELECT` approach এখানে উপযুক্ত না (CSV row থেকে আসা
// ভিন্ন ভিন্ন কলাম ভ্যালু নিয়ে multi-row insert, raw SQL এ প্রতিটা
// row এর জন্য placeholder generate করা জটিল ও error-prone) — তাই
// ভিন্ন সমাধান: `$transaction` এর ভেতরে `SELECT ... FOR UPDATE` দিয়ে
// topic row এ row-level lock নেওয়া হয়, যতক্ষণ এই transaction চলবে
// ততক্ষণ অন্য কোনো transaction (যেমন topic delete) এই row আপডেট/
// ডিলিট করতে পারবে না (block হয়ে অপেক্ষা করবে) — এতে existence
// check ও write একই transaction এর ভেতরে atomic হয়ে যায়, কোনো race
// window থাকে না। isolated টেস্টে ভেরিফাই করা হয়েছে যে concurrent
// delete সত্যিই lock ছাড়ার আগ পর্যন্ত block হয়ে থাকে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";
import { isValidOptionalBoardYear } from "@/lib/numeric-validation";

interface ParsedRow {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  boardYear: number | null;
  boardName: string | null;
}

// সাধারণ CSV parser — quoted field এ কমা থাকলেও ঠিকভাবে ভাঙে
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(csvText: string): ParsedRow[] {
  const lines = csvText.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const rows: ParsedRow[] = [];
  // প্রথম লাইন হেডার, বাদ দেওয়া হচ্ছে
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 6) continue; // অন্তত text, ৪টা option, correctAnswer লাগবে

    const [
      text,
      opt1,
      opt2,
      opt3,
      opt4,
      correctAnswer,
      explanation = "",
      difficulty = "MEDIUM",
      boardYearRaw = "",
      boardNameRaw = "",
    ] = cols;
    if (!text?.trim() || !correctAnswer?.trim()) continue;

    // 🐛 বাগ ফিক্স (Boolean/Numeric Validation bug hunt সিরিজের
    // ধারাবাহিকতা, established hscBatch এর একই ক্লাস — lib/numeric-
    // validation.ts এ বিস্তারিত): আগে শুধু `!Number.isNaN()` চেক
    // ছিল — এটা extreme digit-string/scientific-notation
    // ("1e300") ফিল্টার করত না (Number.isNaN(1e300) === false),
    // যা পরে Prisma তে ৬৪-বিট overflow crash ঘটাতো (লাইভ টেস্টে
    // পুরো bulk upload ৫০০ crash প্রমাণিত, একটামাত্র invalid row
    // এর কারণে বাকি সব ভ্যালিড row-ও reject হয়ে যেত)। এখন
    // `isValidOptionalBoardYear()` (safe-integer + বাস্তবসম্মত
    // রেঞ্জ) দিয়ে চেক করে অবৈধ হলে সেই row-এর boardYear শুধু
    // null করে বাকি row process চালিয়ে যাওয়া হচ্ছে (bulk-import
    // এ একটা কলামের সমস্যায় পুরো row বাতিল করাটা বেশি কড়া,
    // established "fail-open non-critical metadata" নীতি অনুসরণ
    // করে শুধু boardYear silently drop করা হচ্ছে, বাকি প্রশ্নের
    // ডেটা অক্ষত থাকে)।
    const trimmedBoardYear = boardYearRaw.trim();
    const rawParsedBoardYear = trimmedBoardYear ? Number(trimmedBoardYear) : null;
    const finalBoardYear = isValidOptionalBoardYear(rawParsedBoardYear)
      ? rawParsedBoardYear
      : null;

    rows.push({
      text: text.trim(),
      options: [opt1, opt2, opt3, opt4].map((o) => o.trim()).filter(Boolean),
      correctAnswer: correctAnswer.trim(),
      explanation: explanation.trim(),
      difficulty: ["EASY", "MEDIUM", "HARD"].includes(difficulty.trim().toUpperCase())
        ? difficulty.trim().toUpperCase()
        : "MEDIUM",
      // ঐচ্ছিক বোর্ড তথ্য — কলাম না থাকলে বা খালি/অবৈধ হলে null
      // (backward compatible, পুরনো ফরম্যাটের CSV এখনো ঠিকভাবে
      // কাজ করবে)
      boardYear: finalBoardYear,
      boardName: boardNameRaw.trim() || null,
    });
  }

  return rows;
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const body = await req.json().catch(() => ({}));
  const { topicId, csvText } = body;

  if (!topicId || !csvText?.trim()) {
    return NextResponse.json({ error: "topicId ও csvText আবশ্যক" }, { status: 400 });
  }

  // দ্রুত existence check (৪০৪ early-return এর জন্য, ব্যবহারকারীকে দ্রুত
  // ফিডব্যাক দিতে) — নিচের transaction এ আবার FOR UPDATE লক নিয়ে
  // authoritative চেক হবে, এটা শুধু obviously-invalid topicId এর
  // জন্য দ্রুত পথ (CSV parse এর আগে)
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return NextResponse.json({ error: "টপিক পাওয়া যায়নি" }, { status: 404 });
  }

  const rows = parseCSV(csvText);
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "কোনো ভ্যালিড রো পাওয়া যায়নি। CSV ফরম্যাট চেক করুন।" },
      { status: 400 }
    );
  }

  // atomic: FOR UPDATE row-lock + createMany একই transaction এ —
  // topic delete concurrent হলে হয় লক না পাওয়া পর্যন্ত block হবে
  // (delete পরে ৪০৪ পাবে) অথবা এই transaction এর ভেতরে টপিক আর
  // না-পাওয়া গেলে পরিষ্কারভাবে ৪০৪ রিটার্ন করা হবে — কোনো অবস্থাতেই
  // FK violation crash সম্ভব না
  let created: { count: number };
  try {
    created = await prisma.$transaction(async (tx) => {
      const lockedTopic = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "topics" WHERE id = ${topicId} FOR UPDATE
      `;
      if (lockedTopic.length === 0) {
        throw new Error("TOPIC_NOT_FOUND");
      }

      return tx.question.createMany({
        data: rows.map((r) => ({
          topicId,
          type: "MCQ" as const,
          text: r.text,
          options: r.options,
          correctAnswer: r.correctAnswer,
          explanation: r.explanation || null,
          difficulty: r.difficulty as "EASY" | "MEDIUM" | "HARD",
          boardYear: r.boardYear,
          boardName: r.boardName,
        })),
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "TOPIC_NOT_FOUND") {
      return NextResponse.json(
        { error: "টপিক ইতিমধ্যে ডিলিট হয়ে গেছে" },
        { status: 404 }
      );
    }
    throw err;
  }

  const session = await auth();
  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "QUESTION_BULK_UPLOAD",
      targetType: "Topic",
      targetId: topicId,
      metadata: { count: created.count },
      req,
    });
  }

  return NextResponse.json({ count: created.count });
}
