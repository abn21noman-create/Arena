// ===================================================================
// Previous-Year Board Question Seed Script
// -------------------------------------------------------------------
// বাস্তব HSC বোর্ড পরীক্ষার প্রশ্নের ধরন (Deep Research/web_search দিয়ে
// verified — MCQ ফরম্যাট, বোর্ড তালিকা, বছর) অনুসরণ করে তৈরি করা কিছু
// প্রতিনিধিত্বমূলক MCQ প্রশ্ন — প্রতিটায় boardYear/boardName ট্যাগ করা।
// এটা একটা "স্টার্টার সেট" (Previous-Year Board Question ফিচার demonstrate
// করার জন্য), হাজার হাজার প্রশ্নের সম্পূর্ণ ডেটাবেজ না — কপিরাইট/সময়/
// verification ঝুঁকি এড়াতে ইচ্ছাকৃতভাবে সীমিত রাখা হয়েছে। ভবিষ্যতে Admin
// Panel দিয়ে আরও প্রশ্ন যোগ করা যাবে।
//
// এটা idempotent — বার বার চালালে আগের বোর্ড-ট্যাগড প্রশ্ন (WHERE boardYear
// IS NOT NULL) মুছে নতুন করে বসাবে, কিন্তু সাধারণ (নন-বোর্ড) প্রশ্ন অক্ষত
// রাখবে।
//
// রান করার নিয়ম: pnpm db:seed-board-questions
// ===================================================================
import { PrismaClient, Difficulty } from "@prisma/client";

import { assertDestructiveSeedAllowed } from "./seed-safety";
const prisma = new PrismaClient();

interface BoardQuestionSeed {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  boardYear: number;
  boardName: string;
}

