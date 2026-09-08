// ===================================================================
// MCQ Question Bank Seed Script — Physics 1st+2nd Paper এর ৪টা
// isImportant টপিক যেখানে আগে কোনো MCQ ছিল না
// -------------------------------------------------------------------
// DB অডিট করে দেখা গেছে সব isImportant টপিকে Notes+CQ কভারেজ ১০০%
// সম্পূর্ণ হলেও, MCQ Question Bank এ এখনো বেশ কিছু isImportant
// টপিকে শূন্য প্রশ্ন আছে। এই স্ক্রিপ্টে Physics এর ৪টা এমন টপিকে
// (গ্যাসের গতিতত্ত্ব, সরল ছন্দিত স্পন্দন গতি, প্রক্ষেপক গতি [Physics
// 1st Paper], তাপগতিবিদ্যার সূত্রাবলি [Physics 2nd Paper]) বাস্তব
// MCQ প্রশ্ন যোগ করা হয়েছে — seed-questions.ts এর প্রমাণিত প্যাটার্ন
// অনুসরণ করে।
//
// ⚠️ "প্রক্ষেপক গতি" নামে DB তে দুটো টপিক আছে (Physics 1st Paper ও
// Higher Math 2nd Paper এ) — CQ ফিচারে আবিষ্কৃত collision বাগের
// শিক্ষা অনুযায়ী এখানে subject-aware লুকআপ ব্যবহার করা হয়েছে।
//
// সব সংখ্যাগত হিসাব Python দিয়ে আগে থেকে ভেরিফাই করা হয়েছে (আদর্শ
// গ্যাস সমীকরণ, বয়েলের সূত্র, c_rms, সরল দোলকের পর্যায়কাল,
// স্প্রিং-ভর ব্যবস্থার পর্যায়কাল ও সর্বোচ্চ বেগ, প্রক্ষেপকের H/T/R,
// তাপগতিবিদ্যার প্রথম সূত্র প্রয়োগ)।
//
// রান করার নিয়ম: pnpm exec tsx prisma/seed-questions-physics-gaps.ts
// idempotent — টপিকের পুরনো MCQ মুছে নতুন করে বসাবে।
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

interface TopicQuestionSeed {
  topicName: string;
  subjectName: string; // topic name collision এড়াতে subject filter
  questions: QuestionSeed[];
}

