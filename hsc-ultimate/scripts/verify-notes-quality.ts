// ===================================================================
// নোট কনটেন্ট মান যাচাই — pnpm verify:notes
// -------------------------------------------------------------------
// notesMarkdown/formulaSheet শুধু "আছে" হলেই যথেষ্ট নয় — ভাঙা KaTeX
// ছাত্রের "পড়া" পেজে লাল render error দেখাবে।
//
// ⚠️ প্রথমে এই চেকার Python এ regex দিয়ে লেখা হয়েছিল, কিন্তু সেটা
// `\sqrt2` ও `\frac12` কে "আর্গুমেন্ট নেই" বলে ৮টা false positive
// দিয়েছিল — অথচ KaTeX এ ব্রেসবিহীন single-token আর্গুমেন্ট সম্পূর্ণ
// বৈধ (`\sqrt2` = `\sqrt{2}`)। তাই এখন হাতে-লেখা পার্সার বাদ দিয়ে
// **আসল KaTeX পার্সার** দিয়ে যাচাই করা হয় — যে রেন্ডারারই ব্রাউজারে
// চলবে, সেটাই এখানে রায় দেয়। এতে false positive/negative দুটোই বাদ।
//
// যা যাচাই হয়:
//   ১. প্রতিটা $...$ ও $$...$$ ব্লক আসল KaTeX দিয়ে পার্স করা
//   ২. ডিলিমিটার জোড়ায় আছে কিনা (বিজোড় $ = ভাঙা inline math)
//   ৩. markdown হেডিং দিয়ে শুরু, যথেষ্ট দৈর্ঘ্য
//   ৪. বাংলা কনটেন্ট আছে (English সাবজেক্ট বাদে)
//   ৫. একই নোট একাধিক টপিকে কপি-পেস্ট হয়েছে কিনা
//   ৬. সাবজেক্টভিত্তিক কভারেজ রিপোর্ট
//
// exit code ১ যদি কোনো সমস্যা পাওয়া যায়।
// ===================================================================
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import katex from "katex";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const problems: string[] = [];

function problem(topic: string, field: string, msg: string) {
  problems.push(`${topic} [${field}] — ${msg}`);
}

/** টেক্সট থেকে সব math এক্সপ্রেশন বের করে আসল KaTeX দিয়ে পার্স করে */
function checkKatex(topic: string, field: string, text: string) {
  // ১. ডিলিমিটার জোড়া যাচাই
  const blockCount = (text.match(/\$\$/g) ?? []).length;
  if (blockCount % 2 !== 0) {
    problem(topic, field, `$$ ব্লক বিজোড় (${blockCount} টা) — KaTeX ভাঙবে`);
    return; // বিজোড় হলে বাকি পার্সিং অর্থহীন
  }

  const withoutBlocks = text.replace(/\$\$[\s\S]*?\$\$/g, "");
  // escape করা \$ বাদ দিয়ে একক $ গোনা
  const singles = (withoutBlocks.match(/(?<!\\)\$/g) ?? []).length;
  if (singles % 2 !== 0) {
    problem(topic, field, `একক $ বিজোড় (${singles} টা) — inline math ভাঙবে`);
    return;
  }

  // ২. প্রতিটা এক্সপ্রেশন আসল KaTeX দিয়ে পার্স
  const expressions: string[] = [];
  for (const m of text.matchAll(/\$\$([\s\S]*?)\$\$/g)) expressions.push(m[1]);
  for (const m of withoutBlocks.matchAll(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g)) {
    expressions.push(m[1]);
  }

  for (const expr of expressions) {
    if (!expr.trim()) continue;
    try {
      katex.renderToString(expr, { throwOnError: true, displayMode: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      problem(topic, field, `KaTeX ভাঙা: ${JSON.stringify(expr.slice(0, 70))} → ${msg.slice(0, 90)}`);
      continue;
    }

    // KaTeX throw করে না, কিন্তু math mode এ সরাসরি বাংলা অক্ষর দিলে
    // console এ warning দেয় ও গ্লিফ ভুল ফন্টে/তির্যকভাবে রেন্ডার হয়।
    // বাংলা লেখা math এর ভেতরে দিতে হলে `\text{...}` এ মুড়তে হবে।
    const outsideText = expr
      .replace(/\\text\{[^}]*\}/g, "")
      .replace(/\\mathrm\{[^}]*\}/g, "");
    if (/[\u0980-\u09FF]/.test(outsideText)) {
      problem(
        topic,
        field,
        `math mode এ \\text{} ছাড়া বাংলা: ${JSON.stringify(expr.slice(0, 70))}`
      );
    }
  }
}