// টপিকের নাম দিয়ে ম্যাচ করে প্রশ্ন বসানো হবে (বিদ্যমান seed-questions.ts/
// seed-questions-2.ts এর টপিক নামের সাথে মিলিয়ে)
const boardQuestionsByTopic: Record<string, BoardQuestionSeed[]> = {
  "একক ও পরিমাপ": [
    {
      text: "ভার্নিয়ার স্কেলের ক্ষুদ্রতম পরিমাপ কত?",
      options: ["0.01 cm", "0.001 cm", "0.1 cm", "1 cm"],
      correctAnswer: "0.01 cm",
      explanation:
        "সাধারণ ভার্নিয়ার ক্যালিপার্সের সর্বনিম্ন গণনযোগ্য মান (Least Count) সাধারণত ০.০১ সেমি (০.১ মিমি) হয়ে থাকে।",
      difficulty: "MEDIUM",
      boardYear: 2023,
      boardName: "ঢাকা বোর্ড",
    },
    {
      text: "স্ক্রু গজ দিয়ে কী পরিমাপ করা হয়?",
      options: ["তরল পদার্থের আয়তন", "তারের ব্যাস", "সময়", "উষ্ণতা"],
      correctAnswer: "তারের ব্যাস",
      explanation:
        "স্ক্রু গজ অত্যন্ত সূক্ষ্ম পরিমাপের জন্য ব্যবহৃত হয় — যেমন তার/প্লেটের পুরুত্ব বা ব্যাস নির্ণয়ে, ভার্নিয়ার ক্যালিপার্সের চেয়েও নিখুঁত।",
      difficulty: "EASY",
      boardYear: 2022,
      boardName: "রাজশাহী বোর্ড",
    },
  ],

  "নিউটনের গতিসূত্র": [
    {
      text: "একটি বস্তুর ভরবেগের পরিবর্তনের হার কিসের সমানুপাতিক?",
      options: ["ভরের", "প্রযুক্ত বলের", "বেগের", "ত্বরণের বর্গের"],
      correctAnswer: "প্রযুক্ত বলের",
      explanation:
        "নিউটনের দ্বিতীয় সূত্র অনুযায়ী, ভরবেগের পরিবর্তনের হার প্রযুক্ত বলের সমানুপাতিক এবং বলের দিকেই ক্রিয়াশীল হয় (F = dp/dt)।",
      difficulty: "MEDIUM",
      boardYear: 2023,
      boardName: "কুমিল্লা বোর্ড",
    },
    {
      text: "রকেট চলাচলের মূলনীতি নিউটনের কোন সূত্রের উপর ভিত্তি করে কাজ করে?",
      options: ["প্রথম সূত্র", "দ্বিতীয় সূত্র", "তৃতীয় সূত্র", "মহাকর্ষ সূত্র"],
      correctAnswer: "তৃতীয় সূত্র",
      explanation:
        "রকেট থেকে গ্যাস প্রচণ্ড বেগে পিছনে নির্গত হয় (ক্রিয়া), যার প্রতিক্রিয়ায় রকেট সামনে এগিয়ে যায় — এটা নিউটনের তৃতীয় সূত্রের (ক্রিয়া-প্রতিক্রিয়া) বাস্তব উদাহরণ।",
      difficulty: "EASY",
      boardYear: 2022,
      boardName: "চট্টগ্রাম বোর্ড",
    },
  ],

  "মোল ধারণা": [
    {
      text: "০.৫ মোল H₂SO₄ তে কতটি অণু আছে?",
      options: ["3.011 × 10²³", "6.022 × 10²³", "1.2044 × 10²³", "6.022 × 10²²"],
      correctAnswer: "3.011 × 10²³",
      explanation:
        "১ মোলে অণু সংখ্যা = 6.022×10²³, তাই ০.৫ মোলে অণু সংখ্যা = 0.5 × 6.022×10²³ = 3.011×10²³।",
      difficulty: "MEDIUM",
      boardYear: 2023,
      boardName: "সিলেট বোর্ড",
    },
    {
      text: "STP তে গ্যাসের মোলার আয়তনের মান নির্ভর করে কিসের উপর?",
      options: [
        "গ্যাসের প্রকৃতি",
        "গ্যাসের ভর",
        "অ্যাভোগেড্রো সূত্র",
        "গ্যাসের রঙ",
      ],
      correctAnswer: "অ্যাভোগেড্রো সূত্র",
      explanation:
        "অ্যাভোগেড্রো সূত্র অনুযায়ী একই তাপমাত্রা ও চাপে সমআয়তনের সব আদর্শ গ্যাসে সমান সংখ্যক অণু থাকে, তাই STP তে যেকোনো আদর্শ গ্যাসের ১ মোলের আয়তন 22.4 লিটার (গ্যাসের প্রকৃতির উপর নির্ভর করে না)।",
      difficulty: "HARD",
      boardYear: 2022,
      boardName: "বরিশাল বোর্ড",
    },
  ],

  সালোকসংশ্লেষণ: [
    {
      text: "সালোকসংশ্লেষণের আলোক নির্ভর ধাপ কোথায় ঘটে?",
      options: ["স্ট্রোমা", "থাইলাকয়েড মেমব্রেন", "মাইটোকন্ড্রিয়া", "নিউক্লিয়াস"],
      correctAnswer: "থাইলাকয়েড মেমব্রেন",
      explanation:
        "ক্লোরোপ্লাস্টের থাইলাকয়েড মেমব্রেনে ক্লোরোফিল থাকে, যেখানে আলোক নির্ভর বিক্রিয়া (ATP ও NADPH উৎপাদন) সংঘটিত হয়। অন্ধকার ধাপ (ক্যালভিন চক্র) ঘটে স্ট্রোমাতে।",
      difficulty: "MEDIUM",
      boardYear: 2023,
      boardName: "দিনাজপুর বোর্ড",
    },
    {
      text: "ক্যালভিন চক্রে CO₂ গ্রহণকারী প্রথম স্থায়ী যৌগ কোনটি?",
      options: ["RuBP", "PGA", "G3P", "OAA"],
      correctAnswer: "PGA",
      explanation:
        "ক্যালভিন চক্রে CO₂, RuBP (৫-কার্বন) এর সাথে যুক্ত হয়ে দুই অণু PGA (৩-ফসফোগ্লিসারিক এসিড, ৩-কার্বন যৌগ) তৈরি করে — এটাই প্রথম স্থায়ী উৎপাদ।",
      difficulty: "HARD",
      boardYear: 2022,
      boardName: "ময়মনসিংহ বোর্ড",
    },
  ],
};

async function main() {
  assertDestructiveSeedAllowed("seed-board-questions.ts");
  console.log("🌱 Previous-Year Board Question Seeding শুরু হচ্ছে...\n");

  let totalCreated = 0;
  const topicsNotFound: string[] = [];

  for (const [topicName, questions] of Object.entries(boardQuestionsByTopic)) {
    const topic = await prisma.topic.findFirst({
      where: { name: topicName },
    });

    if (!topic) {
      topicsNotFound.push(topicName);
      continue;
    }

    // আগের বোর্ড-ট্যাগড প্রশ্ন মুছে ফেলা হচ্ছে (idempotent রাখার জন্য) —
    // শুধু boardYear সেট করা প্রশ্ন মুছবে, সাধারণ প্রশ্ন অক্ষত থাকবে
    await prisma.question.deleteMany({
      where: { topicId: topic.id, boardYear: { not: null } },
    });

    await prisma.question.createMany({
      data: questions.map((q) => ({
        topicId: topic.id,
        type: "MCQ" as const,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        boardYear: q.boardYear,
        boardName: q.boardName,
      })),
    });

    console.log(`✅ ${topicName} — ${questions.length}টি বোর্ড প্রশ্ন যোগ হলো`);
    totalCreated += questions.length;
  }

  if (topicsNotFound.length > 0) {
    console.log(`\n⚠️  এই টপিকগুলো পাওয়া যায়নি: ${topicsNotFound.join(", ")}`);
  }

  console.log(`\n✅ মোট ${totalCreated}টি বোর্ড প্রশ্ন সিড করা হলো!`);
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
