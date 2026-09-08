// ===================================================================
// Auto Study Plan Generator — AI দিয়ে দৈনিক পড়াশোনার পরিকল্পনা তৈরি
// -------------------------------------------------------------------
// ইউজারের weak topics (Analytics থেকে), exam countdown, এবং সাবজেক্ট
// কভারেজ বিশ্লেষণ করে AI কে দিয়ে একটা বাস্তবসম্মত স্টাডি প্ল্যান
// বানানো হয় — প্রতিদিন কোন সাবজেক্ট/টপিক কতক্ষণ পড়তে হবে।
//
// 🆕 নমনীয় Duration ("আজকের পড়া" ফিচার, ব্যবহারকারীর অনুরোধ অনুযায়ী):
// ইউজার ১ দিন (শুধু আজকের প্ল্যান), ৭ দিন (সাপ্তাহিক), ৩০ দিন (মাসিক),
// অথবা ৩৬৫ দিন (পূর্ণ বছরের রুটিন) বেছে নিতে পারে। ৩০ দিনের বেশি হলে
// AI দিয়ে একবারে পুরোটা জেনারেট করা সম্ভব না (token limit + বড় JSON এ
// hallucination ঝুঁকি বেশি) — তাই CHUNK_SIZE_DAYS (৩০ দিন) এ ভাগ করে
// ধাপে ধাপে জেনারেট করা হয়:
//   - প্রথম chunk সিঙ্ক্রোনাসভাবে জেনারেট হয় (ইউজার সাথে সাথে প্রথম
//     মাসের প্ল্যান দেখতে পায়, generationStatus="GENERATING" যদি আরও
//     chunk বাকি থাকে)
//   - বাকি chunk গুলো generateRemainingChunks() দিয়ে ব্যাকগ্রাউন্ডে
//     (await ছাড়া fire-and-forget, custom-question-gen.ts এর প্যাটার্ন)
//     ধারাবাহিকভাবে জেনারেট হয়, প্রতিটা chunk শেষে daysGenerated আপডেট
//     হয়, সব শেষ হলে generationStatus="READY"
// ===================================================================
import { prisma } from "@/lib/prisma";
import { getAIResponse } from "@/lib/ai-provider";
import { getWeakTopics } from "@/lib/analytics";
import { getCountdown } from "@/lib/exam-countdown";

const SUBJECT_CODES = [
  "BANGLA",
  "ENGLISH",
  "ICT",
  "PHYSICS",
  "CHEMISTRY",
  "BIOLOGY",
  "HIGHER_MATH",
] as const;

type SubjectCode = (typeof SUBJECT_CODES)[number];

// ইউজার যে duration বেছে নিতে পারবে (ঐচ্ছিক কাস্টম সংখ্যাও দেওয়া যায়,
// কিন্তু UI তে এই ৪টা preset shortcut হিসেবে দেখানো হয়)
export const DURATION_PRESETS = [1, 7, 30, 365] as const;
export const MIN_DURATION_DAYS = 1;
export const MAX_DURATION_DAYS = 365;

// প্রতি AI কলে সর্বোচ্চ এত দিনের প্ল্যান জেনারেট করা হয় (token limit
// safety + hallucination কমানো)।
//
// 🐛 বাগ ফিক্স (লাইভ টেস্টে আবিষ্কৃত): প্রথমে CHUNK_SIZE_DAYS=30 রাখা
// হয়েছিল ৩০০০ maxTokens এর সাথে — কিন্তু লাইভ টেস্টে ৩৬৫ দিনের প্ল্যান
// জেনারেট করতে গিয়ে "AI থেকে সঠিক ফরম্যাটে স্টাডি প্ল্যান পাওয়া যায়নি"
// error পাওয়া যায়। Root cause: ৩০ দিন × ৩.৫ আইটেম গড়ে ~১০৫টা আইটেম,
// প্রতিটা আইটেমের বাংলা taskDescription+topicName মিলিয়ে বাস্তবে
// ধারণার চেয়ে বেশি টোকেন লাগে — output ৩০০০ token এ কেটে যাচ্ছিল, এবং
// কাটা জায়গায় closing `]` bracket-ই ছিল না, তাই পুরনো regex
// `\[[\s\S]*\]` কোনো ম্যাচই পেতো না (repair logic এ পৌঁছানোর আগেই
// exception, "শেষ সম্পূর্ণ object পর্যন্ত কেটে রিপেয়ার" কোড কখনো রান
// হতো না)। Python এ ভেরিফাই করে দুই ধাপে ফিক্স করা হয়েছে: (১)
// CHUNK_SIZE_DAYS কমিয়ে ১৫ দিন (নিরাপদ token margin), (২) maxTokens
// বাড়িয়ে ৬০০০, (৩) নিচের extraction লজিক সম্পূর্ণ redesign করে
// closing bracket না থাকলেও (`[` এর পরে যা আছে তা থেকে) partial valid
// item উদ্ধার করার ক্ষমতা যোগ করা হয়েছে (extractJsonArrayItems())।
const CHUNK_SIZE_DAYS = 15;