async function main() {
  const topics = await prisma.topic.findMany({
    where: { notesMarkdown: { not: null } },
    select: {
      name: true,
      notesMarkdown: true,
      formulaSheet: true,
      chapter: { select: { subject: { select: { name: true, code: true } } } },
    },
    orderBy: { order: "asc" },
  });

  const withNotes = topics.filter((t) => (t.notesMarkdown?.length ?? 0) > 0);
  console.log(`=== নোট মান যাচাই: ${withNotes.length} টা টপিক ===\n`);

  const fingerprints = new Map<string, string[]>();

  for (const t of withNotes) {
    const subject = t.chapter.subject;
    const label = `${t.name} (${subject.name})`;
    const notes = t.notesMarkdown!;

    if (notes.length < 300) {
      problem(label, "notes", `খুব ছোট (${notes.length} অক্ষর)`);
    }
    if (!notes.trimStart().startsWith("#")) {
      problem(label, "notes", "markdown হেডিং (#) দিয়ে শুরু হয়নি");
    }

    // English সাবজেক্টের নোট ইংরেজিতেই থাকা স্বাভাবিক — সেখানে
    // বাংলা কম থাকলে সেটা সমস্যা নয় (আগের Python চেকার এটা ধরতে
    // না পেরে ৩টা false positive দিয়েছিল)
    if (subject.code !== "ENGLISH") {
      const bengali = (notes.match(/[\u0980-\u09FF]/g) ?? []).length;
      if (bengali < 50) {
        problem(label, "notes", `বাংলা অক্ষর খুব কম (${bengali} টা)`);
      }
    }

    checkKatex(label, "notes", notes);

    if (t.formulaSheet) {
      if (t.formulaSheet.length < 50) {
        problem(label, "formula", `খুব ছোট (${t.formulaSheet.length} অক্ষর)`);
      }
      checkKatex(label, "formula", t.formulaSheet);
    }

    const fp = notes.slice(0, 200).trim();
    fingerprints.set(fp, [...(fingerprints.get(fp) ?? []), label]);
  }

  for (const [, dupes] of fingerprints) {
    if (dupes.length > 1) {
      problems.push(`একই নোট ${dupes.length} টা টপিকে: ${dupes.join(", ")}`);
    }
  }

  // ---------- কভারেজ রিপোর্ট ----------
  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    select: {
      name: true,
      chapters: {
        select: {
          topics: { select: { notesMarkdown: true } },
        },
      },
    },
  });

  console.log("--- কভারেজ ---");
  let total = 0;
  let covered = 0;
  for (const s of subjects) {
    const all = s.chapters.flatMap((c) => c.topics);
    const w = all.filter((t) => (t.notesMarkdown?.length ?? 0) > 100).length;
    total += all.length;
    covered += w;
    const filled = all.length ? Math.round((20 * w) / all.length) : 0;
    const bar = "█".repeat(filled) + "░".repeat(20 - filled);
    const flag = w === all.length ? "✅" : "  ";
    console.log(`${flag} ${s.name.padEnd(26)} ${bar} ${String(w).padStart(3)}/${all.length}`);
  }
  const pct = total ? Math.round((100 * covered) / total) : 0;
  console.log(`\nমোট: ${covered}/${total} (${pct}%) · গ্যাপ ${total - covered}`);

  console.log(`\n=== ${withNotes.length} টা নোট যাচাই · ${problems.length} টা সমস্যা ===`);
  for (const p of problems) console.log(`  ❌ ${p}`);
  if (problems.length === 0) {
    console.log("✅ সব নোটের KaTeX ও markdown সিনট্যাক্স ঠিক আছে");
  }

  await prisma.$disconnect();
  process.exit(problems.length > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error("❌ সমস্যা:", e);
  await prisma.$disconnect();
  process.exit(1);
});
