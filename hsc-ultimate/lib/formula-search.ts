// ===================================================================
// Formula Quick Search — Core Logic
// -------------------------------------------------------------------
// নতুন ফিচার: পরীক্ষার ঠিক আগে সব বিষয়ের ফর্মুলা শীট (`Topic.
// formulaSheet`) এক জায়গা থেকে সার্চ করে দ্রুত খুঁজে পাওয়া। বিদ্যমান
// Global Search (`lib/search`) শুধু টপিকের **নাম** দিয়ে খোঁজে —
// ফর্মুলার ভেতরের রাশি/সূত্র (যেমন "sin", "cos", "ভরবেগ") দিয়ে খোঁজা
// যায় না। এই ফিচার প্রতিটা `formulaSheet`-কে আলাদা আলাদা "এন্ট্রি"
// (bullet-point/table-row/standalone-equation লাইন) এ ভেঙে প্রতিটা
// এন্ট্রিতে আলাদাভাবে সার্চ চালায়, যাতে সরাসরি নির্দিষ্ট সূত্রে পৌঁছানো
// যায় — পুরো টপিক নোট খুলে খুঁজতে হয় না।
//
// ডিজাইন সিদ্ধান্ত — কোনো নতুন DB টেবিল/migration লাগেনি:
// `formulaSheet` মোট মাত্র ৮২টা টপিকে আছে, গড়ে ~৩৮৫ ক্যারেক্টার —
// পুরো ডেটাসেট নিয়ে on-the-fly পার্স করা এত সস্তা যে আলাদা cache/
// pre-processed টেবিল রাখার প্রয়োজন নেই (over-engineering এড়ানো), এবং
// এতে Admin কনটেন্ট এডিট করলেই সার্চ ফলাফল সবসময় সিঙ্কে থাকে (কোনো
// stale cache invalidation বাগের ঝুঁকি নেই)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { isValidEnumValue, VALID_SUBJECT_CODES } from "@/lib/enum-validation";

export interface FormulaSearchResult {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  chapterName: string;
  entry: string; // একটা একক ফর্মুলা/লাইন (raw markdown+LaTeX সহ, MathText দিয়ে রেন্ডার করা হবে)
}

// একটা `formulaSheet` মার্কডাউন টেক্সটকে আলাদা আলাদা এন্ট্রিতে (bullet
// item / table row / standalone equation) ভাঙে — `MarkdownLite`-এর
// লাইন-পার্সিং লজিকের সাথে সামঞ্জস্যপূর্ণ (headers/code-block স্কিপ,
// bullet/table row কে একক এন্ট্রি হিসেবে ধরা)।
export function parseFormulaEntries(formulaSheet: string): string[] {
  const lines = formulaSheet.split("\n");
  const entries: string[] = [];
  let inCodeBlock = false;
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    // ফেন্সড কোড ব্লক — সূত্র না, স্কিপ
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      i++;
      continue;
    }
    if (inCodeBlock) {
      i++;
      continue;
    }

    // খালি লাইন বা হেডার — নিজে সূত্র-এন্ট্রি না
    if (!trimmed || trimmed.startsWith("#")) {
      i++;
      continue;
    }

    // টেবিলের সেপারেটর/হেডার রো (---|---) নিজে ডেটা না, স্কিপ
    if (trimmed.startsWith("|")) {
      const nextLine = lines[i + 1]?.trim() ?? "";
      const isSeparatorRow = /^\|?\s*-+\s*\|/.test(trimmed);
      const isHeaderRow = /^\|?\s*-+\s*\|/.test(nextLine);
      if (isSeparatorRow || isHeaderRow) {
        i++;
        continue;
      }
      const cells = trimmed
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length >= 2) {
        entries.push(cells.join(" — "));
      }
      i++;
      continue;
    }

    // বুলেট-পয়েন্ট লিস্ট আইটেম (সবচেয়ে সাধারণ ফরম্যাট)
    if (trimmed.startsWith("- ")) {
      entries.push(trimmed.slice(2).trim());
      i++;
      continue;
    }

    // standalone equation ব্লক (যেমন $$...$$) বা প্লেইন প্যারাগ্রাফ —
    // শুধু LaTeX ($...) থাকলে বা যথেষ্ট লম্বা হলে এন্ট্রি হিসেবে ধরা
    if (trimmed.includes("$") || trimmed.length > 3) {
      entries.push(trimmed);
    }
    i++;
  }

  return entries;
}

// একটা এন্ট্রি একটা নির্দিষ্ট সার্চ কোয়েরির সাথে ম্যাচ করে কিনা —
// case-insensitive substring match, LaTeX ব্যাকস্ল্যাশ কমান্ড
// (\sin, \cos) বা প্লেইন বাংলা/ইংরেজি শব্দ দুটোতেই কাজ করে।
function entryMatchesQuery(entry: string, query: string): boolean {
  return entry.toLowerCase().includes(query.toLowerCase());
}

// সব টপিকের formulaSheet থেকে একটা কোয়েরির সাথে ম্যাচ করা এন্ট্রি
// খুঁজে বের করে — ঐচ্ছিকভাবে subjectCode দিয়ে ফিল্টার করা যায়।
export async function searchFormulas(
  query: string,
  subjectCode?: string | null,
  limit = 50
): Promise<FormulaSearchResult[]> {
  // 🐛 প্রতিরোধমূলক ফিক্স (established GET Query Enum Validation
  // প্যাটার্ন অনুসরণ করে, প্রথমবার থেকেই সঠিকভাবে লেখা): অবৈধ
  // subjectCode দিলে filter silently উপেক্ষা করা হয় (fail-open,
  // read-only endpoint)।
  const validSubjectCode = isValidEnumValue(subjectCode, VALID_SUBJECT_CODES)
    ? subjectCode
    : undefined;

  const topics = await prisma.topic.findMany({
    where: {
      formulaSheet: { not: null },
      ...(validSubjectCode ? { chapter: { subject: { code: validSubjectCode } } } : {}),
    },
    select: {
      id: true,
      name: true,
      formulaSheet: true,
      chapter: {
        select: {
          name: true,
          subject: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });

  const results: FormulaSearchResult[] = [];

  for (const topic of topics) {
    if (!topic.formulaSheet) continue;
    const entries = parseFormulaEntries(topic.formulaSheet);
    for (const entry of entries) {
      if (entryMatchesQuery(entry, query)) {
        results.push({
          topicId: topic.id,
          topicName: topic.name,
          subjectId: topic.chapter.subject.id,
          subjectName: topic.chapter.subject.name,
          subjectCode: topic.chapter.subject.code,
          chapterName: topic.chapter.name,
          entry,
        });
      }
      if (results.length >= limit) return results;
    }
  }

  return results;
}
