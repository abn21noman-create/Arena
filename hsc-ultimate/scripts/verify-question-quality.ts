// ===================================================================
// MCQ প্রশ্নের মান যাচাই — pnpm verify:questions
// -------------------------------------------------------------------
// প্রশ্ন শুধু "আছে" হলেই যথেষ্ট নয়। একটা ভাঙা প্রশ্ন ছাত্রের কুইজে
// সরাসরি ক্ষতি করে — যেমন `correctAnswer` যদি `options` এর মধ্যে
// না থাকে, তাহলে **ছাত্র যা-ই উত্তর দিক, সবসময় ভুল হবে**
// (`app/api/practice/submit/route.ts` এ `question.correctAnswer ===
// a.userAnswer` স্ট্রিং তুলনা করা হয়)। এমন প্রশ্ন নীরবে ছাত্রের
// accuracy নষ্ট করে ও weak-topic ডিটেকশনকে বিভ্রান্ত করে।
//
// যা যাচাই হয়:
//   ১. `correctAnswer` অবশ্যই `options` এর একটি হতে হবে (সবচেয়ে গুরুতর)
//   ২. অপশন সংখ্যা ঠিক ৪টা (HSC MCQ ফরম্যাট)
//   ৩. একই প্রশ্নে ডুপ্লিকেট অপশন নেই
//   ৪. খালি/whitespace-only text বা option নেই
//   ৫. একই টপিকে হুবহু একই প্রশ্ন দুইবার নেই
//   ৬. ব্যাখ্যা (explanation) আছে ও যথেষ্ট দীর্ঘ
//   ৭. প্রশ্নের text যথেষ্ট দীর্ঘ
//   ৮. প্রতিটা টপিকে অন্তত ১টা প্রশ্ন আছে
//   ৯. difficulty বণ্টন রিপোর্ট
//
// exit code ১ যদি কোনো সমস্যা পাওয়া যায়।
// ===================================================================
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const problems: string[] = [];

function problem(msg: string) {
  problems.push(msg);
}