interface PlanItemDraft {
  dayOffset: number; // chunk এর ভেতরে relative (0 = chunk এর প্রথম দিন)
  subjectCode: SubjectCode;
  topicName?: string;
  taskDescription: string;
  durationMinutes: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

function buildSystemPrompt(chunkDays: number): string {
  return `তুমি একজন অভিজ্ঞ HSC প্রস্তুতি পরামর্শদাতা। ছাত্রের দুর্বল টপিক, পরীক্ষা পর্যন্ত
বাকি দিন, এবং সাবজেক্ট কভারেজ বিশ্লেষণ করে পরবর্তী ${chunkDays} দিনের একটা বাস্তবসম্মত দৈনিক
স্টাডি প্ল্যান বানাও।

নিয়মাবলী:
- প্রতিদিন সর্বোচ্চ ৩-৪টা স্টাডি আইটেম দাও (ছাত্রের overwhelm না হওয়া উচিত)
- দুর্বল টপিকগুলোকে প্রায়োরিটি দাও (HIGH priority)
- বিজ্ঞান বিভাগের মূল বিষয়গুলো ঘুরিয়ে ফিরিয়ে কভার করো (Physics, Chemistry, Biology,
  Higher Math, Bangla, English, ICT) — একটানা অনেকদিন একই সাবজেক্ট না দিয়ে rotate করো
- প্রতিটা আইটেমে durationMinutes বাস্তবসম্মত হতে হবে (২৫-৯০ মিনিটের মধ্যে)
- taskDescription বাংলায়, নির্দিষ্ট ও actionable হতে হবে (যেমন: "নিউটনের গতিসূত্র অধ্যায়
  রিভিশন করে ১৫টা MCQ প্র্যাকটিস করো", শুধু "Physics পড়ো" না)
- পরীক্ষা কাছে থাকলে (৩০ দিনের কম) বেশি রিভিশন-ভিত্তিক প্ল্যান দাও, দূরে থাকলে নতুন
  টপিক শেখার উপর জোর দাও
- যদি ${chunkDays} দিনের বেশি (একটা দীর্ঘমেয়াদী প্ল্যানের অংশ) হয়, তাহলে ধারাবাহিকভাবে নতুন
  নতুন টপিক এগিয়ে নাও (প্রথম দিকে basics, পরে advanced/revision) — একই টপিক বারবার না দিয়ে

তুমি অবশ্যই শুধুমাত্র একটা valid JSON array রিটার্ন করবে, অন্য কোনো টেক্সট লিখবে না।
ফরম্যাট:
[
  {
    "dayOffset": 0,
    "subjectCode": "PHYSICS",
    "topicName": "নিউটনের গতিসূত্র",
    "taskDescription": "নিউটনের গতিসূত্র অধ্যায় রিভিশন করে ১৫টা MCQ প্র্যাকটিস করো",
    "durationMinutes": 45,
    "priority": "HIGH"
  }
]

subjectCode অবশ্যই এই তালিকা থেকে হতে হবে: BANGLA, ENGLISH, ICT, PHYSICS, CHEMISTRY,
BIOLOGY, HIGHER_MATH। priority অবশ্যই LOW, MEDIUM, HIGH এর একটা হতে হবে। dayOffset
০ থেকে ${chunkDays - 1} এর মধ্যে হতে হবে (০=এই chunk এর প্রথম দিন)।`;
}

/**
 * `[` এর পরের content কে string-aware bracket-depth counting দিয়ে
 * একেকটা `{...}` object আলাদা করে বের করে, প্রতিটা আলাদাভাবে JSON.parse()
 * করার চেষ্টা করে। কোনো object malformed/corrupted হলে সেটা **skip**
 * করে পরেরটায় যায় (পুরো batch নষ্ট না করে) — শেষে অসম্পূর্ণ (truncated)
 * object পাওয়া গেলে সেখানেই থেমে যায়।
 *
 * 🐛 বাগ #২ ফিক্স (লাইভ টেস্টে আবিষ্কৃত, ৯০-দিনের প্ল্যান জেনারেট করতে
 * গিয়ে): সম্পূর্ণ (non-truncated, শেষে `]` সহ) AI response এর **মাঝখানে**
 * একটা stray বাংলা character (`আ`) একটা নতুন লাইনে ঢুকে গিয়েছিল, ঠিক
 * `"topicName": "...",` এর পরে এবং `"taskDescription": ...` এর আগে —
 * cerebras provider এর generation glitch বলে মনে হয়েছে। যেহেতু এই stray
 * টোকেন এর কারণে পুরো array-ভিত্তিক JSON.parse পুরোপুরি ব্যর্থ হয় (single
 * malformed token পুরো parse নষ্ট করে দেয়), আর error position স্ট্রিং এর
 * মাঝখানে (শেষে না) হওয়ায় পুরনো "শেষ পর্যন্ত কেটে repair" কৌশলও কাজ করে
 * না। Python এ ডিজাইন-ভেরিফাই করে এই object-by-object bracket-matching
 * approach লেখা হয়েছে — এটা একটা মালফর্মড object কে বাকি সব ভালো object
 * থেকে আইসোলেট করে skip করে দেয়।
 */
function extractObjectsByBracketMatching(content: string): unknown[] {
  const startIdx = content.indexOf("[");
  if (startIdx === -1) return [];

  const objects: unknown[] = [];
  const n = content.length;
  let i = startIdx + 1;

  while (i < n) {
    const objStart = content.indexOf("{", i);
    if (objStart === -1) break;

    let depth = 0;
    let j = objStart;
    let inString = false;
    let escape = false;
    let objEnd = -1;

    while (j < n) {
      const ch = content[j];
      if (escape) {
        escape = false;
      } else if (ch === "\\" && inString) {
        escape = true;
      } else if (ch === '"') {
        inString = !inString;
      } else if (!inString) {
        if (ch === "{") {
          depth += 1;
        } else if (ch === "}") {
          depth -= 1;
          if (depth === 0) {
            objEnd = j;
            break;
          }
        }
      }
      j += 1;
    }

    if (objEnd === -1) {
      // অসম্পূর্ণ (truncated) object — এখানেই থেমে যাওয়া, যা আছে তাই ফেরত
      break;
    }

    const candidate = content.slice(objStart, objEnd + 1);
    try {
      objects.push(JSON.parse(candidate));
    } catch {
      // এই object malformed/corrupted — skip করে পরেরটায় যাওয়া
    }
    i = objEnd + 1;
  }

  return objects;
}

/**
 * AI রেসপন্স থেকে JSON array পার্স করে — টোকেন লিমিটে কেটে যাওয়া
 * (truncated) রেসপন্স ও মাঝখানে corrupted টোকেন উভয়ই robust ভাবে
 * হ্যান্ডল করে। ধাপে ধাপে চেষ্টা করে:
 * ১. সরাসরি সম্পূর্ণ `[...]` ম্যাচ করে parse (স্বাভাবিক, সবচেয়ে দ্রুত কেস)
 * ২. ব্যর্থ হলে object-by-object bracket-matching দিয়ে যতটা সম্ভব ভালো
 *    object উদ্ধার করা (truncation এবং mid-string corruption দুটোই এতে
 *    হ্যান্ডল হয় — malformed object skip করে বাকিগুলো রক্ষা পায়)
 * ৩. দুটোই ০টা item দিলে null রিটার্ন করে (caller error throw করবে)
 */
export function extractJsonArrayItems(content: string): unknown[] | null {
  const startIdx = content.indexOf("[");
  if (startIdx === -1) return null;

  // ধাপ ১: সম্পূর্ণ ম্যাচ থাকলে সরাসরি parse (fast path, বেশিরভাগ ক্ষেত্রে কাজ করবে)
  const fullMatch = content.match(/\[[\s\S]*\]/);
  if (fullMatch) {
    try {
      const parsed = JSON.parse(fullMatch[0]) as unknown[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // পরের ধাপে যাওয়া হবে (হয়তো ভেতরে malformed/corrupted কিছু আছে)
    }
  }

  // ধাপ ২: object-by-object bracket-matching দিয়ে partial recovery
  const recovered = extractObjectsByBracketMatching(content);
  if (recovered.length > 0) return recovered;

  return null;
}

function clampDuration(n: number): number {
  if (!Number.isFinite(n)) return 45;
  return Math.min(90, Math.max(25, Math.round(n)));
}

function isValidSubjectCode(code: unknown): code is SubjectCode {
  return typeof code === "string" && (SUBJECT_CODES as readonly string[]).includes(code);
}

function isValidPriority(p: unknown): p is "LOW" | "MEDIUM" | "HIGH" {
  return p === "LOW" || p === "MEDIUM" || p === "HIGH";
}

/** ইউজারের ইনপুট duration কে বৈধ রেঞ্জে ক্ল্যাম্প করে */
export function clampDurationDays(n: number): number {
  if (!Number.isFinite(n)) return 7;
  return Math.min(MAX_DURATION_DAYS, Math.max(MIN_DURATION_DAYS, Math.round(n)));
}

/**
 * AI কে কল করে একটা chunk (সর্বোচ্চ CHUNK_SIZE_DAYS দিন) এর প্ল্যান
 * আইটেম জেনারেট করে, পার্স+ভ্যালিডেট করে রিটার্ন করে (DB তে সেভ করে না)
 */
async function generateChunkItems(
  chunkDays: number,
  weakTopicsText: string,
  daysUntilExamAtChunkStart: number,
  chunkIndex: number
): Promise<{ items: PlanItemDraft[]; provider: string }> {
  const userPrompt = `ছাত্রের তথ্য:
- এই chunk শুরু হওয়ার সময় পরীক্ষা পর্যন্ত বাকি: ${daysUntilExamAtChunkStart >= 0 ? `${daysUntilExamAtChunkStart} দিন` : "পরীক্ষা শুরু হয়ে গেছে/অতীত তারিখ"}
- এটা একটা দীর্ঘমেয়াদী প্ল্যানের ${chunkIndex + 1} নম্বর ধাপ (chunk) — আগের ধাপে ভিন্ন টপিক কভার হয়েছে ধরে নাও

দুর্বল টপিকসমূহ (Practice ডেটা থেকে):
${weakTopicsText}

এই তথ্যের ভিত্তিতে পরবর্তী ${chunkDays} দিনের (dayOffset 0-${chunkDays - 1}) একটা স্টাডি প্ল্যান বানাও।`;

  const result = await getAIResponse(
    [
      { role: "system", content: buildSystemPrompt(chunkDays) },
      { role: "user", content: userPrompt },
    ],
    6000 // বড় chunk এর বাংলা JSON এর জন্য পর্যাপ্ত মার্জিন (আগে ৩০০০ ছিল, ছোট পড়ায় truncation bug হয়েছিল)
  );

  const parsed = extractJsonArrayItems(result.content);
  if (!parsed) {
    console.error("Study Plan AI raw response (provider:", result.provider, "):", result.content);
    throw new Error("AI থেকে সঠিক ফরম্যাটে স্টাডি প্ল্যান পাওয়া যায়নি");
  }
  // partial recovery হলে (কিছু object malformed থাকায় স্কিপ হয়েছে) transparency
  // এর জন্য লগ করা — expected item সংখ্যা chunkDays * ~৩-৪, উল্লেখযোগ্যভাবে কম হলে সতর্কতা
  if (parsed.length < chunkDays * 2) {
    console.warn(
      `Study Plan chunk ${chunkIndex}: শুধু ${parsed.length}টা item উদ্ধার হয়েছে (${chunkDays} দিনের জন্য প্রত্যাশিত ~${chunkDays * 3}টা) — কিছু AI response object corrupted/malformed থাকতে পারে, skip করা হয়েছে`
    );
  }

  const validItems: PlanItemDraft[] = parsed
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => {
      const dayOffset = Math.min(
        chunkDays - 1,
        Math.max(0, Math.round(Number(item.dayOffset) || 0))
      );
      const subjectCode = isValidSubjectCode(item.subjectCode) ? item.subjectCode : "PHYSICS";
      const priority = isValidPriority(item.priority) ? item.priority : "MEDIUM";
      const taskDescription =
        typeof item.taskDescription === "string" && item.taskDescription.trim()
          ? item.taskDescription.trim()
          : `${subjectCode} রিভিশন করো`;

      return {
        dayOffset,
        subjectCode,
        topicName: typeof item.topicName === "string" ? item.topicName.trim() : undefined,
        taskDescription,
        durationMinutes: clampDuration(Number(item.durationMinutes)),
        priority,
      };
    })
    .slice(0, chunkDays * 5); // নিরাপত্তা সীমা: প্রতি দিনে সর্বোচ্চ ৫টা আইটেম

  if (validItems.length === 0) {
    throw new Error("AI কোনো বৈধ স্টাডি প্ল্যান আইটেম দিতে পারেনি");
  }

  return { items: validItems, provider: result.provider };
}

/**
 * ইউজারের ডেটা বিশ্লেষণ করে AI দিয়ে নির্দিষ্ট duration এর স্টাডি প্ল্যান
 * জেনারেট করে ও DB তে সেভ করে। durationDays > CHUNK_SIZE_DAYS হলে শুধু
 * প্রথম chunk জেনারেট করে "GENERATING" স্ট্যাটাসে রিটার্ন করে — বাকিটা
 * generateRemainingChunks() দিয়ে আলাদাভাবে (ব্যাকগ্রাউন্ডে) কল করতে হয়।
 */
export async function generateStudyPlan(userId: string, durationDaysInput: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("ইউজার পাওয়া যায়নি");

  const durationDays = clampDurationDays(durationDaysInput);
  const countdown = getCountdown(user.examDate, user.hscBatch);
  const weakTopics = await getWeakTopics(userId, 8);

  const weakTopicsText =
    weakTopics.length > 0
      ? weakTopics
          .map((t) => `- ${t.subjectName} এর "${t.topicName}" (নির্ভুলতা ${t.accuracyPct}%)`)
          .join("\n")
      : "এখনো কোনো দুর্বল টপিক শনাক্ত করা যায়নি (পর্যাপ্ত প্র্যাকটিস ডেটা নেই)";

  const firstChunkDays = Math.min(durationDays, CHUNK_SIZE_DAYS);
  const daysUntilExam = countdown.isPast ? -1 : countdown.daysLeft;

  const { items: firstChunkItems, provider } = await generateChunkItems(
    firstChunkDays,
    weakTopicsText,
    daysUntilExam,
    0
  );

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays - 1);