const seedData: TopicQuestionSeed[] = [
  {
    topicName: "গ্যাসের গতিতত্ত্ব",
    subjectName: "পদার্থবিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "আদর্শ গ্যাস সমীকরণ কোনটি?",
        options: ["PV = nRT", "PV = nT/R", "P = nRTV", "V = nRT/P²"],
        correctAnswer: "PV = nRT",
        explanation:
          "আদর্শ গ্যাস সমীকরণ হলো PV = nRT, যেখানে P চাপ, V আয়তন, n মোল সংখ্যা, R সর্বজনীন গ্যাস ধ্রুবক ও T পরম তাপমাত্রা।",
        difficulty: "EASY",
      },
      {
        text: "স্থির তাপমাত্রায় নির্দিষ্ট ভরের গ্যাসের আয়তন ও চাপের মধ্যে সম্পর্ক নির্দেশ করে কোন সূত্র?",
        options: ["চার্লসের সূত্র", "বয়েলের সূত্র", "গে-লুসাকের সূত্র", "অ্যাভোগাড্রোর সূত্র"],
        correctAnswer: "বয়েলের সূত্র",
        explanation:
          "বয়েলের সূত্র অনুযায়ী স্থির তাপমাত্রায় নির্দিষ্ট ভরের গ্যাসের আয়তন তার চাপের ব্যস্তানুপাতিক (PV = ধ্রুবক)।",
        difficulty: "EASY",
      },
      {
        text: "একটি গ্যাসের প্রাথমিক চাপ ২×১০⁵ Pa এবং আয়তন ৪ লিটার। স্থির তাপমাত্রায় আয়তন ২ লিটারে সংকুচিত হলে নতুন চাপ কত হবে?",
        options: ["১×১০⁵ Pa", "২×১০⁵ Pa", "৪×১০⁵ Pa", "৮×১০⁵ Pa"],
        correctAnswer: "৪×১০⁵ Pa",
        explanation:
          "বয়েলের সূত্র অনুযায়ী P₁V₁=P₂V₂। (2×10⁵)(4) = P₂(2) থেকে P₂ = 4×10⁵ Pa।",
        difficulty: "MEDIUM",
      },
      {
        text: "গ্যাসের গতিতত্ত্ব অনুযায়ী PV এর রাশিমালা কোনটি?",
        options: ["PV = (1/2)mNc²", "PV = (1/3)mNc²", "PV = mNc²", "PV = (2/3)mNc²"],
        correctAnswer: "PV = (1/3)mNc²",
        explanation:
          "গ্যাসের গতিতত্ত্বের স্বীকার্য থেকে প্রতিপাদিত সমীকরণ PV = (1/3)mNc², যেখানে m প্রতি অণুর ভর, N অণুসংখ্যা, c² মূল গড় বর্গবেগ।",
        difficulty: "HARD",
      },
      {
        text: "গ্যাসের প্রতি অণুর গড় গতিশক্তি কোন রাশির উপর সরাসরি নির্ভরশীল?",
        options: ["গ্যাসের চাপ", "গ্যাসের আয়তন", "পরম তাপমাত্রা", "মোলার ভর"],
        correctAnswer: "পরম তাপমাত্রা",
        explanation:
          "গড় গতিশক্তি Ē = (3/2)k_BT সূত্র অনুযায়ী প্রতি অণুর গড় গতিশক্তি সরাসরি পরম তাপমাত্রার (T) সমানুপাতিক, যেখানে k_B বোল্টজম্যান ধ্রুবক।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "সরল ছন্দিত স্পন্দন গতি",
    subjectName: "পদার্থবিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "সরল ছন্দিত স্পন্দন গতিতে প্রত্যানয়ন বলের রাশিমালা কোনটি?",
        options: ["F = kx", "F = -kx", "F = kx²", "F = -kx²"],
        correctAnswer: "F = -kx",
        explanation:
          "SHM এ প্রত্যানয়ন বল F = -kx, ঋণাত্মক চিহ্ন নির্দেশ করে বলটি সবসময় সরণের বিপরীত দিকে (সাম্যাবস্থানের দিকে) কাজ করে।",
        difficulty: "EASY",
      },
      {
        text: "সরল দোলকের পর্যায়কালের সূত্র কোনটি?",
        options: ["T = 2π√(g/L)", "T = 2π√(L/g)", "T = π√(L/g)", "T = 2π(L/g)"],
        correctAnswer: "T = 2π√(L/g)",
        explanation: "সরল দোলকের পর্যায়কাল T = 2π√(L/g), যেখানে L দোলকের দৈর্ঘ্য ও g অভিকর্ষজ ত্বরণ।",
        difficulty: "EASY",
      },
      {
        text: "১ মিটার দৈর্ঘ্যের একটি সরল দোলকের পর্যায়কাল কত হবে (g=9.8 m/s² ধরে)?",
        options: ["১.০০ সেকেন্ড", "২.০১ সেকেন্ড", "৩.১৪ সেকেন্ড", "০.৫০ সেকেন্ড"],
        correctAnswer: "২.০১ সেকেন্ড",
        explanation: "T = 2π√(L/g) = 2π√(1/9.8) ≈ 2.01 সেকেন্ড।",
        difficulty: "MEDIUM",
      },
      {
        text: "সরল দোলকের পর্যায়কাল কোন রাশির উপর নির্ভর করে না?",
        options: ["দোলকের দৈর্ঘ্য", "অভিকর্ষজ ত্বরণ", "দোলকের ভর", "উভয়ই A ও B"],
        correctAnswer: "দোলকের ভর",
        explanation:
          "সরল দোলকের পর্যায়কাল T = 2π√(L/g) সূত্রে ভরের কোনো উপস্থিতি নেই — পর্যায়কাল শুধু দৈর্ঘ্য (L) ও অভিকর্ষজ ত্বরণের (g) উপর নির্ভরশীল, ভর বা বিস্তারের উপর নয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "স্প্রিং-ভর ব্যবস্থায় সাম্যাবস্থানে (x=0) কণার বেগ কীরূপ হয়?",
        options: ["শূন্য", "সর্বনিম্ন কিন্তু শূন্য নয়", "সর্বোচ্চ (v_max=Aω)", "ধ্রুব কিন্তু নির্দিষ্ট নয়"],
        correctAnswer: "সর্বোচ্চ (v_max=Aω)",
        explanation:
          "v = ±ω√(A²-x²) সূত্র অনুযায়ী x=0 (সাম্যাবস্থান) এ বেগ সর্বোচ্চ হয়: v_max = Aω, যেখানে A বিস্তার ও ω কৌণিক কম্পাঙ্ক।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "প্রক্ষেপক গতি",
    subjectName: "পদার্থবিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "প্রক্ষেপক গতিতে বস্তুর গতিপথ কী আকৃতির হয়?",
        options: ["সরলরৈখিক", "বৃত্তাকার", "প্যারাবোলা", "উপবৃত্তাকার"],
        correctAnswer: "প্যারাবোলা",
        explanation:
          "প্রক্ষেপক গতিতে আনুভূমিক বেগ ধ্রুব ও উল্লম্ব বেগ ক্রমাগত পরিবর্তিত হওয়ায় বস্তুর গতিপথ একটি প্যারাবোলা (পরাবৃত্ত) আকার ধারণ করে।",
        difficulty: "EASY",
      },
      {
        text: "প্রক্ষেপকের সর্বাধিক আনুভূমিক পাল্লা পেতে নিক্ষেপণ কোণ কত হওয়া উচিত?",
        options: ["৩০°", "৪৫°", "৬০°", "৯০°"],
        correctAnswer: "৪৫°",
        explanation:
          "R = u²sin2θ/g সূত্রে sin2θ সর্বোচ্চ (=1) হয় যখন 2θ=90°, অর্থাৎ θ=45° — তাই ৪৫° কোণে নিক্ষেপ করলে পাল্লা সর্বোচ্চ হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "একটি বস্তুকে ৪০ m/s আদিবেগে ভূমির সাথে ৩০° কোণে নিক্ষেপ করা হলো (g=10 m/s²)। বস্তুটির সর্বাধিক উচ্চতা কত হবে?",
        options: ["১০ মিটার", "২০ মিটার", "৪০ মিটার", "৮০ মিটার"],
        correctAnswer: "২০ মিটার",
        explanation:
          "H = u²sin²θ/2g = (40)²×(0.5)²/(2×10) = 1600×0.25/20 = 20 মিটার।",
        difficulty: "HARD",
      },
      {
        text: "প্রক্ষেপক গতিতে সর্বোচ্চ বিন্দুতে বস্তুর বেগের উল্লম্ব উপাংশ কত হয়?",
        options: ["সর্বোচ্চ", "শূন্য", "আদিবেগের সমান", "আনুভূমিক উপাংশের সমান"],
        correctAnswer: "শূন্য",
        explanation:
          "সর্বোচ্চ বিন্দুতে বস্তুর ঊর্ধ্বগামী গতি থেমে নিম্নগামী হওয়া শুরু করে, তাই ঐ মুহূর্তে উল্লম্ব বেগের উপাংশ শূন্য হয় (শুধু আনুভূমিক বেগ থাকে)।",
        difficulty: "MEDIUM",
      },
      {
        text: "প্রক্ষেপক গতিতে আনুভূমিক বেগের উপাংশ (ধ্রুব থাকার কারণ) নিচের কোনটি?",
        options: [
          "আনুভূমিক দিকে কোনো বল কাজ করে না",
          "আনুভূমিক দিকে অভিকর্ষজ বল কাজ করে",
          "বায়ুর বাধা আনুভূমিক বেগ বাড়ায়",
          "উল্লম্ব ও আনুভূমিক বেগ সবসময় সমান থাকে",
        ],
        correctAnswer: "আনুভূমিক দিকে কোনো বল কাজ করে না",
        explanation:
          "প্রক্ষেপক গতিতে একমাত্র ক্রিয়াশীল বল অভিকর্ষজ বল, যা সম্পূর্ণ উল্লম্ব দিকে কাজ করে। আনুভূমিক দিকে কোনো ত্বরণ সৃষ্টিকারী বল না থাকায় (বায়ুর বাধা উপেক্ষা করে) আনুভূমিক বেগ ধ্রুব থাকে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "তাপগতিবিদ্যার সূত্রাবলি",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "তাপগতিবিদ্যার প্রথম সূত্রের গাণিতিক রূপ কোনটি?",
        options: ["Q = ΔU + W", "Q = ΔU - W", "Q = W - ΔU", "ΔU = Q × W"],
        correctAnswer: "Q = ΔU + W",
        explanation:
          "তাপগতিবিদ্যার প্রথম সূত্র অনুযায়ী প্রদত্ত তাপ (Q) সিস্টেমের অভ্যন্তরীণ শক্তি বৃদ্ধি (ΔU) ও পরিপার্শ্বে কৃত কাজের (W) সমষ্টির সমান: Q = ΔU + W।",
        difficulty: "EASY",
      },
      {
        text: "সমোষ্ণ প্রক্রিয়ায় (Isothermal Process) গ্যাসের অভ্যন্তরীণ শক্তির পরিবর্তন কীরূপ হয়?",
        options: ["বৃদ্ধি পায়", "হ্রাস পায়", "অপরিবর্তিত থাকে (শূন্য)", "প্রথমে বাড়ে পরে কমে"],
        correctAnswer: "অপরিবর্তিত থাকে (শূন্য)",
        explanation:
          "সমোষ্ণ প্রক্রিয়ায় তাপমাত্রা ধ্রুব থাকে এবং আদর্শ গ্যাসের অভ্যন্তরীণ শক্তি শুধু তাপমাত্রার উপর নির্ভরশীল, তাই ΔU=0 হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "একটি গ্যাসকে ৮০০ জুল তাপ দেওয়া হলে এটি পরিপার্শ্বে ৩০০ জুল কাজ করে। গ্যাসের অভ্যন্তরীণ শক্তির পরিবর্তন কত?",
        options: ["৩০০ জুল", "৫০০ জুল", "৮০০ জুল", "১১০০ জুল"],
        correctAnswer: "৫০০ জুল",
        explanation: "ΔU = Q - W = 800 - 300 = 500 জুল।",
        difficulty: "MEDIUM",
      },
      {
        text: "সমআয়তন প্রক্রিয়ায় (Isochoric Process) গ্যাস কর্তৃক কৃত কাজের পরিমাণ কত?",
        options: ["সর্বোচ্চ", "শূন্য", "প্রদত্ত তাপের সমান", "ঋণাত্মক"],
        correctAnswer: "শূন্য",
        explanation:
          "সমআয়তন প্রক্রিয়ায় গ্যাসের আয়তনের কোনো পরিবর্তন হয় না, তাই গ্যাস কোনো কাজ করে না (W=0), ফলে প্রদত্ত সব তাপই অভ্যন্তরীণ শক্তি বৃদ্ধিতে ব্যয় হয় (ΔU=Q)।",
        difficulty: "HARD",
      },
      {
        text: "তাপগতিবিদ্যার দ্বিতীয় সূত্র অনুযায়ী কোনো তাপ ইঞ্জিনের কর্মদক্ষতা কখনো কত হতে পারে না?",
        options: ["০%", "৫০%", "১০০%", "৭৫%"],
        correctAnswer: "১০০%",
        explanation:
          "তাপগতিবিদ্যার দ্বিতীয় সূত্র অনুযায়ী কোনো তাপ ইঞ্জিন গৃহীত সমস্ত তাপকে সম্পূর্ণভাবে কাজে রূপান্তর করতে পারে না — কিছু তাপ অবশ্যই নিম্ন তাপমাত্রার আধারে বর্জিত হবে, তাই কর্মদক্ষতা কখনো ১০০% হতে পারে না।",
        difficulty: "MEDIUM",
      },
    ],
  },
];