async function main() {
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      text: true,
      options: true,
      correctAnswer: true,
      explanation: true,
      difficulty: true,
      type: true,
      topic: {
        select: {
          name: true,
          chapter: { select: { subject: { select: { name: true } } } },
        },
      },
    },
  });

  console.log(`=== MCQ মান যাচাই: ${questions.length} টা প্রশ্ন ===\n`);

  // টপিক+text অনুযায়ী ডুপ্লিকেট শনাক্তকরণ
  const seen = new Map<string, number>();

  for (const q of questions) {
    const where = `[${q.topic.chapter.subject.name}] ${q.topic.name}`;
    const short = q.text.slice(0, 45);

    // ---------- text ----------
    if (!q.text.trim()) {
      problem(`${where} — খালি প্রশ্ন (id=${q.id})`);
      continue;
    }
    if (q.text.trim().length < 10) {
      problem(`${where} — প্রশ্ন খুব ছোট: ${JSON.stringify(short)}`);
    }

    // ---------- options ----------
    // MCQ ছাড়া অন্য type এ options না থাকা স্বাভাবিক
    if (q.type !== "MCQ") continue;

    if (!Array.isArray(q.options)) {
      problem(`${where} — options অ্যারে নয়: ${JSON.stringify(short)}`);
      continue;
    }
    const opts = q.options as unknown[];

    if (opts.length !== 4) {
      problem(`${where} — অপশন ${opts.length} টা (৪টা হওয়া উচিত): ${JSON.stringify(short)}`);
    }

    const strOpts = opts.map((o) => String(o));
    if (strOpts.some((o) => !o.trim())) {
      problem(`${where} — খালি অপশন আছে: ${JSON.stringify(short)}`);
    }
    if (new Set(strOpts).size !== strOpts.length) {
      problem(`${where} — ডুপ্লিকেট অপশন: ${JSON.stringify(short)}`);
    }

    // ---------- সবচেয়ে গুরুত্বপূর্ণ: correctAnswer options এ আছে? ----------
    if (!strOpts.includes(q.correctAnswer)) {
      problem(
        `🔴 ${where} — correctAnswer options এ নেই! ` +
          `correctAnswer=${JSON.stringify(q.correctAnswer)} ` +
          `options=${JSON.stringify(strOpts)} — ছাত্র কখনোই সঠিক উত্তর দিতে পারবে না`
      );
    }

    // ---------- explanation ----------
    if (!q.explanation || !q.explanation.trim()) {
      problem(`${where} — ব্যাখ্যা নেই: ${JSON.stringify(short)}`);
    } else if (q.explanation.trim().length < 15) {
      problem(`${where} — ব্যাখ্যা খুব ছোট: ${JSON.stringify(short)}`);
    }

    // ---------- ডুপ্লিকেট ----------
    const fp = `${q.topic.name}::${q.text.trim()}`;
    seen.set(fp, (seen.get(fp) ?? 0) + 1);
  }

  for (const [fp, count] of seen) {
    if (count > 1) {
      const [topicName, text] = fp.split("::");
      problem(`ডুপ্লিকেট প্রশ্ন ${count} বার — [${topicName}] ${JSON.stringify(text.slice(0, 50))}`);
    }
  }

  // ---------- কভারেজ: MCQ-শূন্য টপিক ----------
  const topics = await prisma.topic.findMany({
    select: {
      name: true,
      _count: { select: { questions: true } },
      chapter: { select: { subject: { select: { name: true } } } },
    },
  });
  const emptyTopics = topics.filter((t) => t._count.questions === 0);
  for (const t of emptyTopics) {
    problem(`MCQ-শূন্য টপিক: [${t.chapter.subject.name}] ${t.name}`);
  }

  // ---------- সাবজেক্টভিত্তিক রিপোর্ট ----------
  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    select: {
      name: true,
      chapters: {
        select: { topics: { select: { _count: { select: { questions: true } } } } },
      },
    },
  });

  console.log("--- সাবজেক্টভিত্তিক MCQ ---");
  let grandTotal = 0;
  let grandTopics = 0;
  for (const s of subjects) {
    const allTopics = s.chapters.flatMap((c) => c.topics);
    const n = allTopics.reduce((sum, t) => sum + t._count.questions, 0);
    const empty = allTopics.filter((t) => t._count.questions === 0).length;
    grandTotal += n;
    grandTopics += allTopics.length;
    const flag = empty === 0 ? "✅" : "  ";
    const avg = allTopics.length ? (n / allTopics.length).toFixed(1) : "0";
    console.log(
      `${flag} ${s.name.padEnd(26)} ${String(n).padStart(4)} টা · ${allTopics.length} টপিক · গড় ${avg}` +
        (empty > 0 ? ` · ${empty} টা শূন্য` : "")
    );
  }
  console.log(`\nমোট: ${grandTotal} টা প্রশ্ন · ${grandTopics} টপিক`);

  // ---------- difficulty বণ্টন ----------
  const byDiff = new Map<string, number>();
  for (const q of questions) {
    byDiff.set(q.difficulty, (byDiff.get(q.difficulty) ?? 0) + 1);
  }
  console.log("\n--- difficulty বণ্টন ---");
  for (const d of ["EASY", "MEDIUM", "HARD"]) {
    const n = byDiff.get(d) ?? 0;
    const pct = questions.length ? Math.round((100 * n) / questions.length) : 0;
    console.log(`  ${d.padEnd(7)} ${String(n).padStart(4)} (${pct}%)`);
  }

  console.log(`\n=== ${questions.length} টা প্রশ্ন যাচাই · ${problems.length} টা সমস্যা ===`);
  for (const p of problems) console.log(`  ❌ ${p}`);
  if (problems.length === 0) {
    console.log("✅ সব প্রশ্নের গঠন ও correctAnswer ঠিক আছে");
  }

  await prisma.$disconnect();
  process.exit(problems.length > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error("❌ সমস্যা:", e);
  await prisma.$disconnect();
  process.exit(1);
});
