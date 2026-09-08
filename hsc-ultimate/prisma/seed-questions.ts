// ===================================================================
// Question Bank Seed Script
// -------------------------------------------------------------------
// গুরুত্বপূর্ণ কিছু টপিকের জন্য বাস্তব ও সঠিক MCQ প্রশ্ন তৈরি করে।
// এটা idempotent — বার বার চালালে আগের প্রশ্ন মুছে নতুন করে বসাবে।
//
// রান করার নিয়ম: pnpm db:seed-questions
// ===================================================================
import { PrismaClient, Difficulty } from "@prisma/client";

import { assertDestructiveSeedAllowed } from "./seed-safety";
const prisma = new PrismaClient();

interface QuestionSeed {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
}

// টপিকের নাম দিয়ে ম্যাচ করে প্রশ্ন বসানো হবে
const questionsByTopic: Record<string, QuestionSeed[]> = {
  "একক ও পরিমাপ": [
    {
      text: "SI পদ্ধতিতে বলের একক কী?",
      options: ["জুল", "নিউটন", "ওয়াট", "প্যাসকেল"],
      correctAnswer: "নিউটন",
      explanation: "SI পদ্ধতিতে বলের একক নিউটন (N)। F = ma থেকে, 1N = 1kg·m/s²।",
      difficulty: "EASY",
    },
    {
      text: "দৈর্ঘ্যের মৌলিক একক কোনটি?",
      options: ["সেন্টিমিটার", "মিটার", "কিলোমিটার", "ফুট"],
      correctAnswer: "মিটার",
      explanation: "SI পদ্ধতিতে দৈর্ঘ্যের মৌলিক (base) একক হলো মিটার (m)।",
      difficulty: "EASY",
    },
    {
      text: "ভরের মাত্রা সমীকরণ কোনটি?",
      options: ["[M]", "[L]", "[T]", "[MLT]"],
      correctAnswer: "[M]",
      explanation: "ভর একটি মৌলিক রাশি, এর মাত্রা সমীকরণ [M]।",
      difficulty: "MEDIUM",
    },
    {
      text: "চাপের মাত্রা সমীকরণ কোনটি?",
      options: ["[ML⁻¹T⁻²]", "[MLT⁻²]", "[ML²T⁻²]", "[MLT⁻¹]"],
      correctAnswer: "[ML⁻¹T⁻²]",
      explanation: "চাপ = বল/ক্ষেত্রফল = [MLT⁻²]/[L²] = [ML⁻¹T⁻²]।",
      difficulty: "HARD",
    },
  ],

  "নিউটনের গতিসূত্র": [
    {
      text: "নিউটনের প্রথম সূত্র কোন ধারণার সাথে সম্পর্কিত?",
      options: ["জড়তা", "ত্বরণ", "ভরবেগ", "শক্তি"],
      correctAnswer: "জড়তা",
      explanation: "নিউটনের প্রথম সূত্র জড়তার সূত্র নামে পরিচিত — বাহ্যিক বল প্রয়োগ না করলে বস্তু তার গতির অবস্থা বজায় রাখে।",
      difficulty: "EASY",
    },
    {
      text: "F = ma সমীকরণটি নিউটনের কততম সূত্র থেকে পাওয়া যায়?",
      options: ["প্রথম", "দ্বিতীয়", "তৃতীয়", "কোনোটিই নয়"],
      correctAnswer: "দ্বিতীয়",
      explanation: "নিউটনের দ্বিতীয় সূত্র থেকে F = ma সমীকরণ পাওয়া যায়, যেখানে বল ভরবেগের পরিবর্তনের হারের সমানুপাতিক।",
      difficulty: "EASY",
    },
    {
      text: "নিউটনের তৃতীয় সূত্র অনুযায়ী প্রতিটি ক্রিয়ার জন্য থাকে —",
      options: [
        "সমান ও একই দিকে প্রতিক্রিয়া",
        "সমান ও বিপরীত দিকে প্রতিক্রিয়া",
        "অসম প্রতিক্রিয়া",
        "কোনো প্রতিক্রিয়া থাকে না",
      ],
      correctAnswer: "সমান ও বিপরীত দিকে প্রতিক্রিয়া",
      explanation: "নিউটনের তৃতীয় সূত্র: প্রতিটি ক্রিয়ার একটি সমান ও বিপরীতমুখী প্রতিক্রিয়া থাকে।",
      difficulty: "EASY",
    },
    {
      text: "5 kg ভরের একটি বস্তুর উপর 20 N বল প্রয়োগ করলে ত্বরণ কত হবে?",
      options: ["2 m/s²", "4 m/s²", "5 m/s²", "10 m/s²"],
      correctAnswer: "4 m/s²",
      explanation: "F = ma থেকে, a = F/m = 20/5 = 4 m/s²।",
      difficulty: "MEDIUM",
    },
  ],

  "শক্তি ও শক্তির নিত্যতা": [
    {
      text: "গতিশক্তির সূত্র কোনটি?",
      options: ["mgh", "½mv²", "mv", "Fs"],
      correctAnswer: "½mv²",
      explanation: "গতিশক্তি E_k = ½mv², যেখানে m ভর এবং v বেগ।",
      difficulty: "EASY",
    },
    {
      text: "শক্তির নিত্যতা সূত্র অনুযায়ী শক্তি —",
      options: [
        "সৃষ্টি করা যায় কিন্তু ধ্বংস করা যায় না",
        "ধ্বংস করা যায় কিন্তু সৃষ্টি করা যায় না",
        "সৃষ্টি বা ধ্বংস করা যায় না, শুধু রূপান্তরিত হয়",
        "সবসময় স্থির থাকে",
      ],
      correctAnswer: "সৃষ্টি বা ধ্বংস করা যায় না, শুধু রূপান্তরিত হয়",
      explanation: "শক্তির নিত্যতা সূত্র: শক্তি সৃষ্টি বা ধ্বংস করা যায় না, শুধু এক রূপ থেকে অন্য রূপে রূপান্তরিত হয়।",
      difficulty: "EASY",
    },
    {
      text: "10 m উচ্চতা থেকে 2 kg ভরের বস্তু পড়লে অভিকর্ষজ বিভবশক্তি কত? (g=10 m/s²)",
      options: ["100 J", "200 J", "20 J", "50 J"],
      correctAnswer: "200 J",
      explanation: "বিভবশক্তি = mgh = 2 × 10 × 10 = 200 J।",
      difficulty: "MEDIUM",
    },
  ],

  "ওহমের সূত্র": [
    {
      text: "ওহমের সূত্র অনুযায়ী V = ?",
      options: ["IR", "I/R", "R/I", "I²R"],
      correctAnswer: "IR",
      explanation: "ওহমের সূত্র: V = IR, যেখানে V বিভব পার্থক্য, I প্রবাহ এবং R রোধ।",
      difficulty: "EASY",
    },
    {
      text: "একটি পরিবাহীর রোধ 10Ω এবং তড়িৎ প্রবাহ 2A হলে বিভব পার্থক্য কত?",
      options: ["5 V", "12 V", "20 V", "8 V"],
      correctAnswer: "20 V",
      explanation: "V = IR = 2 × 10 = 20 V।",
      difficulty: "MEDIUM",
    },
    {
      text: "রোধের একক কী?",
      options: ["অ্যাম্পিয়ার", "ভোল্ট", "ওহম", "ওয়াট"],
      correctAnswer: "ওহম",
      explanation: "তড়িৎ রোধের একক ওহম (Ω)।",
      difficulty: "EASY",
    },
  ],

  "পর্যায় সারণি": [
    {
      text: "বর্তমান পর্যায় সারণিতে মৌলসমূহ কী অনুযায়ী সাজানো?",
      options: ["পারমাণবিক ভর", "পারমাণবিক সংখ্যা", "ঘনত্ব", "গলনাঙ্ক"],
      correctAnswer: "পারমাণবিক সংখ্যা",
      explanation: "আধুনিক পর্যায় সূত্র অনুযায়ী মৌলসমূহকে পারমাণবিক সংখ্যার ক্রমানুসারে সাজানো হয়েছে।",
      difficulty: "EASY",
    },
    {
      text: "পর্যায় সারণিতে একই শ্রেণির মৌলগুলোর কী মিল থাকে?",
      options: [
        "একই পারমাণবিক ভর",
        "একই সংখ্যক যোজ্যতা ইলেকট্রন",
        "একই সংখ্যক শক্তিস্তর",
        "একই ঘনত্ব",
      ],
      correctAnswer: "একই সংখ্যক যোজ্যতা ইলেকট্রন",
      explanation: "একই শ্রেণির (group) মৌলগুলোর যোজ্যতা ইলেকট্রনের সংখ্যা একই থাকে, তাই তাদের রাসায়নিক ধর্ম একই রকম হয়।",
      difficulty: "MEDIUM",
    },
    {
      text: "পর্যায় সারণিতে বাম থেকে ডানে গেলে পারমাণবিক ব্যাসার্ধ সাধারণত কেমন হয়?",
      options: ["বৃদ্ধি পায়", "হ্রাস পায়", "অপরিবর্তিত থাকে", "প্রথমে বাড়ে তারপর কমে"],
      correctAnswer: "হ্রাস পায়",
      explanation: "একই পর্যায়ে বাম থেকে ডানে গেলে নিউক্লিয়ার চার্জ বৃদ্ধি পাওয়ায় পারমাণবিক ব্যাসার্ধ হ্রাস পায়।",
      difficulty: "MEDIUM",
    },
  ],

  "মোল ধারণা": [
    {
      text: "১ মোল পদার্থে কতগুলো কণা থাকে? (অ্যাভোগেড্রো সংখ্যা)",
      options: ["6.022 × 10²²", "6.022 × 10²³", "6.022 × 10²⁴", "6.022 × 10²¹"],
      correctAnswer: "6.022 × 10²³",
      explanation: "অ্যাভোগেড্রো সংখ্যা = 6.022 × 10²³, যা এক মোল পদার্থে অণু/পরমাণুর সংখ্যা নির্দেশ করে।",
      difficulty: "EASY",
    },
    {
      text: "STP তে ১ মোল আদর্শ গ্যাসের আয়তন কত?",
      options: ["11.2 লিটার", "22.4 লিটার", "44.8 লিটার", "33.6 লিটার"],
      correctAnswer: "22.4 লিটার",
      explanation: "STP (0°C, 1 atm) তে ১ মোল আদর্শ গ্যাসের আয়তন 22.4 লিটার।",
      difficulty: "MEDIUM",
    },
    {
      text: "কার্বনের আণবিক ভর 12 হলে, 24 গ্রাম কার্বনে কত মোল কার্বন আছে?",
      options: ["0.5 মোল", "1 মোল", "2 মোল", "12 মোল"],
      correctAnswer: "2 মোল",
      explanation: "মোল সংখ্যা = ভর/আণবিক ভর = 24/12 = 2 মোল।",
      difficulty: "MEDIUM",
    },
  ],

  "কোষের সংজ্ঞা ও প্রকারভেদ": [
    {
      text: "কোষের কোন অংশকে 'কোষের মস্তিষ্ক' বলা হয়?",
      options: ["মাইটোকন্ড্রিয়া", "নিউক্লিয়াস", "রাইবোজোম", "গলগি বডি"],
      correctAnswer: "নিউক্লিয়াস",
      explanation: "নিউক্লিয়াস কোষের সকল কার্যক্রম নিয়ন্ত্রণ করে বলে একে কোষের মস্তিষ্ক বলা হয়।",
      difficulty: "EASY",
    },
    {
      text: "প্রোক্যারিওটিক কোষে কোনটি অনুপস্থিত?",
      options: ["কোষ প্রাচীর", "সুগঠিত নিউক্লিয়াস", "সাইটোপ্লাজম", "রাইবোজোম"],
      correctAnswer: "সুগঠিত নিউক্লিয়াস",
      explanation: "প্রোক্যারিওটিক কোষে সুগঠিত নিউক্লিয়াস (নিউক্লিয়ার মেমব্রেন সহ) থাকে না, যেমন ব্যাকটেরিয়া।",
      difficulty: "MEDIUM",
    },
    {
      text: "কোষের 'পাওয়ার হাউজ' বলা হয় কাকে?",
      options: ["নিউক্লিয়াস", "রাইবোজোম", "মাইটোকন্ড্রিয়া", "লাইসোজোম"],
      correctAnswer: "মাইটোকন্ড্রিয়া",
      explanation: "মাইটোকন্ড্রিয়া কোষের শক্তি (ATP) উৎপাদন করে বলে একে কোষের পাওয়ার হাউজ বলা হয়।",
      difficulty: "EASY",
    },
  ],

  "সালোকসংশ্লেষণ": [
    {
      text: "সালোকসংশ্লেষণ প্রক্রিয়া উদ্ভিদের কোন অংশে বেশি ঘটে?",
      options: ["মূল", "কাণ্ড", "পাতা", "ফুল"],
      correctAnswer: "পাতা",
      explanation: "পাতায় ক্লোরোফিল সমৃদ্ধ ক্লোরোপ্লাস্ট বেশি থাকায় সালোকসংশ্লেষণ প্রধানত পাতায় ঘটে।",
      difficulty: "EASY",
    },
    {
      text: "সালোকসংশ্লেষণের জন্য প্রয়োজনীয় গ্যাস কোনটি?",
      options: ["অক্সিজেন", "কার্বন ডাই অক্সাইড", "নাইট্রোজেন", "হাইড্রোজেন"],
      correctAnswer: "কার্বন ডাই অক্সাইড",
      explanation: "সালোকসংশ্লেষণে উদ্ভিদ বায়ুমণ্ডল থেকে CO₂ গ্রহণ করে এবং সূর্যালোকের সাহায্যে খাদ্য তৈরি করে।",
      difficulty: "EASY",
    },
    {
      text: "সালোকসংশ্লেষণের ফলে উৎপন্ন উপজাত পদার্থ কোনটি?",
      options: ["কার্বন ডাই অক্সাইড", "অক্সিজেন", "নাইট্রোজেন", "মিথেন"],
      correctAnswer: "অক্সিজেন",
      explanation: "সালোকসংশ্লেষণ প্রক্রিয়ায় পানি বিভাজিত হয়ে অক্সিজেন উপজাত হিসেবে নির্গত হয়।",
      difficulty: "MEDIUM",
    },
  ],

  "এনজাইম": [
    {
      text: "এনজাইম মূলত কী দিয়ে গঠিত?",
      options: ["কার্বোহাইড্রেট", "প্রোটিন", "লিপিড", "নিউক্লিক এসিড"],
      correctAnswer: "প্রোটিন",
      explanation: "এনজাইম হলো জৈব অনুঘটক যা মূলত প্রোটিন দিয়ে গঠিত।",
      difficulty: "EASY",
    },
    {
      text: "এনজাইমের কাজ কী?",
      options: [
        "শক্তি সঞ্চয় করা",
        "বিক্রিয়ার হার বৃদ্ধি করা",
        "কোষ বিভাজন ঘটানো",
        "জিনগত তথ্য বহন করা",
      ],
      correctAnswer: "বিক্রিয়ার হার বৃদ্ধি করা",
      explanation: "এনজাইম জৈব অনুঘটক হিসেবে কাজ করে রাসায়নিক বিক্রিয়ার হার বহুগুণে বৃদ্ধি করে।",
      difficulty: "EASY",
    },
  ],

  "নির্ণায়কের মান নির্ণয়": [
    {
      text: "|1 2; 3 4| নির্ণায়কের মান কত?",
      options: ["-2", "2", "-1", "1"],
      correctAnswer: "-2",
      explanation: "নির্ণায়কের মান = (1×4) - (2×3) = 4 - 6 = -2।",
      difficulty: "MEDIUM",
    },
    {
      text: "একটি ২×২ ম্যাট্রিক্সের নির্ণায়কের সাধারণ সূত্র কোনটি?",
      options: ["ad + bc", "ad - bc", "ac - bd", "ac + bd"],
      correctAnswer: "ad - bc",
      explanation: "[[a,b],[c,d]] ম্যাট্রিক্সের নির্ণায়ক = ad - bc।",
      difficulty: "EASY",
    },
  ],

  "দ্বিপদী উপপাদ্য": [
    {
      text: "(x+y)² এর বিস্তৃতি কোনটি?",
      options: ["x² + y²", "x² + 2xy + y²", "x² - 2xy + y²", "x² + xy + y²"],
      correctAnswer: "x² + 2xy + y²",
      explanation: "দ্বিপদী উপপাদ্য অনুযায়ী (x+y)² = x² + 2xy + y²।",
      difficulty: "EASY",
    },
    {
      text: "(x+y)ⁿ এর বিস্তৃতিতে পদের সংখ্যা কয়টি?",
      options: ["n", "n-1", "n+1", "2n"],
      correctAnswer: "n+1",
      explanation: "দ্বিপদী উপপাদ্য অনুযায়ী (x+y)ⁿ এর বিস্তৃতিতে মোট (n+1) টি পদ থাকে।",
      difficulty: "MEDIUM",
    },
  ],
};

async function main() {
  assertDestructiveSeedAllowed("seed-questions.ts");
  console.log("🌱 Question Bank Seeding শুরু হচ্ছে...\n");

  let totalCreated = 0;
  const topicsNotFound: string[] = [];

  for (const [topicName, questions] of Object.entries(questionsByTopic)) {
    const topic = await prisma.topic.findFirst({
      where: { name: topicName },
    });

    if (!topic) {
      topicsNotFound.push(topicName);
      continue;
    }

    // আগের প্রশ্ন মুছে ফেলা হচ্ছে (idempotent রাখার জন্য)
    await prisma.question.deleteMany({ where: { topicId: topic.id } });

    await prisma.question.createMany({
      data: questions.map((q) => ({
        topicId: topic.id,
        type: "MCQ" as const,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })),
    });

    console.log(`✅ ${topicName} — ${questions.length}টি প্রশ্ন যোগ হলো`);
    totalCreated += questions.length;
  }

  if (topicsNotFound.length > 0) {
    console.log(`\n⚠️  এই টপিকগুলো পাওয়া যায়নি: ${topicsNotFound.join(", ")}`);
  }

  console.log(`\n✅ মোট ${totalCreated}টি প্রশ্ন সিড করা হলো!`);
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