async function main() {
  assertDestructiveSeedAllowed("seed-questions-physics-gaps.ts");
  console.log("🌱 Physics MCQ Gap Seeding শুরু হচ্ছে...\n");

  let totalCreated = 0;
  const topicsNotFound: string[] = [];

  for (const entry of seedData) {
    // ⚠️ subject filter সহ খোঁজা হচ্ছে যাতে "প্রক্ষেপক গতি" এর মতো
    // ডুপ্লিকেট টপিক নামের কারণে ভুল subject এর টপিক ম্যাচ না হয়
    const topic = await prisma.topic.findFirst({
      where: {
        name: entry.topicName,
        chapter: { subject: { name: entry.subjectName } },
      },
    });

    if (!topic) {
      topicsNotFound.push(`${entry.topicName} (${entry.subjectName})`);
      continue;
    }

    // আগের প্রশ্ন মুছে ফেলা হচ্ছে (idempotent রাখার জন্য)
    await prisma.question.deleteMany({ where: { topicId: topic.id } });

    await prisma.question.createMany({
      data: entry.questions.map((q) => ({
        topicId: topic.id,
        type: "MCQ" as const,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })),
    });

    console.log(`✅ ${entry.topicName} (${entry.subjectName}) — ${entry.questions.length}টি প্রশ্ন যোগ হলো`);
    totalCreated += entry.questions.length;
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
