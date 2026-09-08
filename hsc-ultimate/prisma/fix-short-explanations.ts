// ===================================================================
// 🐛 কনটেন্ট ফিক্স — অতি-সংক্ষিপ্ত ব্যাখ্যা সমৃদ্ধ করা
// -------------------------------------------------------------------
// `pnpm verify:questions` চালিয়ে ধরা পড়ল, ৬৭৭টা প্রশ্নের মধ্যে ৩টার
// ব্যাখ্যা ১২-১৩ অক্ষরের — শুধু সূত্রটা লেখা, কোনো ব্যাখ্যা নেই:
//
//   • "C(6,2) = 15।"        (সমাবেশ)
//   • "F = Gm₁m₂/r²।"       (নিউটনের মহাকর্ষ সূত্র)
//   • "e = −N·dΦ/dt।"       (ফ্যারাডের সূত্র)
//
// ব্যাখ্যাগুলো **ভুল নয়**, কিন্তু ছাত্র ভুল উত্তর দেওয়ার পর এগুলো
// দেখে "কেন" বুঝতে পারে না — শুধু সূত্র মুখস্থ করার ইঙ্গিত পায়।
// অন্য ৬৭৪টা প্রশ্নের ব্যাখ্যা গড়ে ~৭০ অক্ষরের ও যুক্তি ব্যাখ্যা করে,
// তাই এই ৩টা মান-অসামঞ্জস্য তৈরি করছিল।
//
// এই স্ক্রিপ্ট প্রশ্নের `text` মিলিয়ে ঐ ৩টা রেকর্ড খুঁজে ব্যাখ্যা
// আপডেট করে। প্রশ্ন, অপশন বা সঠিক উত্তর — কিছুই বদলায় না।
//
// রান: pnpm db:fix-short-explanations
// idempotent — আগে থেকে সমৃদ্ধ থাকলে বাদ দেয়।
// ===================================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ExplanationFix {
  /** প্রশ্নের text এর শুরু — এটি দিয়ে রেকর্ড খোঁজা হয় */
  textStartsWith: string;
  topicName: string;
  newExplanation: string;
}

const fixes: ExplanationFix[] = [
  {
    textStartsWith: "৬টি বস্তু থেকে ২টি বাছাইয়ের উপায়",
    topicName: "সমাবেশ",
    newExplanation:
      "সমাবেশে ক্রম গুরুত্বপূর্ণ নয় (কে আগে বাছাই হলো তা বিবেচ্য নয়), তাই সমাবেশ সূত্র প্রযোজ্য: " +
      "C(n,r) = n! / [r!(n−r)!]। এখানে n = 6, r = 2, তাই C(6,2) = (6×5)/(2×1) = 15। " +
      "লক্ষ করো — বিন্যাস হলে P(6,2) = 30 হতো, অর্থাৎ সমাবেশের ঠিক দ্বিগুণ।",
  },
  {
    textStartsWith: "মহাকর্ষ বল দুটি বস্তুর ভরের সাথে",
    topicName: "নিউটনের মহাকর্ষ সূত্র",
    newExplanation:
      "নিউটনের মহাকর্ষ সূত্র: F = Gm₁m₂/r²। অর্থাৎ মহাকর্ষ বল দুই বস্তুর ভরের গুণফলের " +
      "সমানুপাতিক এবং তাদের মধ্যবর্তী দূরত্বের বর্গের ব্যস্তানুপাতিক। তাই কোনো একটি বস্তুর " +
      "ভর দ্বিগুণ করলে বল দ্বিগুণ হয়, কিন্তু দূরত্ব দ্বিগুণ করলে বল চার ভাগের এক ভাগ হয়ে যায়। " +
      "G = 6.673×10⁻¹¹ Nm²kg⁻² একটি সার্বজনীন ধ্রুবক।",
  },
  {
    textStartsWith: "ফ্যারাডের তড়িৎচুম্বকীয় আবেশ সূত্র",
    topicName: "ফ্যারাডের সূত্র",
    newExplanation:
      "ফ্যারাডের সূত্র: e = −N·dΦ/dt। আবিষ্ট তড়িচ্চালক বল চৌম্বক ফ্লাক্সের **পরিবর্তনের হারের** " +
      "সমানুপাতিক — ফ্লাক্সের মানের নয়। তাই ফ্লাক্স যত বড়ই হোক, স্থির থাকলে কোনো EMF আবিষ্ট হয় না " +
      "(এ কারণেই ট্রান্সফরমার DC তে কাজ করে না)। ঋণাত্মক চিহ্নটি লেঞ্জের সূত্র নির্দেশ করে: " +
      "আবিষ্ট প্রবাহ সবসময় তার সৃষ্টির কারণকে বাধা দেয়, যা শক্তির সংরক্ষণ সূত্রেরই প্রকাশ।",
  },
];

const MIN_GOOD_LENGTH = 15;

async function main() {
  console.log("🔍 অতি-সংক্ষিপ্ত ব্যাখ্যা খোঁজা ও সমৃদ্ধ করা হচ্ছে...\n");

  let updated = 0;
  let skipped = 0;
  const notFound: string[] = [];

  for (const fix of fixes) {
    const question = await prisma.question.findFirst({
      where: {
        text: { startsWith: fix.textStartsWith },
        topic: { name: fix.topicName },
      },
      select: { id: true, text: true, explanation: true },
    });

    if (!question) {
      notFound.push(`${fix.topicName} — "${fix.textStartsWith}"`);
      continue;
    }

    const currentLen = (question.explanation ?? "").trim().length;
    if (currentLen >= MIN_GOOD_LENGTH && question.explanation !== null) {
      // আগেই সমৃদ্ধ করা হয়েছে (বা অন্য কেউ ঠিক করেছে)
      console.log(`✓  [${fix.topicName}] আগেই সমৃদ্ধ (${currentLen} অক্ষর), বাদ দেওয়া হলো`);
      skipped += 1;
      continue;
    }

    await prisma.question.update({
      where: { id: question.id },
      data: { explanation: fix.newExplanation },
    });

    console.log(
      `✅ [${fix.topicName}] ব্যাখ্যা ${currentLen} → ${fix.newExplanation.length} অক্ষর`
    );
    updated += 1;
  }

  if (notFound.length > 0) {
    console.log(`\n⚠️  পাওয়া যায়নি:\n   ${notFound.join("\n   ")}`);
  }

  console.log(`\n📊 ফলাফল: আপডেট ${updated} · অপরিবর্তিত ${skipped}`);

  // ---------- যাচাই: আর কোনো ছোট ব্যাখ্যা আছে কিনা ----------
  const all = await prisma.question.findMany({
    select: {
      explanation: true,
      text: true,
      topic: { select: { name: true } },
    },
  });
  const stillShort = all.filter(
    (q) => !q.explanation || q.explanation.trim().length < MIN_GOOD_LENGTH
  );

  if (stillShort.length === 0) {
    console.log(`✅ সব ${all.length} টা প্রশ্নের ব্যাখ্যা যথেষ্ট দীর্ঘ`);
  } else {
    console.log(`⚠️  এখনো ${stillShort.length} টা প্রশ্নের ব্যাখ্যা ছোট:`);
    for (const q of stillShort) {
      console.log(`   • [${q.topic.name}] ${q.text.slice(0, 50)}`);
    }
  }

  const lens = all
    .map((q) => (q.explanation ?? "").trim().length)
    .filter((n) => n > 0);
  const avg = Math.round(lens.reduce((a, b) => a + b, 0) / lens.length);
  console.log(`   ব্যাখ্যার গড় দৈর্ঘ্য: ${avg} অক্ষর`);
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