  const needsMoreChunks = durationDays > CHUNK_SIZE_DAYS;

  // 🐛 বাগ ফিক্স (Quiz Duel Multi-Create Race Condition এর একই
  // "check-then-create/delete own-invariant" ক্লাস — এখানে
  // deleteMany()+create() দুই ধাপে, কোনো transaction/lock ছাড়া):
  // আগে আলাদা `deleteMany()` তারপর `create()` কল করা হতো। AI কল
  // (`generateChunkItems()`, উপরে) কয়েক সেকেন্ড সময় নেয় বলে একই
  // ইউজার concurrent একাধিক `POST /api/study-plan/generate` পাঠালে
  // (যেমন ডাবল-ক্লিক/মাল্টি-ট্যাব) প্রতিটা রিকোয়েস্ট independently
  // "আগের প্ল্যান delete করে নতুন create করছে" — কোনো serialization
  // ছাড়া একাধিক StudyPlan row একসাথে তৈরি হয়ে যেতে পারতো (একে অপরের
  // deleteMany() একে অপরের সদ্য-তৈরি প্ল্যান মুছে ফেলতে পারতো না,
  // কারণ deleteMany() ও create() আলাদা মুহূর্তে ঘটছিল)। লাইভ টেস্টে
  // ৪টা concurrent request পাঠিয়ে ৫টা iteration এ ৪টাতেই (৮০%)
  // একাধিক (২-৪টা) StudyPlan row তৈরি হয়ে গেছে (প্রত্যাশিত ১টা)।
  //
  // ফিক্স: Quiz Duel Create এর established `SELECT ... FOR UPDATE`
  // প্যাটার্ন অনুসরণ করে ইউজারের নিজের `users` row কে `$transaction`
  // এর ভেতরে lock করে deleteMany()+create() একসাথে atomic করা
  // হয়েছে — AI কল (দীর্ঘ, বহিরাগত) transaction এর বাইরেই রাখা হয়েছে
  // (established সমাধান ৪ অনুযায়ী, transaction কে বহিরাগত I/O এর
  // সময় খোলা রাখা anti-pattern)।
  const studyPlan = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${userId} FOR UPDATE`;

    // আগের StudyPlan থাকলে মুছে ফেলা হচ্ছে (idempotent — একবারে একটাই active প্ল্যান)
    await tx.studyPlan.deleteMany({ where: { userId } });

    return tx.studyPlan.create({
      data: {
        userId,
        startDate,
        endDate,
        durationDays,
        daysUntilExam: countdown.isPast ? 0 : countdown.daysLeft,
        aiProvider: provider,
        generationStatus: needsMoreChunks ? "GENERATING" : "READY",
        daysGenerated: firstChunkDays,
        items: {
          create: firstChunkItems.map((item) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + item.dayOffset);
            return {
              date,
              subjectCode: item.subjectCode,
              topicName: item.topicName || null,
              taskDescription: item.taskDescription,
              durationMinutes: item.durationMinutes,
              priority: item.priority,
            };
          }),
        },
      },
      include: { items: { orderBy: { date: "asc" } } },
    });
  });

  return { plan: studyPlan, needsMoreChunks };
}

/**
 * বাকি chunk গুলো ধারাবাহিকভাবে জেনারেট করে (fire-and-forget প্যাটার্নে
 * কল করা উচিত, await ছাড়া — যেমন custom-question-gen.ts এর
 * processImageToQuestions())। প্রতিটা chunk শেষে DB আপডেট হয়, কোনো
 * chunk ব্যর্থ হলে generationStatus="FAILED" হয় (আগে জেনারেট হওয়া
 * chunk গুলো অক্ষত থাকে — partial progress হারায় না)।
 *
 * 🐛 বাগ ফিক্স (Race Condition, Admin Notification Broadcast/CSV Bulk
 * Question Upload এর একই "bulk read-then-bulk-write with FK
 * dependency" ক্লাসের নতুন instance, লাইভ টেস্টে প্রমাণিত): এই
 * ফাংশনটা fire-and-forget ব্যাকগ্রাউন্ড লুপে চলে (প্রতিটা chunk এ AI
 * কল, ১০+ সেকেন্ড লাগতে পারে)। এই দীর্ঘ সময়ের মাঝে যদি ইউজার আবার
 * `POST /api/study-plan/generate` কল করে (generateStudyPlan()
 * `studyPlan.deleteMany({ where: { userId } })` দিয়ে পুরনো প্ল্যান
 * cascade-delete করে দেয়), তাহলে এই ব্যাকগ্রাউন্ড লুপ পুরনো (এখন
 * ডিলিট হয়ে যাওয়া) `studyPlanId` দিয়ে `studyPlanItem.createMany()`
 * কল করার চেষ্টা করে FK violation (`study_plan_items_studyPlanId_
 * fkey`, P2003) throw করতো — যা catch ব্লকে ধরা পড়তো, কিন্তু catch
 * ব্লক নিজেই `studyPlan.update()` কল করতো (সেই একই ডিলিট হয়ে যাওয়া
 * id দিয়ে) যেটা আবার P2025 throw করে **error-handler নিজেই crash**
 * করতো (double-fault, uncaught exception, dev server log এ
 * unhandled rejection)। লাইভ টেস্টে (৯০ দিনের প্ল্যান জেনারেট করে
 * ০.৫ সেকেন্ড পরে আবার ৭ দিনের প্ল্যান জেনারেট করে) এই chain
 * সরাসরি reproduce হয়েছে।
 *
 * ফিক্স: প্রতিটা chunk এর write অংশ (AI কল শেষ হওয়ার পরে) কে
 * `$transaction` এর ভেতরে `SELECT ... FOR UPDATE` দিয়ে atomic করা
 * হয়েছে (CSV Bulk Question Upload এর established সমাধান ৩খ টেমপ্লেট
 * অনুসরণ করে) — ধীর AI কলটা লকের বাইরে রাখা হয়েছে (লক ধরে রেখে AI
 * এর জন্য অপেক্ষা করলে অন্য কোনো ভ্যালিড অপারেশনও অহেতুক ব্লক হয়ে
 * যেত), শুধু write মুহূর্তে লক নেওয়া হয়। যদি লক নেওয়ার সময় দেখা যায়
 * প্ল্যান ইতিমধ্যে ডিলিট হয়ে গেছে (নতুন generate কল হওয়ায়), পুরো লুপ
 * নীরবে (silently, কোনো crash/FAILED status write ছাড়াই) থেমে যায় —
 * কারণ এটা genuine error না, এটা "ইউজার ইচ্ছাকৃতভাবে নতুন প্ল্যান
 * চেয়েছে, পুরনোটা প্রাসঙ্গিক না" এমন পরিস্থিতি। catch ব্লকেও
 * `update()` এর বদলে `updateMany()` ব্যবহার করা হয়েছে (matched
 * count 0 হলে silently skip) যাতে error-handler নিজে কখনো crash না
 * করে।
 */
export async function generateRemainingChunks(studyPlanId: string) {
  const plan = await prisma.studyPlan.findUnique({ where: { id: studyPlanId } });
  if (!plan || plan.generationStatus !== "GENERATING") return;

  const user = await prisma.user.findUnique({ where: { id: plan.userId } });
  if (!user) return;

  try {
    let daysGenerated = plan.daysGenerated;
    let chunkIndex = Math.ceil(daysGenerated / CHUNK_SIZE_DAYS);
    const countdown = getCountdown(user.examDate, user.hscBatch);

    while (daysGenerated < plan.durationDays) {
      const remainingDays = plan.durationDays - daysGenerated;
      const chunkDays = Math.min(remainingDays, CHUNK_SIZE_DAYS);

      // এই chunk শুরু হওয়ার সময় পরীক্ষা পর্যন্ত বাকি দিন (প্রথম chunk এর
      // countdown থেকে ইতিমধ্যে জেনারেট হওয়া দিন বিয়োগ করে হিসাব)
      const daysUntilExamAtChunkStart = countdown.isPast ? -1 : countdown.daysLeft - daysGenerated;

      // দুর্বল টপিক প্রতিটা chunk এর আগে fresh নিয়ে আসা হচ্ছে (নতুন
      // practice ডেটা যোগ হয়ে থাকতে পারে যেহেতু ব্যাকগ্রাউন্ড জেনারেশন
      // কিছুক্ষণ সময় নিতে পারে বড় প্ল্যানে)
      const weakTopics = await getWeakTopics(plan.userId, 8);
      const weakTopicsText =
        weakTopics.length > 0
          ? weakTopics
              .map((t) => `- ${t.subjectName} এর "${t.topicName}" (নির্ভুলতা ${t.accuracyPct}%)`)
              .join("\n")
          : "এখনো কোনো দুর্বল টপিক শনাক্ত করা যায়নি (পর্যাপ্ত প্র্যাকটিস ডেটা নেই)";

      const { items, provider } = await generateChunkItems(
        chunkDays,
        weakTopicsText,
        daysUntilExamAtChunkStart,
        chunkIndex
      );

      const chunkStartDate = new Date(plan.startDate);
      chunkStartDate.setDate(chunkStartDate.getDate() + daysGenerated);

      daysGenerated += chunkDays;
      chunkIndex += 1;

      // atomic: FOR UPDATE row-lock + createMany + daysGenerated update
      // একই transaction এ — প্ল্যান ইতিমধ্যে ডিলিট হয়ে গেলে (নতুন
      // generate কল হওয়ায়) TOPIC_NOT_FOUND এর মতো সিগনাল দিয়ে থামে,
      // কোনো FK violation crash সম্ভব না
      const stillExists = await prisma.$transaction(async (tx) => {
        const lockedPlan = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM "study_plans" WHERE id = ${plan.id} FOR UPDATE
        `;
        if (lockedPlan.length === 0) return false;

