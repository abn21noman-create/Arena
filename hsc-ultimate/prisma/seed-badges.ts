// ===================================================================
// Badge Seed Script — Gamification এর জন্য সব ব্যাজ তৈরি করে
// রান করার নিয়ম: pnpm db:seed-badges
// ===================================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const badges = [
  {
    code: "FIRST_STEP",
    name: "প্রথম পদক্ষেপ",
    nameEn: "First Step",
    description: "প্ল্যাটফর্মে যোগ দেওয়ার জন্য স্বাগতম ব্যাজ",
    iconEmoji: "🎯",
    criteria: "অ্যাকাউন্ট তৈরি করলে",
  },
  {
    code: "STREAK_3",
    name: "৩ দিনের ধারা",
    nameEn: "3-Day Streak",
    description: "টানা ৩ দিন পড়াশোনা করেছো",
    iconEmoji: "🔥",
    criteria: "৩ দিন টানা স্ট্রিক সম্পন্ন করলে",
  },
  {
    code: "STREAK_7",
    name: "৭ দিনের যোদ্ধা",
    nameEn: "7-Day Warrior",
    description: "টানা ৭ দিন পড়াশোনা করেছো, দারুণ অভ্যাস!",
    iconEmoji: "⚡",
    criteria: "৭ দিন টানা স্ট্রিক সম্পন্ন করলে",
  },
  {
    code: "STREAK_30",
    name: "৩০ দিনের চ্যাম্পিয়ন",
    nameEn: "30-Day Champion",
    description: "এক মাস টানা পড়াশোনা করেছো — অসাধারণ ডেডিকেশন!",
    iconEmoji: "👑",
    criteria: "৩০ দিন টানা স্ট্রিক সম্পন্ন করলে",
  },
  {
    code: "FIRST_TOPIC_MASTERED",
    name: "প্রথম মাস্টারি",
    nameEn: "First Mastery",
    description: "প্রথম টপিক আয়ত্ত করেছো",
    iconEmoji: "📖",
    criteria: "প্রথম টপিক MASTERED করলে",
  },
  {
    code: "TOPICS_MASTERED_10",
    name: "জ্ঞান পিপাসু",
    nameEn: "Knowledge Seeker",
    description: "১০টি টপিক আয়ত্ত করেছো",
    iconEmoji: "🧠",
    criteria: "১০টি টপিক MASTERED করলে",
  },
  {
    code: "FIRST_QUIZ",
    name: "প্রথম পরীক্ষা",
    nameEn: "First Quiz",
    description: "প্রথম প্র্যাকটিস কুইজ সম্পন্ন করেছো",
    iconEmoji: "✏️",
    criteria: "প্রথম quiz attempt সম্পন্ন করলে",
  },
  {
    code: "PERFECT_SCORE",
    name: "নিখুঁত স্কোর",
    nameEn: "Perfect Score",
    description: "একটা কুইজে ১০০% সঠিক উত্তর দিয়েছো",
    iconEmoji: "💯",
    criteria: "কোনো quiz এ 100% score পেলে",
  },
  {
    code: "QUIZ_MASTER_10",
    name: "কুইজ মাস্টার",
    nameEn: "Quiz Master",
    description: "১০টি প্র্যাকটিস কুইজ সম্পন্ন করেছো",
    iconEmoji: "🏅",
    criteria: "১০টি quiz attempt সম্পন্ন করলে",
  },
  {
    code: "FLASHCARD_50",
    name: "কার্ড সংগ্রাহক",
    nameEn: "Card Collector",
    description: "৫০টি ফ্ল্যাশকার্ড রিভিউ করেছো",
    iconEmoji: "🗂️",
    criteria: "৫০টি flashcard review সম্পন্ন করলে",
  },
  {
    code: "TASK_MASTER_10",
    name: "টাস্ক মাস্টার",
    nameEn: "Task Master",
    description: "১০টি টাস্ক সম্পন্ন করেছো",
    iconEmoji: "✅",
    criteria: "১০টি task সম্পন্ন করলে",
  },
  {
    code: "POMODORO_10",
    name: "ফোকাস চ্যাম্পিয়ন",
    nameEn: "Focus Champion",
    description: "১০টি পূর্ণ পোমোডোরো সেশন সম্পন্ন করেছো",
    iconEmoji: "🍅",
    criteria: "১০টি সম্পূর্ণ পোমোডোরো সেশন সম্পন্ন করলে",
  },
  {
    code: "LEVEL_5",
    name: "লেভেল ৫",
    nameEn: "Level 5",
    description: "লেভেল ৫ এ পৌঁছেছো",
    iconEmoji: "⭐",
    criteria: "লেভেল ৫ এ পৌঁছালে",
  },
  {
    code: "LEVEL_10",
    name: "লেভেল ১০",
    nameEn: "Level 10",
    description: "লেভেল ১০ এ পৌঁছেছো — তুমি একজন সিরিয়াস স্টুডেন্ট!",
    iconEmoji: "🌟",
    criteria: "লেভেল ১০ এ পৌঁছালে",
  },
];

async function main() {
  console.log("🌱 Badge Seeding শুরু হচ্ছে...\n");

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    });
    console.log(`✅ ${badge.iconEmoji} ${badge.name}`);
  }

  const count = await prisma.badge.count();
  console.log(`\n✅ মোট ${count}টি ব্যাজ তৈরি হয়েছে!`);
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
