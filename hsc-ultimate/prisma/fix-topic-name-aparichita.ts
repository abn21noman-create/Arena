// ===================================================================
// 🐛 বাগ ফিক্স — টপিকের নাম ইংরেজিতে লেখা ছিল
// -------------------------------------------------------------------
// MCQ গ্যাপ বিশ্লেষণ করার সময় ধরা পড়ল: বাংলা ১ম পত্রের একটি টপিকের
// `name` ফিল্ডে বাংলা নামের বদলে **ইংরেজি transliteration** বসানো
// ছিল — `"aparichita"`, অথচ `nameEn` এ ঠিকই `"Aparichita"` আছে।
//
// উৎস: prisma/seed.ts:755
//   { name: "aparichita", nameEn: "Aparichita", isImportant: true }
// বাকি সব টপিকে যেখানে যেমন: { name: "সোনার তরী", nameEn: "Sonar Tori" }
//
// প্রভাব (নিছক কসমেটিক নয়):
//   • পুরো অ্যাপ বাংলা-ভাষী শিক্ষার্থীর জন্য, অথচ "পড়া" তালিকায়,
//     bookmark এ, weak-topic রিপোর্টে ও PDF নোটের শিরোনামে ইংরেজি
//     "aparichita" দেখাচ্ছিল — ছোট হাতের অক্ষরে, যা আরও দৃষ্টিকটু।
//   • ঐ টপিকের `notesMarkdown` এর H1 কিন্তু ঠিকই "# অপরিচিতা" —
//     অর্থাৎ পেজের শিরোনাম ও নোটের শিরোনাম দুই রকম দেখাত।
//   • বাংলা সার্চে ("অপরিচিতা" লিখে খুঁজলে) টপিকটা পাওয়া যেত না।
//
// এই স্ক্রিপ্ট শুধু `name` ফিল্ড ঠিক করে; `nameEn` অপরিবর্তিত থাকে
// (সেটা ইংরেজিই হওয়ার কথা)। seed.ts ও ঠিক করা হয়েছে যাতে নতুন করে
// DB সিড করলে আবার ভুলটা ফিরে না আসে।
//
// রান: pnpm db:fix-topic-name-aparichita
// idempotent — আগে থেকে ঠিক থাকলে কিছু করে না।
// ===================================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const WRONG_NAME = "aparichita";
const CORRECT_NAME = "অপরিচিতা";

async function main() {
  console.log("🔍 ভুল টপিক-নাম খোঁজা হচ্ছে...\n");

  const topic = await prisma.topic.findFirst({
    where: { name: WRONG_NAME },
    select: { id: true, name: true, nameEn: true },
  });

  if (!topic) {
    // আগেই ঠিক করা হয়েছে কিনা যাচাই
    const fixed = await prisma.topic.findFirst({
      where: { name: CORRECT_NAME },
      select: { id: true, name: true, nameEn: true },
    });
    if (fixed) {
      console.log(`✓ আগেই ঠিক করা আছে: "${fixed.name}" (nameEn: "${fixed.nameEn}")`);
    } else {
      console.log(`⚠️  "${WRONG_NAME}" নামে কোনো টপিক পাওয়া যায়নি`);
    }
    return;
  }

  console.log(`❌ পাওয়া গেল: name="${topic.name}" nameEn="${topic.nameEn}"`);

  await prisma.topic.update({
    where: { id: topic.id },
    data: { name: CORRECT_NAME },
  });

  console.log(`✅ ঠিক করা হলো: name="${CORRECT_NAME}" (nameEn অপরিবর্তিত)\n`);

  // ---------- সামগ্রিক যাচাই ----------
  // একই শ্রেণির আর কোনো ভুল আছে কিনা — ENGLISH সাবজেক্ট বাদে সব
  // টপিক/চ্যাপ্টারের `name` এ অন্তত একটা বাংলা অক্ষর থাকা উচিত
  const allTopics = await prisma.topic.findMany({
    select: {
      name: true,
      chapter: { select: { name: true, subject: { select: { name: true, code: true } } } },
    },
  });

  const bengaliRe = /[\u0980-\u09FF]/;
  const suspects = allTopics.filter(
    (t) => t.chapter.subject.code !== "ENGLISH" && !bengaliRe.test(t.name)
  );

  if (suspects.length === 0) {
    console.log("✅ বাকি সব টপিকের নাম বাংলায় আছে (English সাবজেক্ট বাদে)");
  } else {
    console.log(`⚠️  আরও ${suspects.length} টা টপিকের নামে বাংলা নেই:`);
    for (const s of suspects) {
      console.log(`   • [${s.chapter.subject.name}] ${s.chapter.name} → "${s.name}"`);
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