        await tx.studyPlanItem.createMany({
          data: items.map((item) => {
            const date = new Date(chunkStartDate);
            date.setDate(date.getDate() + item.dayOffset);
            return {
              studyPlanId: plan.id,
              date,
              subjectCode: item.subjectCode,
              topicName: item.topicName || null,
              taskDescription: item.taskDescription,
              durationMinutes: item.durationMinutes,
              priority: item.priority,
            };
          }),
        });

        await tx.studyPlan.update({
          where: { id: plan.id },
          data: { daysGenerated, aiProvider: provider },
        });

        return true;
      });

      if (!stillExists) {
        // ইউজার ইতিমধ্যে নতুন প্ল্যান জেনারেট করে ফেলেছে (পুরনোটা
        // deleteMany() দিয়ে মুছে গেছে) — এটা genuine error না, তাই
        // silently থেমে যাওয়া হচ্ছে (কোনো FAILED status লেখার দরকার
        // নেই, কারণ লেখার মতো রেকর্ডই আর নেই)
        console.log(
          `Study Plan ব্যাকগ্রাউন্ড generation থামানো হলো (id=${plan.id}) — প্ল্যানটা ইতিমধ্যে ডিলিট/replace হয়ে গেছে`
        );
        return;
      }
    }

    await prisma.studyPlan.updateMany({
      where: { id: plan.id },
      data: { generationStatus: "READY" },
    });
  } catch (err) {
    console.error("Study Plan ব্যাকগ্রাউন্ড chunk generation ব্যর্থ:", err);
    // updateMany() ব্যবহার করা হয়েছে (update() না) — প্ল্যান ইতিমধ্যে
    // ডিলিট হয়ে থাকলে matched count 0 হবে, কোনো P2025 crash হবে না
    // (error-handler নিজে যেন কখনো নতুন crash তৈরি না করে)
    await prisma.studyPlan.updateMany({
      where: { id: plan.id },
      data: { generationStatus: "FAILED" },
    });
  }
}

/**
 * সিংগুলারিটি ইন্টারভেনশন (Singularity Intervention):
 * যদি কোনো ইউজারের পারফরম্যান্স হঠাৎ খারাপ হতে শুরু করে, তবে এই অটোনোমাস এজেন্ট 
 * ইউজারের বর্তমান স্টাডি প্ল্যান "হাইজ্যাক" করবে এবং তাকে রিভেরি মোডে পাঠাবে।
 */
export async function runSingularityIntervention(userId: string) {
  const weakTopics = await getWeakTopics(userId, 3);
  
  // যদি কোনো টপিকের একুরেসি ৩০% এর নিচে হয়, তবে সিংগুলারিটি ইন্টারভীন করবে
  const criticalTopic = weakTopics.find(t => t.accuracyPct < 30);
  
  if (criticalTopic) {
    console.log(`SINGULARITY: Intervening for user ${userId} on topic ${criticalTopic.topicName}`);
    
    // ১ দিনের একটি ইমার্জেন্সি প্ল্যান জেনারেট করো
    await generateStudyPlan(userId, 1);
    
    await prisma.notification.create({
      data: {
        userId,
        title: "⚡ SINGULARITY INTERVENTION",
        body: `আমি দেখেছি তোমার "${criticalTopic.topicName}" এ অনেক সমস্যা হচ্ছে। আমি তোমার আজকের রুটিন পাল্টে দিয়েছি যাতে তুমি এই গ্যাপটা পূরণ করতে পারো।`,
        link: "/planner"
      }
    });
    
    return true;
  }
  return false;
}
